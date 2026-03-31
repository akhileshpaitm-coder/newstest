import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFeed } from "../../hooks/useFeed";
import FeedList from "../../components/feed/FeedList";
import { userAPI } from "../../api";
import type { Article } from "../../types";

const STATIC_TABS = ["For You", "All", "Saved"];

export default function FeedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("For You");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Compute the category param sent to the API
  const category =
    activeTab === "For You" ? "for-you" :
    activeTab === "All" ? "all" :
    activeTab === "Saved" ? "__saved__" :
    activeTab;

  const { items, hasMore, loading, error, loadMore, reset } = useFeed(category);

  const tabs = [...STATIC_TABS, ...(user?.preferences ?? [])];

  // Load initial page when tab changes
  useEffect(() => {
    if (activeTab === "Saved") {
      fetchSaved();
      return;
    }
    reset();
    loadMore(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleLoadMore = useCallback(() => {
    const nextPage = Math.ceil(items.length / 10) + 1;
    loadMore(nextPage);
  }, [items.length, loadMore]);

  const fetchSaved = async () => {
    setSavedLoading(true);
    try {
      const res = await userAPI.getSaved();
      setSavedArticles(res.data);
      setSavedIds(new Set(res.data.map((a: Article) => a._id)));
    } finally {
      setSavedLoading(false);
    }
  };

  const handleSaveToggle = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">NewsApp</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "Saved" ? (
          savedLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : savedArticles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No saved articles yet</p>
              <p className="text-sm mt-1">Bookmark articles to read them later</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedArticles.map((article) => (
                <div key={article._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-2">
                    {article.category}
                  </span>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-semibold text-gray-900 hover:text-blue-600 leading-snug line-clamp-2"
                  >
                    {article.title}
                  </a>
                  {article.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{article.description}</p>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <FeedList
            items={items}
            hasMore={hasMore}
            loading={loading}
            error={error}
            onLoadMore={handleLoadMore}
            savedIds={savedIds}
            onSaveToggle={handleSaveToggle}
          />
        )}
      </main>
    </div>
  );
}
