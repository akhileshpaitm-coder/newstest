import { useEffect, useRef, useCallback } from "react";
import type { FeedItem, Article, Ad } from "../../types";
import ArticleCard from "./ArticleCard";
import AdCard from "./AdCard";
import Spinner from "../common/Spinner";

interface Props {
  items: FeedItem[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  onLoadMore: () => void;
  savedIds?: Set<string>;
  onSaveToggle?: (id: string) => void;
}

export default function FeedList({
  items,
  hasMore,
  loading,
  error,
  onLoadMore,
  savedIds,
  onSaveToggle,
}: Props) {
  const sentinel = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (!loading && items.length === 0 && !error) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No articles yet</p>
        <p className="text-sm mt-1">Check back soon or adjust your preferences</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        if (item.type === "article") {
          const article = item.data as Article;
          return (
            <ArticleCard
              key={article._id + idx}
              article={article}
              isSaved={savedIds?.has(article._id)}
              onSaveToggle={onSaveToggle}
            />
          );
        }
        const ad = item.data as Ad;
        return <AdCard key={ad._id + idx} ad={ad} />;
      })}

      {error && (
        <div className="text-center py-4 text-red-500 text-sm">{error}</div>
      )}

      {loading && <Spinner />}

      <div ref={sentinel} className="h-4" />

      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-4">You've reached the end</p>
      )}
    </div>
  );
}
