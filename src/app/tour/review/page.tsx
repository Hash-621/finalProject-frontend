"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import {
  Edit3,
  MapPin,
  Heart,
  MessageCircle,
  Eye,
  Camera,
  Search,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// 백엔드 이미지 경로 설정을 위한 상수
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Post {
  id: number;
  title: string;
  content: string;
  userNickname: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  createdAt: string;
  filePath?: string;
}

export default function TourReviewList() {
  const router = useRouter();

  // ================= 상태 관리 =================
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // 한 페이지당 보여줄 게시글 수

  // ================= 데이터 로딩 =================
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get("/community/posts", {
          params: { category: "TOUR_REVIEW" },
        });
        setPosts(response.data);
      } catch (error) {
        console.error("게시글 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ================= 유틸리티 함수 =================
  const getImageUrl = (path: string) => {
    if (!path) return null;
    const fileName = path.split(/[/\\]/).pop();
    return `${BACKEND_URL}/images/${fileName}`;
  };

  const getPreviewText = (html: string) => {
    if (typeof window === "undefined") return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  };

  // ================= 페이지네이션 로직 =================
  // 1. 검색어 필터링 우선 적용
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. 현재 페이지에 보여줄 데이터 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // 3. 총 페이지 수 계산
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 4. 페이지 변경 시 스크롤 상단 이동
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Section (상단 배너) */}
      <section className="relative h-[400px] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-teal-900/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
          alt="Travel Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <Sparkles size={14} /> Travel Community
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            당신의 여행은 <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              어떤 추억
            </span>
            으로 남았나요?
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            소중한 여행의 순간을 기록하고 공유해보세요.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent z-20" />
      </section>

      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-20 relative z-30">
        {/* 툴바 (검색 & 글쓰기) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="여행지나 키워드로 검색해보세요"
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 검색 시 첫 페이지로 리셋
              }}
            />
          </div>

          <button
            onClick={() => router.push("/tour/review/write")}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1"
          >
            <Edit3 size={18} />
            <span>인증샷 올리기</span>
          </button>
        </div>

        {/* 3. 게시글 리스트 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Camera className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500">
              결과가 없습니다.
            </h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/tour/review/${post.id}`)}
                  className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-500 cursor-pointer hover:-translate-y-2 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {post.filePath ? (
                      <img
                        src={getImageUrl(post.filePath)!}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <Camera size={40} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-wider text-emerald-600 shadow-sm">
                        VISIT REVIEW
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4 flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {getPreviewText(post.content)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                          {post.userNickname ? post.userNickname[0] : "U"}
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {post.userNickname}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <Eye size={14} /> {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={14} /> {post.likeCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. 페이지네이션 UI */}
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => paginate(idx + 1)}
                  className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                    currentPage === idx + 1
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
