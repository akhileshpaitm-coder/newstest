import { useEffect, useState } from "react";
import { agentAdminAPI, adAdminAPI } from "../../api";

export default function AdminDashboard() {
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [adCount, setAdCount] = useState<number | null>(null);

  useEffect(() => {
    agentAdminAPI.getAll().then((r) => setAgentCount(r.data.length)).catch(() => {});
    adAdminAPI.getAll().then((r) => setAdCount(r.data.length)).catch(() => {});
  }, []);

  const cards = [
    { label: "RSS Agents", value: agentCount, color: "blue" },
    { label: "Ad Campaigns", value: adCount, color: "amber" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-4xl font-bold text-${color}-600 mt-2`}>
              {value === null ? "–" : value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
