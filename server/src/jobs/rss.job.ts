import cron from "node-cron";
import Parser from "rss-parser";
import crypto from "crypto";
import Agent from "../models/Agent";
import Article from "../models/Article";

const parser = new Parser({ timeout: 10000 });

// Map to track per-agent cron tasks so we can restart them when config changes
type ScheduledTask = ReturnType<typeof cron.schedule>;
const agentTasks = new Map<string, ScheduledTask>();

async function fetchAgent(agent: any) {
  try {
    const feed = await parser.parseURL(agent.rssUrl as string);
    const ops = feed.items.map((item) => {
      const link = item.link || item.guid || "";
      const hash = crypto.createHash("md5").update(link).digest("hex");
      return {
        updateOne: {
          filter: { linkHash: hash },
          update: {
            $setOnInsert: {
              title: item.title || "Untitled",
              description: item.contentSnippet || item.summary || "",
              link,
              linkHash: hash,
              publicationDate: item.pubDate ? new Date(item.pubDate) : new Date(),
              category: agent.category,
              sourceAgent: agent._id
            }
          },
          upsert: true
        }
      };
    });

    if (ops.length > 0) {
      await Article.bulkWrite(ops, { ordered: false });
      console.log(`[RSS] ${agent.name}: stored/updated ${ops.length} items`);
    }
  } catch (err: any) {
    // Isolated error — does not affect other agents
    console.error(`[RSS] Agent "${agent.name}" failed: ${err.message}`);
  }
}

// Convert fetchInterval (minutes) to a cron expression
function intervalToCron(minutes: number): string {
  if (!minutes || minutes < 1) return "*/5 * * * *";
  if (minutes < 60) return `*/${minutes} * * * *`;
  const hours = Math.floor(minutes / 60);
  return `0 */${hours} * * *`;
}

async function scheduleAgents() {
  // Stop all existing tasks
  agentTasks.forEach((task) => task.stop());
  agentTasks.clear();

  const agents = await Agent.find({ active: true });

  // Group agents by their fetch interval to batch them into shared cron jobs
  const intervalMap = new Map<number, any[]>();
  for (const agent of agents) {
    const interval = (agent as any).fetchInterval || 5;
    if (!intervalMap.has(interval)) intervalMap.set(interval, []);
    intervalMap.get(interval)!.push(agent);
  }

  intervalMap.forEach((agentGroup, interval) => {
    const cronExpr = intervalToCron(interval);
    const task = cron.schedule(cronExpr, async () => {
      for (const agent of agentGroup) {
        await fetchAgent(agent);
      }
    });
    // Use interval as key (multiple agents share a task when same interval)
    agentTasks.set(String(interval), task);
    console.log(`[RSS] Scheduled ${agentGroup.length} agent(s) every ${interval} min (${cronExpr})`);
  });
}

// Initial scheduling on startup (wait for DB to be ready)
setTimeout(scheduleAgents, 3000);

// Re-read agent config every hour to pick up admin changes
cron.schedule("0 * * * *", scheduleAgents);

export { scheduleAgents };
