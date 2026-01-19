export interface PostData {
  id: number;
  userId: string;
  category: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  userNickname: string;
  likeCount?: number;
}

export interface SubPostData {
  id: number;
  title: string;
  userNickname: string;
  createdAt: string;
  viewCount: number;
  commentCount?: number;
  filePath?: string;
}

export interface CommonBoardListProps {
  theme: "green" | "slate";
  title: string;
  description: string;
  headerImage: string;
  apiEndpoint: string;
  writeLink: string;
  emptyMessage: string;
  badgeText?: string;
}

export interface PostItem {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  userId?: string;
  viewCount?: number;
  updatedAt?: string;
  userNickname?: string;
}
