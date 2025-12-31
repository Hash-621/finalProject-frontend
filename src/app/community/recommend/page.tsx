"use client";

import CommonBoardList from "@/components/community/CommunityBoardList";

export default function RecommendBoardList() {
  return (
    <CommonBoardList
      theme="blue"
      title="추천게시판"
      description="나만 알기 아까운 대전의 명소와 맛집 공유"
      headerImage="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920"
      apiEndpoint="/community/recommend"
      writeLink="/community/write?category=RECOMMEND"
      emptyMessage="멋진 장소를 가장 먼저 추천해보세요!"
      badgeText="Local Pick"
    />
  );
}
