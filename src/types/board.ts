export interface PostData {
  id: number;
  userId: string;
  category: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
}
