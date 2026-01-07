"use client";

import CommonBoardList from "@/components/community/CommunityBoardList";

export default function NoticeBoardList() {
  return (
    <CommonBoardList
      theme="slate"
      title="공지사항"
      description="Local Hub의 새로운 소식과 주요 업데이트를 확인하세요."
      headerImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920"
      apiEndpoint="/community/notice"
      writeLink="/community/write?category=NOTICE"
      emptyMessage="아직 등록된 공지사항이 없습니다."
      badgeText="Official"
    />
  );
}
