// 1. "use client": 이 파일은 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (데이터를 가져오고, 화면을 동적으로 그리는 역할을 하기 때문입니다.)
"use client";

// 2. [Import] 우리가 만든 커스텀 훅을 가져옵니다.
// 이 훅은 "게시판 데이터(공지사항, 자유게시판)"를 서버에서 가져오는 로직을 담고 있습니다.
import { useBoardData } from "@/hooks/main/useBoardData";

// 3. [Import] 게시글 목록을 보여줄 기둥(컬럼) 컴포넌트를 가져옵니다.
// 이 컴포넌트는 제목과 글 목록을 받아서 실제 화면에 리스트를 그려줍니다.
import { BoardColumn } from "@/components/sections/board/BoardColumn";

// ==================================================================
// [Main Component] 게시판 섹션 컴포넌트 시작
// ==================================================================
export default function BoardSection() {
  // 4. [Style Constant] 카드에 적용할 호버(마우스 올림) 효과를 변수로 저장해둡니다.
  // Tailwind CSS 클래스들의 모음입니다.
  // - hover:shadow... : 마우스 올리면 그림자가 진하게 생김
  // - hover:-translate-y-1 : 마우스 올리면 카드가 위로 1단위 살짝 떠오름
  // - group-hover:border-green-200 : 마우스 올리면 테두리가 연두색으로 변함
  const CARD_EFFECT =
    "hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 group-hover:border-green-200";

  // 5. [Data Fetching] useBoardData 훅을 실행해서 필요한 데이터를 꺼내옵니다.
  // - freePosts: 자유게시판 글 목록
  // - noticePosts: 공지사항 글 목록
  // - loading: 데이터를 아직 불러오는 중인지 여부 (true/false)
  const { freePosts, noticePosts, loading } = useBoardData();

  // 6. [Render] 화면 그리기 시작
  return (
    // section 태그: 의미 있는 구역임을 나타냅니다.
    // - py-12: 위아래 여백을 넉넉히 줍니다.
    // - bg-gray-50/30: 배경색을 아주 연한 회색(투명도 30%)으로 깔아서 구역을 구분합니다.
    <section className="py-12 bg-gray-50/30">
      {/* 중앙 정렬 컨테이너: 내용이 너무 퍼지지 않게 최대 너비(7xl)를 잡습니다. */}
      <div className="max-w-7xl mx-auto px-6 lg:px-5">
        {/* 그리드 레이아웃: 화면 배치 설정 */}
        {/* - grid-cols-1: 모바일에서는 1줄에 1개씩 (세로 배치) */}
        {/* - lg:grid-cols-2: 큰 화면(PC)에서는 1줄에 2개씩 (가로 배치) */}
        {/* - gap-12: 두 컬럼 사이의 간격을 널찍하게(12) 띄웁니다. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* [Left Column] 자유게시판 영역 */}
          <BoardColumn
            title="자유게시판" // 화면에 표시될 제목
            posts={freePosts} // useBoardData에서 가져온 자유게시판 글 목록 전달
            loading={loading} // 로딩 상태 전달 (로딩 중이면 스켈레톤 UI 보여줌)
            type="free" // 게시판 타입 (아이콘이나 색상 분기용)
            cardClassName={CARD_EFFECT} // 아까 만들어둔 호버 효과 스타일 전달
          />

          {/* [Right Column] 공지사항 영역 */}
          <BoardColumn
            title="공지사항" // 화면에 표시될 제목
            posts={noticePosts} // 공지사항 글 목록 전달
            loading={loading} // 로딩 상태 전달
            type="notice" // 게시판 타입 (공지사항은 디자인이 다를 수 있음)
            cardClassName={CARD_EFFECT} // 호버 효과 스타일 전달
          />
        </div>
      </div>
    </section>
  );
}

// 데이터 배달 (useBoardData):

// 이 컴포넌트가 실행되자마자 useBoardData라는 훅(Hook)이 작동합니다.

// 백엔드 서버에게 "공지사항이랑 자유게시판 최신 글 좀 줘!"라고 요청하고, 데이터를 받아옵니다.

// 화면 분할 (Grid):

// 모바일: 화면이 좁으니 공지사항이 위, 자유게시판이 아래로 1열로 쌓입니다.

// PC: 화면이 넓으니 공지사항(왼쪽)과 자유게시판(오른쪽)이 2열로 나란히 섭니다.

// 스타일 주입 (CARD_EFFECT):

// 각 게시글 카드에 마우스를 올렸을 때(Hover) 살짝 떠오르거나 그림자가 생기는 고급진 효과를 미리 변수로 만들어 둡니다.

// 하위 전달 (BoardColumn):

// 준비된 데이터(freePosts, noticePosts)를 자식 컴포넌트인 BoardColumn에게 "이거 예쁘게 그려줘~" 하고 넘겨줍니다.
