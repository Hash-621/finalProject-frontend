// "use client": 이 컴포넌트는 브라우저에서 실행됩니다. (상태 관리, 클릭 이벤트 등이 필요하기 때문)
"use client";

// --- [라이브러리 임포트] ---
import React, { useEffect, useState } from "react"; // 리액트의 기본 훅(상태 관리, 수명 주기)을 가져옵니다.
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크 컴포넌트입니다.
import api from "@/api/axios"; // 서버 통신을 위한 axios 인스턴스입니다.
// 게시글 데이터 타입(SubPostData)과 이 컴포넌트가 받을 설정값 타입(CommonBoardListProps)을 가져옵니다.
import { SubPostData, CommonBoardListProps } from "@/types/board";

// [추가] 쿠키와 유저 서비스 관련 기능을 가져옵니다. (로그인한 사람인지, 관리자인지 확인용)
import Cookies from "js-cookie";
import { userService } from "@/api/services";

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

const serverURL = process.env.NEXT_PUBLIC_API_URL;

// --- [테마 설정 객체] ---
// 'theme' 값(green 또는 slate)에 따라 사용할 CSS 클래스들을 미리 정의해둡니다.
// 이렇게 하면 나중에 색상만 쏙쏙 골라 쓸 수 있어 코드가 깔끔해집니다.
const THEMES = {
  green: {
    bgDark: "bg-green-900", // 헤더 배경색 (진한 초록)
    textMain: "text-green-600", // 주요 텍스트 색
    textLight: "text-green-100", // 헤더 내 밝은 텍스트
    bgBadge: "bg-green-50", // 뱃지 배경색
    bar: "bg-green-500", // Total 옆 막대 색
    button: "bg-green-600 hover:bg-green-700", // 버튼 배경색
    shadow: "shadow-green-200", // 그림자 색
    paginationActive: "bg-green-600 shadow-green-200", // 활성화된 페이지 번호 스타일
    icon: "text-green-500", // 아이콘 색상
  },
  slate: {
    bgDark: "bg-slate-900", // 헤더 배경색 (진한 회색)
    textMain: "text-slate-600", // 주요 텍스트 색
    textLight: "text-slate-100", // 헤더 내 밝은 텍스트
    bgBadge: "bg-slate-100", // 뱃지 배경색
    bar: "bg-slate-600", // Total 옆 막대 색
    button: "bg-slate-800 hover:bg-slate-900", // 버튼 배경색
    shadow: "shadow-slate-200", // 그림자 색
    paginationActive: "bg-slate-800 shadow-slate-200", // 활성화된 페이지 번호 스타일
    icon: "text-slate-500", // 아이콘 색상
  },
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
}: CommonBoardListProps) {
  // 1. 전달받은 theme('green' 등)에 맞는 스타일 꾸러미를 꺼냅니다.
  const styles = THEMES[theme];

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
  const [currentPage, setCurrentPage] = useState(1);

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
        // 받아온 데이터를 ID 역순(최신순)으로 정렬합니다.
        const sortedPosts = [...res.data].sort(
          (a: SubPostData, b: SubPostData) => b.id - a.id
        );
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
          // if (res?.data) {

          //   // 응답 데이터에서 권한(role) 정보를 꺼내 저장합니다.
          //   // (백엔드 필드명이 role인지 roles인지 확인 필요, 여기선 role로 가정)
          //   setUserRole(res.data.role || "USER");
          // }
          const response = await fetch(`${serverURL}/api/v1/admin/isAdmin`, {
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
  }, [apiEndpoint]); // apiEndpoint가 바뀔 때마다 다시 실행

  // --- [검색 기능 핸들러] ---
  const handleSearch = () => {
    // 검색어가 비어있거나 공백뿐이면
    if (!searchKeyword.trim()) {
      setPosts(originalPosts); // 원본 데이터로 복구
      setCurrentPage(1); // 1페이지로 이동
      return;
    }
    // 원본 데이터(originalPosts)에서 제목이나 닉네임에 검색어가 포함된 것만 걸러냅니다.
    const filtered = originalPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        post.userNickname.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setPosts(filtered); // 걸러진 데이터를 화면용 상태에 저장
    setCurrentPage(1); // 검색 결과의 1페이지로 이동
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

  // 페이지 번호 배열 생성 함수 (복잡한 로직: 1 ... 4 5 6 ... 10 처럼 만들기)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      // 5페이지 이하면 그냥 1부터 끝까지 다 보여줌
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // 6페이지 이상이면 스마트하게 줄임
      pages.push(1); // 첫 페이지 항상 표시
      if (currentPage > 3) pages.push("..."); // 중간 생략 표시
      // 현재 페이지 앞뒤로 하나씩 계산
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("..."); // 중간 생략 표시
      pages.push(totalPages); // 마지막 페이지 항상 표시
    }
    return pages;
  };

  // --- [글쓰기 버튼 표시 여부 판단 함수] ---
  const shouldShowWriteButton = () => {
    // 1. 현재 페이지가 '공지사항'인지 확인합니다. (제목이나 API 주소로 판단)
    const isNoticePage = title === "공지사항" || apiEndpoint.includes("notice");

    if (isNoticePage) {
      // 공지사항이라면, 권한이 'ROLE_ADMIN'인 사람만 true를 반환합니다.
      return userRole === "ROLE_ADMIN";
    }

    // 공지사항이 아니면(자유게시판 등) 일단 모두에게 보여줍니다.
    // (클릭 시 로그인 여부 체크는 페이지 이동 후 처리하거나 별도로 함)
    return true;
  };

  // --- [화면 렌더링 (JSX)] ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 md:pb-24">
      {/* 1. 헤더 영역 (배경 이미지 + 제목) */}
      <div
        className={`relative h-[220px] md:h-[350px] w-full ${styles.bgDark} flex items-center justify-center overflow-hidden`}
      >
        {/* 배경 이미지 (투명도 조절됨) */}
        <img
          src={headerImage}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="bg"
        />
        {/* 텍스트 내용 */}
        <div className="relative z-10 text-center text-white px-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 md:mb-4">
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
              {/* shouldShowWriteButton() 함수 결과가 true일 때만 버튼을 보여줍니다. */}
              {shouldShowWriteButton() && (
                <Link
                  href={writeLink}
                  className={`${styles.button} text-white px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg text-sm shrink-0`}
                >
                  <PenTool size={16} />{" "}
                  <span className="hidden xs:inline">글쓰기</span>
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
                  {/* 검색했는데 없는 건지, 원래 없는 건지 구분해서 메시지 표시 */}
                  {searchKeyword ? "검색 결과가 없습니다." : emptyMessage}
                </p>
              </div>
            ) : (
              // 데이터가 있을 때 (목록 표시)
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
                            <MessageSquare size={12} /> {post.commentCount || 0}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`mt-1 text-slate-200 group-hover:${styles.textMain} transition shrink-0`}
                        size={18}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* (3) 페이지네이션 버튼들 */}
          {totalPages > 1 && (
            <div className="p-6 md:p-10 border-t border-slate-50 flex justify-center bg-slate-50/30">
              <div className="flex items-center gap-1 md:gap-2">
                {/* 이전 페이지 버튼 */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1} // 1페이지면 비활성화
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-20"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* 페이지 번호들 */}
                <div className="flex items-center gap-1 md:gap-2 px-1">
                  {getPageNumbers().map((num, i) =>
                    num === "..." ? (
                      <span key={i} className="px-1 text-slate-400 text-xs">
                        ...
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(num as number)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-xs md:text-sm transition-all ${
                          currentPage === num
                            ? `${styles.paginationActive} text-white` // 현재 페이지 강조
                            : "bg-white text-slate-400 border border-slate-100"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>

                {/* 다음 페이지 버튼 */}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages} // 마지막 페이지면 비활성화
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-20"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 1. 페이지 진입 및 로딩 시작 (Mount)

// 사용자가 페이지를 엽니다.

// 컴포넌트가 실행되면서 posts는 빈 배열, loading은 true로 설정됩니다.

// 화면에는 게시글 목록 대신 **뱅글뱅글 도는 로딩 스피너(Loader2)**만 보입니다.

// 2. 병렬 데이터 요청 (useEffect)

// 화면이 그려진 직후 useEffect가 실행되어 두 가지 일을 동시에 수행합니다.

// 게시글 요청: apiEndpoint로 서버에 "게시글 목록 줘"라고 요청합니다.

// 권한 확인: 쿠키에 token이 있다면, 서버에 "나(로그인한 사람) 권한이 뭐야?"라고 묻습니다.

// 3. 데이터 수신 및 화면 갱신 (State Update)

// 게시글 도착: 서버에서 게시글 목록이 오면 posts 상태에 저장하고, loading을 false로 바꿉니다. 이제 스피너가 사라지고 게시글 목록이 화면에 쫘르륵 나타납니다.

// 권한 도착: 서버가 "넌 관리자(ROLE_ADMIN)야"라고 응답하면 userRole 상태를 업데이트합니다.

// 4. 글쓰기 버튼 결정 (Rendering Logic)

// 화면을 다시 그릴 때 shouldShowWriteButton() 함수가 작동합니다.

// 만약 지금 페이지가 공지사항인데 내가 일반 유저라면? -> 함수가 false를 반환해 글쓰기 버튼이 아예 렌더링되지 않습니다.

// 내가 관리자라면? -> true를 반환해 글쓰기 버튼이 보입니다.

// 5. 사용자 검색 (Interaction)

// 사용자가 검색창에 "대전"이라고 치고 엔터를 칩니다.

// handleSearch가 실행되어, 이미 받아온 데이터(originalPosts) 중에서 "대전"이 포함된 글만 남기고 나머지는 숨깁니다(setPosts).

// 화면이 깜빡임 없이 즉시 검색 결과만 보여줍니다.
