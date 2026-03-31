import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../types";

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(user?.preferences ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (cat: string) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      setError("Please select at least one category");
      return;
    }
    setLoading(true);
    try {
      const res = await userAPI.updatePreferences(selected);
      updateUser({ ...user!, preferences: res.data.preferences });
      navigate("/feed");
    } catch {
      setError("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">What interests you?</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Select your favourite topics to personalise your feed
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-8">
          {CATEGORIES.map((cat) => {
            const active = selected.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-blue-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={loading || selected.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "Saving…" : `Continue with ${selected.length} topic${selected.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
