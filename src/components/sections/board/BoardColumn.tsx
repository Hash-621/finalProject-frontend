// 1. "use client": 이 파일은 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (useEffect, useState로 데이터를 fetching하고 상태를 관리해야 하니까요.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import React, { useEffect, useState } from "react"; // React 훅 (상태, 이펙트)
import Link from "next/link"; // 페이지 이동 링크
import api from "@/api/axios"; // API 통신 모듈
import { PostData } from "@/types/board"; // 게시글 데이터 타입 정의
import { PostCard } from "@/components/sections/board/PostCard"; // 게시글 하나를 그리는 카드 컴포넌트

// --- [Props 정의] ---
// 부모 컴포넌트에게 받아야 할 데이터의 규칙을 정합니다.
interface BoardColumnProps {
  title: string; // 게시판 제목 (예: "공지사항", "자유게시판")
  posts: PostData[]; // (사용 안 함 - 내부에서 fetch 하므로 삭제 가능하지만 인터페이스 유지를 위해 둠)
  loading: boolean; // (사용 안 함 - 내부 상태 사용)
  type: "free" | "notice"; // 게시판 종류 ("free" 또는 "notice"만 가능)
  cardClassName?: string; // 카드 스타일 커스터마이징용 (선택 사항)
}

// ==================================================================
// [Main Component] 게시판 컬럼 컴포넌트 시작
// ==================================================================
export const BoardColumn = ({
  title,
  type,
  cardClassName,
}: BoardColumnProps) => {
  // --- [State] 상태 관리 ---
  const [posts, setPosts] = useState<PostData[]>([]); // 게시글 목록 저장
  const [loading, setLoading] = useState(true); // 데이터 로딩 중인지 여부

  // 게시판 타입이 공지사항(notice)인지 확인 (디자인 분기용)
  const isBest = type === "notice";

  // --- [Effect] 데이터 가져오기 ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true); // 로딩 시작

        // 타입에 따라 요청할 API 주소 결정
        const endpoint =
          type === "free" ? "/community/free" : "/community/notice";

        // 서버에 GET 요청 전송
        const response = await api.get(endpoint);

        // 응답 데이터 구조에 맞게 처리 (배열이 바로 오거나, data 속성 안에 있거나)
        const rawData = response.data;
        const finalData = Array.isArray(rawData) ? rawData : rawData.data || [];

        // 최신 글 5개만 잘라서 저장
        setPosts(finalData.slice(0, 5));
      } catch (error: any) {
        // 에러 발생 시 콘솔에 로그 출력 (사용자에게는 빈 목록이 보임)
        console.error(
          `${title} 데이터 로드 실패:`,
          error.response?.data || error.message
        );
      } finally {
        setLoading(false); // 성공하든 실패하든 로딩 종료
      }
    };

    fetchPosts();
  }, [type, title]); // type이나 title이 바뀌면 데이터를 다시 가져옴

  // -----------------------------------------------------------
  // [Render] 화면 그리기 시작
  // -----------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* --- [Header] 상단 제목 및 더보기 링크 --- */}
      <div className="flex items-end justify-between px-2">
        <div>
          {/* 게시판 종류 뱃지 (깜빡이는 점 포함) */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
              isBest
                ? "bg-slate-100 text-slate-700" // 공지사항: 회색 테마
                : "bg-green-100 text-green-700" // 자유게시판: 초록색 테마
            }`}
          >
            {/* 깜빡이는 점 애니메이션 */}
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBest ? "bg-slate-400" : "bg-green-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBest ? "bg-slate-500" : "bg-green-500"
                }`}
              ></span>
            </span>
            <p className="uppercase">
              {isBest ? "Official Notice" : "Community"}
            </p>
          </div>

          {/* 게시판 제목 (큰 글씨) */}
          <h3 className="text-4xl font-bold text-slate-900 tracking-tighter">
            {title}
          </h3>
        </div>

        {/* '전체 보기' 링크 */}
        <Link
          href={`/community/${type}`} // 해당 게시판 목록 페이지로 이동
          className="text-[11px] font-bold text-slate-300 hover:text-slate-600 tracking-widest transition-colors"
        >
          SEE ALL
        </Link>
      </div>

      {/* --- [List] 게시글 목록 영역 --- */}
      <div className="space-y-4">
        {loading
          ? // 로딩 중일 때: 스켈레톤 UI (회색 박스 5개) 표시
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-${type}-${i}`}
                  className="h-[88px] bg-white border border-slate-50 rounded-[1.8rem] animate-pulse"
                />
              ))
          : // 로딩 완료 시: 실제 게시글 목록 표시
            posts.map((post) => (
              <PostCard
                key={`${type}-${post.id}`} // 고유 키값 설정
                post={post} // 게시글 데이터 전달
                type={type} // 게시판 타입 전달
                className={cardClassName} // 추가 스타일 전달
              />
            ))}

        {/* 로딩 끝났는데 글이 하나도 없을 때 안내 메시지 */}
        {!loading && posts.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-sm">
            게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

// 초기화 (Mount): 컴포넌트가 화면에 그려지면서 type이 "free"(자유)인지 "notice"(공지)인지 확인합니다.

// 데이터 요청 (Fetch):

// useEffect가 실행되어 서버에 "최신 글 줘!" 하고 요청을 보냅니다.

// 응답이 오기 전까지는 loading 상태가 true입니다.

// 로딩 화면 (Skeleton):

// 데이터가 아직 없으므로, 회색 박스 5개가 깜빡거리는 스켈레톤 애니메이션을 보여줍니다. (사용자가 "아, 뭔가 불러오고 있구나" 하고 인지함)

// 데이터 수신 및 렌더링:

// 서버에서 글 목록을 받으면 loading을 false로 바꾸고 posts에 데이터를 저장합니다.

// PostCard 컴포넌트를 이용해 실제 글 제목, 작성자, 날짜 등을 예쁘게 보여줍니다.

// 만약 글이 하나도 없다면 "게시글이 없습니다."라고 안내합니다.

// 디자인 분기:

// 공지사항(notice)이면 회색 톤의 "Official Notice" 뱃지를 답니다.

// 자유게시판(free)이면 초록색 톤의 "Community" 뱃지를 답니다.
