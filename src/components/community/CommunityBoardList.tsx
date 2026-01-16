// "use client": 이 컴포넌트는 브라우저에서 실행됩니다. (상태 관리, 클릭 이벤트 등이 필요하기 때문)
"use client";

// --- [라이브러리 임포트] ---
import React, { useEffect, useState } from "react"; // 리액트의 기본 훅(상태 관리, 수명 주기)을 가져옵니다.
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크 컴포넌트입니다.
import Image from "next/image"; // [추가] 리스트 뷰 썸네일용 이미지 컴포넌트
import api from "@/api/axios"; // 서버 통신을 위한 axios 인스턴스입니다.
// 게시글 데이터 타입(SubPostData)과 이 컴포넌트가 받을 설정값 타입(CommonBoardListProps)을 가져옵니다.
import { SubPostData, CommonBoardListProps } from "@/types/board";

// [추가] 쿠키와 유저 서비스 관련 기능을 가져옵니다. (로그인한 사람인지, 관리자인지 확인용)
import Cookies from "js-cookie";
import { userService } from "@/api/services";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// 화면을 꾸며줄 다양한 아이콘들을 가져옵니다.
import {
  User, // 작성자 아이콘
  Clock, // 날짜/시간 아이콘
  Eye, // 조회수 아이콘
  Search, // 검색 돋보기 아이콘
  PenTool, // 글쓰기 펜 아이콘
  MessageSquare, // 댓글 아이콘
  ChevronRight, // 오른쪽 화살표 (>)
  ChevronLeft, // 왼쪽 화살표 (<)
  Loader2, // 로딩 스피너
  ThumbsUp, // 따봉 아이콘 (데이터 없을 때 사용)
} from "lucide-react";

import Pagination from "@/components/common/Pagination";

const serverURL = process.env.NEXT_PUBLIC_API_URL;

// --- [테마 설정 객체] ---
// 'theme' 값(green 또는 slate)에 따라 사용할 CSS 클래스들을 미리 정의해둡니다.
const THEMES = {
  green: {
    bgDark: "bg-green-900",
    textMain: "text-green-600",
    textLight: "text-green-100",
    bgBadge: "bg-green-50",
    bar: "bg-green-500",
    button: "bg-green-600 hover:bg-green-700",
    shadow: "shadow-green-200",
    paginationActive: "bg-green-600 shadow-green-200",
    icon: "text-green-500",
  },
  slate: {
    bgDark: "bg-slate-900",
    textMain: "text-slate-600",
    textLight: "text-slate-100",
    bgBadge: "bg-slate-100",
    bar: "bg-slate-600",
    button: "bg-slate-800 hover:bg-slate-900",
    shadow: "shadow-slate-200",
    paginationActive: "bg-slate-800 shadow-slate-200",
    icon: "text-slate-500",
  },
};

// --- [타입 확장] ---
// 기존 types/board.ts에 아직 정의가 안 되어 있을 수 있으므로,
// 여기서 기존 Props 타입에 새로운 Props들을 합쳐줍니다(Intersection).
type ExtendedBoardListProps = CommonBoardListProps & {
  viewType?: "grid" | "list"; // 그리드형 vs 리스트형
  hideThumbnail?: boolean; // 썸네일 숨김 여부
  headerIcon?: string; // 헤더 아이콘 (예: 📢)
  showPinnedTop?: boolean; // 상단 고정 기능 활성화 여부
  dateFormat?: string; // 날짜 포맷 문자열
};

// --- [메인 컴포넌트 시작] ---
export default function CommunityBoardList({
  theme, // 테마 색상 ('green' | 'slate')
  title, // 게시판 제목 (예: "자유게시판")
  description, // 게시판 설명
  headerImage, // 헤더 배경 이미지 URL
  apiEndpoint, // 데이터를 가져올 API 주소
  writeLink, // 글쓰기 페이지 링크
  emptyMessage, // 데이터가 없을 때 보여줄 문구
  badgeText, // (옵션) 제목 옆에 붙일 뱃지 텍스트 (예: "Official")
  // 👇 [추가] 새로 들어온 설정값들 (기본값 설정)
  viewType = "grid",
  hideThumbnail = false,
  headerIcon,
  showPinnedTop = false,
  dateFormat,
}: ExtendedBoardListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // 1. 전달받은 theme('green' 등)에 맞는 스타일 꾸러미를 꺼냅니다.
  const styles = THEMES[theme] || THEMES.slate; // theme이 없을 경우 대비

  // --- [상태 관리 (State)] ---
  // 화면에 보여줄 게시글 목록입니다. (검색 필터링 결과가 여기 담깁니다)
  const [posts, setPosts] = useState<SubPostData[]>([]);
  // 검색을 취소했을 때 되돌리기 위한 '원본' 게시글 목록입니다.
  const [originalPosts, setOriginalPosts] = useState<SubPostData[]>([]);
  // 검색창 입력값입니다.
  const [searchKeyword, setSearchKeyword] = useState("");
  // 로딩 중인지 여부입니다. (처음엔 true)
  const [loading, setLoading] = useState(true);
  // 현재 보고 있는 페이지 번호입니다.
  const currentPage = Number(searchParams.get("page")) || 1;

  // [추가] 로그인한 유저의 역할(권한)을 저장할 상태입니다. (예: "ROLE_ADMIN", "USER")
  const [userRole, setUserRole] = useState<string>("");

  // 한 페이지당 보여줄 게시글 개수입니다.
  const postsPerPage = 10;

  // --- [데이터 로드 (useEffect)] ---
  // 컴포넌트가 처음 나타나거나, apiEndpoint가 바뀌면 실행됩니다.
  useEffect(() => {
    // 1. 게시글 데이터 로드 로직
    api
      .get(apiEndpoint) // 설정된 주소로 GET 요청을 보냅니다.
      .then((res) => {
        let sortedPosts = [...res.data];

        // [수정] showPinnedTop이 true면 'isPinned'가 true인 것을 맨 앞으로 보냄
        if (showPinnedTop) {
          sortedPosts.sort((a: any, b: any) => {
            // 둘 다 핀이 되어있거나, 둘 다 안 되어있으면 ID 역순(최신순)
            if (!!a.isPinned === !!b.isPinned) return b.id - a.id;
            // a만 핀이면 앞으로(-1), 아니면 뒤로(1)
            return a.isPinned ? -1 : 1;
          });
        } else {
          // 기존 로직: ID 역순(최신순) 정렬
          sortedPosts.sort((a: SubPostData, b: SubPostData) => b.id - a.id);
        }

        setPosts(sortedPosts); // 화면용 상태에 저장
        setOriginalPosts(sortedPosts); // 원본 보관용 상태에 저장
      })
      .catch((err) => console.error("게시글 로드 실패:", err)) // 에러 처리
      .finally(() => setLoading(false)); // 성공하든 실패하든 로딩 상태 해제

    // 2. [추가] 유저 정보(권한) 로드 로직
    const fetchUserRole = async () => {
      // 쿠키에서 인증 토큰을 가져옵니다.
      const token = Cookies.get("token");
      // 토큰이 있는 경우에만(로그인한 경우만) 서버에 내 정보를 물어봅니다.
      if (token) {
        try {
          // 유저 정보 조회 API 호출
          const res = await userService.getUserInfo();

          const response = await fetch(`/api/v1/admin/isAdmin`, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ loginId: res.data.loginId }),
          });
          const isUserAdmin = await response.json();
          if (response.ok && isUserAdmin) {
            setUserRole("ROLE_ADMIN");
          } else {
            setUserRole("ROLE_USER");
          }
        } catch (error) {
          console.error("유저 정보 로드 실패", error);
        }
      }
    };
    fetchUserRole(); // 유저 정보 가져오는 함수 실행
  }, [apiEndpoint, showPinnedTop]); // showPinnedTop 변경 시에도 재정렬

  // --- [검색 기능 핸들러] ---
  const handleSearch = () => {
    // 검색어가 비어있거나 공백뿐이면
    if (!searchKeyword.trim()) {
      setPosts(originalPosts); // 원본 데이터로 복구
      router.push(pathname); // 1페이지로 이동
      return;
    }
    // 원본 데이터(originalPosts)에서 제목이나 닉네임에 검색어가 포함된 것만 걸러냅니다.
    const filtered = originalPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        post.userNickname.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setPosts(filtered); // 걸러진 데이터를 화면용 상태에 저장
    router.push(`${pathname}?page=1`);
  };

  // 엔터키 눌렀을 때 검색 실행
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // --- [날짜 포맷팅 함수] ---
  // "2024-05-20T..." 같은 날짜 문자열을 "24. 5. 20." 형태로 바꿉니다.
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear().toString().slice(2)}. ${
      date.getMonth() + 1
    }. ${date.getDate()}.`;
  };

  // --- [페이지네이션 계산 로직] ---
  // 전체 페이지 수 계산 (전체 글 개수 / 페이지당 개수, 올림 처리)
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // 현재 페이지에 보여줄 글들만 잘라냅니다. (예: 1페이지면 0~9번 인덱스)
  const currentPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // 페이지 번호 배열 생성 함수
  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNumber));
    router.push(`${pathname}?${params.toString()}`);
  };

  // --- [글쓰기 버튼 표시 여부 판단 함수] ---
  const shouldShowWriteButton = () => {
    // 1. 현재 페이지가 '공지사항'인지 확인합니다. (제목이나 API 주소로 판단)
    const isNoticePage = title === "공지사항" || apiEndpoint.includes("notice");

    if (isNoticePage) {
      // 공지사항이라면, 권한이 'ROLE_ADMIN'인 사람만 true를 반환합니다.
      return userRole === "ROLE_ADMIN";
    }
    return true;
  };

  // --- [화면 렌더링 (JSX)] ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 md:pb-24">
      {/* 1. 헤더 영역 (배경 이미지 + 제목) */}
      <div
        className={`relative h-[220px] md:h-[350px] w-full ${styles.bgDark} flex items-center justify-center overflow-hidden`}
      >
        {/* 배경 이미지 */}
        <img
          src={headerImage}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="bg"
        />
        {/* 텍스트 내용 */}
        <div className="relative z-10 text-center text-white px-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 md:mb-4 flex items-center justify-center gap-3">
            {/* [추가] headerIcon이 있으면 제목 옆에 표시 */}
            {headerIcon && <span>{headerIcon}</span>}
            {title}
          </h2>
          <p
            className={`${styles.textLight} text-sm md:text-lg font-light opacity-90`}
          >
            {description}
          </p>
        </div>
      </div>

      {/* 2. 메인 컨텐츠 영역 (흰색 박스) */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 md:-mt-20 relative z-20">
        <div
          className={`bg-white rounded-3xl md:rounded-4xl shadow-xl ${styles.shadow} border border-slate-100 overflow-hidden`}
        >
          {/* (1) 툴바: 총 개수 + 검색창 + 글쓰기 버튼 */}
          <div className="p-5 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* 좌측: Total 개수 표시 */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span
                className={`w-1.5 h-5 md:h-6 ${styles.bar} rounded-full`}
              ></span>
              <p className="text-slate-600 font-bold text-sm md:text-base">
                Total <span className={styles.textMain}>{posts.length}</span>
              </p>
            </div>

            {/* 우측: 검색창 및 버튼 */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64 md:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="검색어..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-14 py-2.5 bg-slate-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                />
                <button
                  onClick={handleSearch}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 ${styles.button} text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors`}
                >
                  검색
                </button>
              </div>

              {/* [조건부 렌더링] 글쓰기 버튼 */}
              {shouldShowWriteButton() && (
                <Link
                  href={writeLink}
                  className={`${styles.button} text-white px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg text-sm shrink-0`}
                >
                  <PenTool size={16} />{" "}
                  <span className="hidden sm:inline">글쓰기</span>
                </Link>
              )}
            </div>
          </div>

          {/* (2) 리스트 영역 */}
          <div className="min-h-[400px]">
            {/* 로딩 중일 때 */}
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2
                  className={`animate-spin ${styles.textMain}`}
                  size={32}
                />
              </div>
            ) : posts.length === 0 ? (
              // 데이터가 없을 때
              <div className="py-32 text-center text-slate-300 flex flex-col items-center">
                <ThumbsUp size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-sm">
                  {searchKeyword ? "검색 결과가 없습니다." : emptyMessage}
                </p>
              </div>
            ) : (
              // 데이터가 있을 때 -> [수정] 뷰 타입에 따라 분기
              <>
                {viewType === "list" ? (
                  // --- 🅱️ [NEW] 리스트 뷰 (공지사항용) ---
                  <div className="flex flex-col">
                    {currentPosts.map((post) => {
                      const isPinned = (post as any).isPinned; // 타입 단언으로 안전하게 접근
                      return (
                        <Link
                          href={`${apiEndpoint}/${post.id}`}
                          key={post.id}
                          className={`flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            isPinned && showPinnedTop
                              ? "bg-red-50/50 hover:bg-red-50"
                              : ""
                          }`}
                        >
                          {/* 1. 번호 or 필독 뱃지 */}
                          <div className="w-14 text-center text-sm shrink-0">
                            {isPinned && showPinnedTop ? (
                              <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded-full">
                                필독
                              </span>
                            ) : (
                              <span className="text-gray-400 font-mono">
                                {post.id}
                              </span>
                            )}
                          </div>

                          {/* 2. 썸네일 (옵션) - hideThumbnail이 false일 때만 보임 */}
                          {!hideThumbnail && (
                            <div className="w-24 h-16 bg-gray-200 rounded mr-4 relative overflow-hidden shrink-0 hidden sm:block">
                              {/* 이미지 URL이 있으면 표시 (임시 코드) */}
                              {/* 실제로는 post.thumbnailUrl 등이 필요 */}
                              <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                IMG
                              </div>
                            </div>
                          )}

                          {/* 3. 제목 영역 */}
                          <div className="flex-1 px-4 min-w-0">
                            <h3
                              className={`text-sm md:text-base truncate ${
                                isPinned
                                  ? "font-bold text-gray-900"
                                  : "font-medium text-gray-700"
                              }`}
                            >
                              {post.title}
                            </h3>
                            {/* 모바일용 메타 정보 (작은 화면에서만 보임) */}
                            <div className="block sm:hidden text-xs text-gray-400 mt-1">
                              {post.userNickname} | {formatDate(post.createdAt)}
                            </div>
                          </div>

                          {/* 4. 작성자 (큰 화면) */}
                          <div className="w-32 text-center text-gray-500 text-sm hidden sm:block truncate px-2">
                            {post.userNickname}
                          </div>

                          {/* 5. 날짜 (큰 화면) */}
                          <div className="w-24 text-right text-gray-400 text-sm font-mono hidden sm:block">
                            {formatDate(post.createdAt)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  // --- 🅰️ [OLD] 그리드 뷰 (기존 카드 형태 유지) ---
                  <div className="divide-y divide-slate-50">
                    {currentPosts.map((post) => (
                      <Link
                        href={`${apiEndpoint}/${post.id}`} // 클릭 시 상세 페이지로 이동
                        key={post.id}
                        className="group block p-5 md:p-8 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 md:gap-2">
                              {/* 뱃지 ('Official' 등) 표시 */}
                              {badgeText && (
                                <span
                                  className={`${styles.bgBadge} ${styles.textMain} text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider w-fit shrink-0`}
                                >
                                  {badgeText}
                                </span>
                              )}
                              {/* 게시글 제목 */}
                              <h3 className="text-[15px] md:text-xl font-bold text-slate-800 group-hover:text-slate-600 transition line-clamp-1 md:line-clamp-2 pr-2">
                                {post.title}
                              </h3>
                            </div>

                            {/* 메타 정보 (작성자, 날짜, 조회수, 댓글수) */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-sm text-slate-400 font-medium">
                              <span className="flex items-center gap-1 text-slate-600">
                                <User size={12} className={styles.icon} />{" "}
                                {post.userNickname}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {formatDate(post.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye size={12} /> {post.viewCount}
                              </span>
                              <span
                                className={`flex items-center gap-1 ${
                                  (post.commentCount || 0) > 0
                                    ? `${styles.textMain} font-bold` // 댓글 있으면 색상 강조
                                    : ""
                                }`}
                              >
                                <MessageSquare size={12} />{" "}
                                {post.commentCount || 0}
                              </span>
                            </div>
                          </div>
                          {/* 썸네일 숨김 옵션이 켜져있지 않으면 화살표 대신 이미지 등을 넣을 수도 있음. 여기선 기존 화살표 유지 */}
                          <ChevronRight
                            className={`mt-1 text-slate-200 group-hover:${styles.textMain} transition shrink-0`}
                            size={18}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            themeColor={theme === "green" ? "green" : "black"}
          />
        </div>
      </div>
    </div>
  );
}
