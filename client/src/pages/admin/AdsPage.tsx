import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { adAdminAPI } from "../../api";
import type { Ad } from "../../types";
import { CATEGORIES } from "../../types";
import Spinner from "../../components/common/Spinner";

const EMPTY: Omit<Ad, "_id"> = {
  title: "",
  imageUrl: "",
  targetLink: "",
  category: "",
  active: true,
};

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Ad, "_id">>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await adAdminAPI.getAll();
      setAds(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await adAdminAPI.update(editId, form);
      } else {
        await adAdminAPI.create(form);
      }
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      fetchAds();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ad: Ad) => {
    setForm({ title: ad.title, imageUrl: ad.imageUrl, targetLink: ad.targetLink, category: ad.category ?? "", active: ad.active });
    setEditId(ad._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await adAdminAPI.delete(id);
    fetchAds();
  };

  const handleToggleActive = async (ad: Ad) => {
    await adAdminAPI.update(ad._id, { active: !ad.active });
    fetchAds();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ad Campaigns</h1>
        <button
          onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          + New Ad
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">{editId ? "Edit Ad" : "New Ad"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
              <input type="url" value={form.imageUrl} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target Link</label>
              <input required type="url" value={form.targetLink} onChange={(e) => setForm(f => ({ ...f, targetLink: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category (optional targeting)</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="adActive" checked={form.active} onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-blue-600" />
              <label htmlFor="adActive" className="text-sm text-gray-700">Active</label>
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

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Title", "Category", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ads.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No ads yet</td></tr>
              ) : ads.map(ad => (
                <tr key={ad._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{ad.title}</p>
                    <a href={ad.targetLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-xs">
                      {ad.targetLink}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ad.category || "All"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(ad)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${ad.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {ad.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(ad)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(ad._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
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
