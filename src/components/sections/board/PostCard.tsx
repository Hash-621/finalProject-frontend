// 1. "use client": 이 컴포넌트는 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (Link를 통한 내비게이션이나 Hover 효과 등이 포함되어 있기 때문입니다.)
"use client";

// 2. Next.js의 링크 컴포넌트를 가져옵니다. 페이지 이동 시 새로고침 없이 부드럽게 넘어가게 해줍니다.
import Link from "next/link";
// 3. 게시글 데이터의 모양(타입)을 정의해둔 파일에서 가져옵니다. (TypeScript용)
import { PostData } from "@/types/board";
// 4. 화면을 꾸며줄 예쁜 아이콘들을 lucide-react 라이브러리에서 가져옵니다.
import {
  MessageSquareText, // 말풍선 (일반글 아이콘)
  ThumbsUp, // 따봉 (사용 안 함, 추후 확장 가능성)
  Eye, // 눈 (조회수 아이콘)
  Clock, // 시계 (작성일 아이콘)
  User, // 사람 (작성자 아이콘)
  ChevronRight, // 오른쪽 화살표 (이동 버튼)
  Megaphone, // 확성기 (공지사항 아이콘)
} from "lucide-react";

// 5. [Helper Function] 날짜 포맷팅 함수
// 서버에서 온 "2023-10-25T12:00:00" 같은 날짜 문자열을 "23. 10. 25." 처럼 보기 좋게 바꿔줍니다.
const formatDate = (dateString: string) => {
  if (!dateString) return "-"; // 날짜 없으면 하이픈 표시
  const date = new Date(dateString);
  // 한국 스타일 날짜 형식으로 변환 (YY. MM. DD.)
  return date.toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
};

// 6. [Style Constant] 카드의 기본 스타일을 상수로 정의합니다.
// - relative: 내부 절대 위치 요소 기준점
// - flex: 가로 배치
// - transition...: 마우스 올렸을 때 부드럽게 변하는 애니메이션 설정
// - hover...: 마우스 올렸을 때 그림자가 생기고 살짝 위로 뜨는 효과
const BASE_STYLE =
  "relative flex items-center justify-between bg-white border border-slate-100 rounded-[1.2rem] md:rounded-[1.8rem] transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-0.5";

// ==================================================================
// [Main Component] 게시글 카드 컴포넌트 시작
// ==================================================================
export const PostCard = ({
  post, // 게시글 데이터 객체 (제목, 내용, 작성자 등)
  className, // 외부에서 추가로 스타일을 줄 때 사용
  type, // 게시판 종류 ("free", "notice", "recommend" 등)
}: {
  post: PostData;
  className?: string;
  type: string;
}) => {
  // 공지사항이나 추천 게시판인지 확인합니다. (아이콘과 색상을 다르게 주기 위함)
  const isRecommendBoard = type === "recommend" || type === "notice";

  return (
    // Link 태그로 카드 전체를 감싸서 어디를 눌러도 상세 페이지로 이동하게 합니다.
    // group: 자식 요소들이 부모(이 태그)의 상태(hover 등)를 감지할 수 있게 묶어줍니다.
    <Link href={`/community/${type}/${post.id}`} className="group block">
      {/* 카드 전체 박스 (위에서 정의한 기본 스타일 + 외부 스타일 합체) */}
      <div className={`${BASE_STYLE} ${className}`}>
        {/* 왼쪽 섹션: 아이콘 + 텍스트 정보 */}
        {/* flex-1 min-w-0: 남은 공간을 다 차지하되, 내용이 길어도 박스를 뚫고 나가지 않게 함 */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 p-4 md:p-5">
          {/* (1) 게시판 아이콘 박스 */}
          <div
            className={`flex shrink-0 w-9 h-9 md:w-11 md:h-11 items-center justify-center rounded-xl md:rounded-2xl transition-all duration-300 ${
              isRecommendBoard
                ? "bg-blue-50 text-slate-500 group-hover:bg-slate-500 group-hover:text-white" // 공지: 파란 배경 -> 회색 배경(호버 시)
                : "bg-slate-50 text-green-400 group-hover:bg-green-500 group-hover:text-white" // 일반: 회색 배경 -> 초록 배경(호버 시)
            }`}
          >
            {/* 공지면 확성기, 아니면 말풍선 아이콘 렌더링 */}
            {isRecommendBoard ? (
              <Megaphone className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.2} />
            ) : (
              <MessageSquareText
                className="w-4 h-4 md:w-5 md:h-5"
                strokeWidth={2.2}
              />
            )}
          </div>

          {/* (2) 텍스트 정보 영역 (제목, 작성자, 날짜) */}
          <div className="flex-1 min-w-0">
            {/* 제목: line-clamp-1 덕분에 제목이 길어도 한 줄로 줄여지고 '...' 처리됨 */}
            {/* group-hover:text-green-600: 마우스 올리면 제목 색이 초록색으로 변함 */}
            <h4 className="text-[14px] md:text-[15px] font-bold text-slate-800 line-clamp-1 group-hover:text-green-600 mb-1 transition-colors">
              {post.title}
            </h4>

            {/* 메타 데이터: 작성자명, 구분점, 작성일 */}
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[12px] text-slate-400 font-medium">
              {/* 작성자 정보 */}
              <span className="flex items-center gap-1 truncate max-w-20 md:max-w-none">
                <User
                  className="shrink-0 w-3 h-3 md:w-3.5 md:h-3.5"
                  strokeWidth={2.5}
                />{" "}
                <span className="block truncate max-w-[5em] sm:max-w-none pr-0.5">
                  {post.userNickname}
                </span>
              </span>

              {/* 작은 점 (구분선) */}
              <span className="w-0.5 h-0.5 bg-slate-200 rounded-full" />

              {/* 작성일 정보 */}
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock
                  className="w-3 h-3 md:w-3.5 md:h-3.5"
                  strokeWidth={2.5}
                />{" "}
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 오른쪽 섹션: 조회수 + 이동 화살표 */}
        <div className="flex items-center gap-2 md:gap-4 pr-4 md:pr-6 shrink-0">
          {/* (3) 조회수 뱃지 */}
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
            <Eye
              className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-300"
              strokeWidth={2.5}
            />
            <span className="text-[10px] md:text-[11px] font-bold">
              {post.viewCount || 0} {/* 조회수가 없으면 0 표시 */}
            </span>
          </div>

          {/* (4) 화살표 버튼 (모바일 XS 사이즈 이하에서는 숨김 hidden xs:flex) */}
          <div className="hidden xs:flex w-7 h-7 md:w-8 md:h-8 rounded-full border border-slate-100 items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
            <ChevronRight
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              strokeWidth={3}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

// 데이터 수신: 부모 컴포넌트(게시판 리스트)로부터 "이 글 보여줘!"라며 post 데이터(제목: "안녕하세요", 작성자: "홍길동" 등)와 type(게시판 종류)을 받습니다.

// 판단 (공지사항인가?): type이 "notice"나 "recommend"면, 왼쪽 아이콘을 확성기(Megaphone) 모양으로 바꾸고 배경색을 다르게 칠할 준비를 합니다.

// 화면 그리기:

// 왼쪽: 확성기 또는 말풍선 아이콘이 둥근 사각형 안에 예쁘게 자리 잡습니다.

// 가운데: 글 제목이 진한 글씨로 보이고, 그 아래에 작게 작성자와 날짜가 회색 글씨로 표시됩니다.

// 오른쪽: 눈 모양 아이콘과 함께 조회수(100)가 보이고, 맨 끝엔 화살표(>) 버튼이 대기합니다.

// 상호작용 (Hover):

// 사용자가 마우스를 올리면, 카드 전체가 살짝 위로 떠오릅니다(-translate-y).

// 왼쪽 아이콘 박스의 색이 진해지고(초록색 또는 회색), 오른쪽 끝 화살표가 검은색으로 변하면서 "눌러보세요!"라는 느낌을 줍니다.

// 클릭: 카드를 클릭하면 해당 글의 상세 페이지(/community/free/123)로 이동합니다.
