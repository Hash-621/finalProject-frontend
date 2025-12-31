// app/community/free/page.tsx
"use client";

import CommonBoardList from "@/components/community/CommunityBoardList";

export default function FreeBoardList() {
  return (
    <CommonBoardList
      theme="green"
      title="자유게시판"
      description="대전 시민들의 솔직하고 담백한 이야기"
      headerImage="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1920"
      apiEndpoint="/community/free"
      writeLink="/community/write"
      emptyMessage="첫 번째 이야기의 주인공이 되어보세요!"
    />
  );
}
