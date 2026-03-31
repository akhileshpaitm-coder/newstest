import { useState, useCallback } from "react";
import { feedAPI } from "../api";
import type { FeedItem } from "../types";

const LIMIT = 10;

export function useFeed(category: string) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  const loadMore = useCallback(
    async (pageNum: number) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const res = await feedAPI.getFeed({ page: pageNum, limit: LIMIT, category });
        const { items: newItems, hasMore: more } = res.data;
        setItems((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));
        setHasMore(more);
        setPage(pageNum);
      } catch {
        setError("Failed to load feed");
      } finally {
        setLoading(false);
      }
    },
    [category, loading]
  );

  return { items, page, hasMore, loading, error, loadMore, reset };
}
