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
  theme: "green" | "blue"; // 테마 색상 선택
  title: string; // 게시판 제목 (예: 자유게시판)
  description: string; // 게시판 설명
  headerImage: string; // 상단 배너 이미지 URL
  apiEndpoint: string; // 데이터를 가져올 API 주소
  writeLink: string; // 글쓰기 페이지 링크
  emptyMessage: string; // 게시글이 없을 때 문구
  badgeText?: string; // 리스트 아이템에 붙을 뱃지 텍스트 (옵션)
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
}
