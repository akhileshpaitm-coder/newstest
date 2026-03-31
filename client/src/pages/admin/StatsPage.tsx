import { useEffect, useState } from "react";
import { adAdminAPI } from "../../api";
import type { AdStat } from "../../types";
import Spinner from "../../components/common/Spinner";

export default function StatsPage() {
  const [stats, setStats] = useState<AdStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adAdminAPI.getStats()
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = stats.reduce((s, r) => s + r.totalViews, 0);
  const totalClicks = stats.reduce((s, r) => s + r.totalClicks, 0);
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Unique Views", value: totalViews, color: "blue" },
              { label: "Total Clicks", value: totalClicks, color: "green" },
              { label: "Overall CTR", value: `${overallCtr}%`, color: "purple" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Per-ad breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Ad Title", "Status", "Unique Views", "Clicks", "CTR"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No campaign data yet</td></tr>
                ) : stats.map(({ ad, totalViews, totalClicks, ctr }) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{ad.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ad.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {ad.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{totalViews}</td>
                    <td className="px-4 py-3 text-gray-700">{totalClicks}</td>
                    <td className="px-4 py-3 font-semibold text-purple-600">{ctr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
