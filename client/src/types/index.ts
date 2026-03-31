export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  preferences: string[];
  savedArticles?: string[];
}

export interface Article {
  _id: string;
  title: string;
  description: string;
  link: string;
  publicationDate: string;
  category: string;
  sourceAgent?: string;
}

export interface Ad {
  _id: string;
  title: string;
  imageUrl: string;
  targetLink: string;
  category?: string;
  active: boolean;
}

export interface FeedItem {
  type: "article" | "ad";
  data: Article | Ad;
}

export interface FeedResponse {
  items: FeedItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface Agent {
  _id: string;
  name: string;
  rssUrl: string;
  category: string;
  fetchInterval: number;
  active: boolean;
}

export interface AdStat {
  ad: { id: string; title: string; active: boolean; imageUrl: string };
  totalViews: number;
  totalClicks: number;
  ctr: string;
}

export const CATEGORIES = [
  "Technology",
  "Business",
  "Finance",
  "World",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
];
