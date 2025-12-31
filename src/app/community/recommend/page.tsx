"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/api/axios";
import {
  User,
  Clock,
  Eye,
  Search,
  PenTool,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
};

export default function RecommendBoardList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    api
      .get("/community/recommend")
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="relative h-[350px] w-full bg-blue-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="bg"
        />
        <div className="relative z-10 text-center text-white px-6">
          <h2 className="text-5xl font-bold tracking-tight mb-4">추천게시판</h2>
          <p className="text-blue-100 text-lg font-light">
            나만 알기 아까운 대전의 명소와 맛집 공유
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-4xl shadow-xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
          {/* 상단 툴바 */}
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              <p className="text-slate-600 font-bold">
                Total <span className="text-blue-600">{posts.length}</span>
              </p>
            </div>
            <Link
              href="/community/write?category=RECOMMEND"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              <PenTool size={18} /> 추천 글쓰기
            </Link>
          </div>

          <div className="min-h-[500px]">
            {loading ? (
              <div className="flex justify-center items-center py-40">
                <Loader2 className="animate-spin text-blue-500" size={40} />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-40 text-center text-slate-300 flex flex-col items-center">
                <ThumbsUp size={60} className="mb-4 opacity-20" />
                <p className="font-medium">
                  멋진 장소를 가장 먼저 추천해보세요!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {currentPosts.map((post) => (
                  <Link
                    href={`/community/recommend/${post.id}`}
                    key={post.id}
                    className="group block p-8 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            Local Pick
                          </span>
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition truncate max-w-2xl">
                            {post.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-5 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                            <User size={14} className="text-blue-500" />{" "}
                            {post.userNickname}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} /> {formatDate(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} /> {post.viewCount}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 스마트 페이지네이션 */}
          {totalPages > 1 && (
            <div className="p-10 border-t border-slate-50 flex justify-center bg-slate-50/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2 px-2">
                  {getPageNumbers().map((num, i) =>
                    num === "..." ? (
                      <span key={i} className="px-2 text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(num as number)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                          currentPage === num
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                            : "bg-white text-slate-400 hover:text-slate-900 border border-slate-100"
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
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
