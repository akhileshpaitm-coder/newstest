import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { agentAdminAPI } from "../../api";
import type { Agent } from "../../types";
import { CATEGORIES } from "../../types";
import Spinner from "../../components/common/Spinner";

const EMPTY: Omit<Agent, "_id"> = {
  name: "",
  rssUrl: "",
  category: CATEGORIES[0],
  fetchInterval: 30,
  active: true,
};

const DEFAULT_AGENTS = [
  { name: "BBC Top Stories", rssUrl: "http://feeds.bbci.co.uk/news/rss.xml", category: "World", fetchInterval: 30, active: true },
  { name: "NYT World News", rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "World", fetchInterval: 60, active: true },
  { name: "CNN Top Stories", rssUrl: "http://rss.cnn.com/rss/edition.rss", category: "World", fetchInterval: 30, active: true },
  { name: "TechCrunch", rssUrl: "https://techcrunch.com/feed/", category: "Technology", fetchInterval: 30, active: true },
  { name: "The Verge", rssUrl: "https://www.theverge.com/rss/index.xml", category: "Technology", fetchInterval: 60, active: true },
  { name: "Wired", rssUrl: "https://www.wired.com/feed/rss", category: "Technology", fetchInterval: 60, active: true },
  { name: "WSJ Business", rssUrl: "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml", category: "Finance", fetchInterval: 60, active: true },
  { name: "NYT Business", rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", category: "Business", fetchInterval: 60, active: true },
  { name: "CNBC Top News", rssUrl: "https://search.cnbc.com/rs/search/combinedcms/view.xml?profile=120000000&id=100003114", category: "Business", fetchInterval: 30, active: true },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Agent, "_id">>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await agentAdminAPI.getAll();
      setAgents(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await agentAdminAPI.update(editId, form);
      } else {
        await agentAdminAPI.create(form);
      }
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      fetchAgents();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setForm({ name: agent.name, rssUrl: agent.rssUrl, category: agent.category, fetchInterval: agent.fetchInterval, active: agent.active });
    setEditId(agent._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agent?")) return;
    await agentAdminAPI.delete(id);
    fetchAgents();
  };

  const handleToggleActive = async (agent: Agent) => {
    await agentAdminAPI.update(agent._id, { active: !agent.active });
    fetchAgents();
  };

  const seedDefaults = async () => {
    setSaving(true);
    try {
      for (const a of DEFAULT_AGENTS) {
        await agentAdminAPI.create(a);
      }
      setSeeded(true);
      fetchAgents();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">RSS Agents</h1>
        <div className="flex gap-2">
          {!seeded && (
            <button
              onClick={seedDefaults}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
            >
              Seed Default Feeds
            </button>
          )}
          <button
            onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            + New Agent
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">{editId ? "Edit Agent" : "New Agent"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">RSS URL</label>
              <input required type="url" value={form.rssUrl} onChange={(e) => setForm(f => ({ ...f, rssUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fetch Interval (minutes)</label>
              <input type="number" min={1} required value={form.fetchInterval} onChange={(e) => setForm(f => ({ ...f, fetchInterval: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-blue-600" />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? "Saving…" : editId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Category", "Interval", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agents.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No agents yet</td></tr>
              ) : agents.map(agent => (
                <tr key={agent._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{agent.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{agent.rssUrl}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{agent.category}</td>
                  <td className="px-4 py-3 text-gray-600">{agent.fetchInterval}m</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(agent)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${agent.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {agent.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(agent)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(agent._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
