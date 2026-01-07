"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/api/axios";
import { SubPostData, CommonBoardListProps } from "@/types/board";
// [추가] 쿠키 및 유저 서비스 임포트
import Cookies from "js-cookie";
import { userService } from "@/api/services";

import {
  User,
  Clock,
  Eye,
  Search,
  PenTool,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ThumbsUp,
} from "lucide-react";

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

export default function CommunityBoardList({
  theme,
  title,
  description,
  headerImage,
  apiEndpoint,
  writeLink,
  emptyMessage,
  badgeText,
}: CommonBoardListProps) {
  const styles = THEMES[theme];

  const [posts, setPosts] = useState<SubPostData[]>([]);
  const [originalPosts, setOriginalPosts] = useState<SubPostData[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // [추가] 유저 권한 상태 관리
  const [userRole, setUserRole] = useState<string>("");

  const postsPerPage = 10;

  useEffect(() => {
    // 1. 게시글 데이터 로드
    api
      .get(apiEndpoint)
      .then((res) => {
        const sortedPosts = [...res.data].sort(
          (a: SubPostData, b: SubPostData) => b.id - a.id
        );
        setPosts(sortedPosts);
        setOriginalPosts(sortedPosts);
      })
      .catch((err) => console.error("게시글 로드 실패:", err))
      .finally(() => setLoading(false));

    // 2. [추가] 유저 정보(권한) 로드
    const fetchUserRole = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const res = await userService.getUserInfo();
          if (res?.data) {
            // 백엔드에서 넘겨주는 권한 필드명 확인 필요 (role 또는 roles 등)
            // 보통 res.data.role 형태라고 가정
            setUserRole(res.data.role || "USER");
          }
        } catch (error) {
          console.error("유저 정보 로드 실패", error);
        }
      }
    };
    fetchUserRole();
  }, [apiEndpoint]);

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setPosts(originalPosts);
      setCurrentPage(1);
      return;
    }
    const filtered = originalPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        post.userNickname.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setPosts(filtered);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear().toString().slice(2)}. ${
      date.getMonth() + 1
    }. ${date.getDate()}.`;
  };

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // [추가] 글쓰기 버튼 표시 여부 판별 함수
  const shouldShowWriteButton = () => {
    // 1. 공지사항 페이지인지 확인 (title 또는 apiEndpoint로 구분)
    const isNoticePage = title === "공지사항" || apiEndpoint.includes("notice");

    if (isNoticePage) {
      // 공지사항이면 관리자(ROLE_ADMIN)만 true
      return userRole === "ROLE_ADMIN";
    }

    // 공지사항이 아니면(자유게시판 등) 누구나(혹은 로그인한 사람) 보임
    // 여기서는 기본적으로 true로 두고, 클릭 시 로그인 체크는 별도로 하거나 그대로 둠
    return true;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 md:pb-24">
      {/* 헤더 영역 */}
      <div
        className={`relative h-[220px] md:h-[350px] w-full ${styles.bgDark} flex items-center justify-center overflow-hidden`}
      >
        <img
          src={headerImage}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="bg"
        />
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

      {/* 메인 컨텐츠 */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 md:-mt-20 relative z-20">
        <div
          className={`bg-white rounded-3xl md:rounded-4xl shadow-xl ${styles.shadow} border border-slate-100 overflow-hidden`}
        >
          {/* 툴바 */}
          <div className="p-5 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span
                className={`w-1.5 h-5 md:h-6 ${styles.bar} rounded-full`}
              ></span>
              <p className="text-slate-600 font-bold text-sm md:text-base">
                Total <span className={styles.textMain}>{posts.length}</span>
              </p>
            </div>

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

              {/* [수정] 조건부 렌더링 적용 */}
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

          {/* 리스트 영역 */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2
                  className={`animate-spin ${styles.textMain}`}
                  size={32}
                />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-32 text-center text-slate-300 flex flex-col items-center">
                <ThumbsUp size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-sm">
                  {searchKeyword ? "검색 결과가 없습니다." : emptyMessage}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {currentPosts.map((post) => (
                  <Link
                    href={`${apiEndpoint}/${post.id}`}
                    key={post.id}
                    className="group block p-5 md:p-8 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 md:gap-2">
                          {badgeText && (
                            <span
                              className={`${styles.bgBadge} ${styles.textMain} text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider w-fit shrink-0`}
                            >
                              {badgeText}
                            </span>
                          )}
                          <h3 className="text-[15px] md:text-xl font-bold text-slate-800 group-hover:text-slate-600 transition line-clamp-1 md:line-clamp-2 pr-2">
                            {post.title}
                          </h3>
                        </div>

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
                                ? `${styles.textMain} font-bold`
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

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="p-6 md:p-10 border-t border-slate-50 flex justify-center bg-slate-50/30">
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-20"
                >
                  <ChevronLeft size={16} />
                </button>
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
                            ? `${styles.paginationActive} text-white`
                            : "bg-white text-slate-400 border border-slate-100"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
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
