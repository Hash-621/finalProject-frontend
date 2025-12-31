// types/post.ts
export interface PostItem {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  userId?: string;
  viewCount?: number;
  updatedAt?: string;
}
