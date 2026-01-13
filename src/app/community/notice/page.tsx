// 1. "use client": 클라이언트 컴포넌트 선언
"use client";

// 2. 만능 게시판 목록 컴포넌트 불러오기
import CommonBoardList from "@/components/community/CommunityBoardList";

// 3. 페이지 메인 함수
export default function NoticeBoardList() {
  // (팁) 실제로는 여기서 '현재 로그인한 사람이 관리자인지' 확인하는 로직이 들어갈 수 있습니다.
  // const isAdmin = useCheckAdmin();

  return (
    // 4. CommonBoardList 실행 및 설정값 전달
    <CommonBoardList
      // --- 기존 설정 유지 ---
      theme="slate" // 회색 테마 (차분함)
      title="공지사항"
      description="서비스의 새로운 소식과 주요 업데이트를 확인하세요."
      // 배경 이미지는 조금 더 어두운 톤이나 단색에 가까운 오피스 이미지를 추천합니다.
      headerImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920"
      apiEndpoint="/community/notice"
      // [수정 포인트 1] 글쓰기 버튼 제어
      // 공지사항은 보통 '관리자'만 쓸 수 있습니다.
      // 만약 일반 유저에게는 버튼을 숨기고 싶다면, 이 props를 조건부로 넘겨줄 수 있습니다.
      writeLink="/community/write?category=NOTICE"
      emptyMessage="아직 등록된 공지사항이 없습니다."
      badgeText="Official"
      // --- 👇 여기부터 공지사항 전용으로 추가된 설정들입니다 👇 ---

      // [추가 1] 뷰 모드 설정: 'list'
      // 자유게시판은 카드형(grid)이 예쁘지만, 공지사항은 목록형(list)이 훨씬 신뢰감을 줍니다.
      viewType="list"
      // [추가 2] 썸네일 숨기기: true
      // 공지사항은 이미지보다 '텍스트'가 중요합니다. 목록에서 이미지를 빼서 깔끔하게 만듭니다.
      hideThumbnail={true}
      // [추가 3] 헤더 아이콘 추가
      // 제목 옆에 확성기 아이콘을 두어 시각적으로 주목도를 높입니다.
      headerIcon="📢"
      // [추가 4] 상단 고정(필독) 기능 활성화 지시
      // CommonBoardList 내부에서 'isPinned' 데이터가 있는 글을 상단에 고정하도록 지시합니다.
      showPinnedTop={true}
      // [추가 5] 날짜 표시 형식 강조
      // 공지사항은 '언제' 올라왔는지가 중요하므로 날짜 형식을 더 구체적으로 지정합니다.
      dateFormat="YYYY.MM.DD"
    />
  );
}
