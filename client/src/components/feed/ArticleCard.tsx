import { useState } from "react";
import type { Article } from "../../types";
import { userAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";

interface Props {
  article: Article;
  isSaved?: boolean;
  onSaveToggle?: (id: string) => void;
}

export default function ArticleCard({ article, isSaved, onSaveToggle }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(isSaved ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await userAPI.toggleSave(article._id);
      setSaved((v) => !v);
      onSaveToggle?.(article._id);
    } finally {
      setSaving(false);
    }
  };

  const pubDate = article.publicationDate
    ? new Date(article.publicationDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-2">
            {article.category}
          </span>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-semibold text-gray-900 hover:text-blue-600 leading-snug line-clamp-2 mb-1"
          >
            {article.title}
          </a>
          {article.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{article.description}</p>
          )}
          {pubDate && (
            <p className="text-xs text-gray-400 mt-2">{pubDate}</p>
          )}
        </div>
        {user && (
          <button
            onClick={handleSave}
            disabled={saving}
            title={saved ? "Remove bookmark" : "Bookmark"}
            className="flex-shrink-0 mt-1 text-gray-400 hover:text-blue-500 transition-colors"
          >
            {saved ? (
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
