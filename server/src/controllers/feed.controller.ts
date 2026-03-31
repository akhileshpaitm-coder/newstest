import Article from "../models/Article";
import Ad from "../models/Ad";
import User from "../models/User";

const AD_INJECTION_INTERVAL = 5; // inject 1 ad every N articles

export const getFeed = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const query: any = {};

    if (category === "for-you") {
      const user = await User.findById(req.user.id);
      if (user?.preferences?.length) {
        query.category = { $in: user.preferences };
      }
    } else if (category && category !== "all") {
      query.category = category;
    }

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ publicationDate: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Article.countDocuments(query)
    ]);

    // Pick ads relevant to the category (or any active ad when no category)
    const adQuery: any = { active: true };
    if (category && category !== "for-you" && category !== "all") {
      adQuery.$or = [{ category }, { category: null }, { category: "" }];
    }
    const ads = await Ad.find(adQuery).lean();

    const result: any[] = [];
    articles.forEach((article, index) => {
      result.push({ type: "article", data: article });
      if ((index + 1) % AD_INJECTION_INTERVAL === 0 && ads.length > 0) {
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        result.push({ type: "ad", data: randomAd });
      }
    });

    res.json({
      items: result,
      page: pageNum,
      limit: limitNum,
      total,
      hasMore: pageNum * limitNum < total
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
