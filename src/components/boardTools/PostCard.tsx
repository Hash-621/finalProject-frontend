"use client";

import Link from "next/link";
import { PostData } from "@/types/board";
import {
  MessageSquareText,
  ThumbsUp,
  Eye,
  Clock,
  User,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
};

// 백엔드 주소 상수 (env 파일로 빼는 것을 권장)
const BACKEND_URL = "http://localhost:8080";

const BASE_STYLE =
  "relative flex items-center justify-between bg-white border border-slate-100 rounded-[1.8rem] transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-0.5";

export const PostCard = ({
  post,
  className,
  type,
}: {
  post: PostData;
  className?: string;
  type: string;
}) => {
  const isRecommendBoard = type === "recommend" || type === "best";

  return (
    <Link href={`/community/${type}/${post.id}`} className="group block">
      <div className={`${BASE_STYLE} ${className}`}>
        
        {/* ★ [추가] 썸네일 이미지 영역 (이미지가 있을 때만 표시) */}
        {post.filePath && (
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden ml-4 my-4 border border-slate-100">
            <img 
              // 백엔드 주소 + DB에 저장된 경로 조합
              src={`${BACKEND_URL}${post.filePath}`} 
              alt="thumbnail" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                // 이미지 로드 실패 시 숨김 처리 (또는 기본 이미지)
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-4 flex-1 min-w-0 p-5">
          
          {/* 왼쪽 아이콘 영역 (이미지가 없을 때만 보여줌) */}
          {!post.filePath && (
            <div
              className={`hidden sm:flex shrink-0 w-11 h-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                isRecommendBoard
                  ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
                  : "bg-slate-50 text-slate-400 group-hover:bg-green-500 group-hover:text-white"
              }`}
            >
              {isRecommendBoard ? (
                <ThumbsUp className="w-5 h-5" strokeWidth={2.2} />
              ) : (
                <MessageSquareText className="w-5 h-5" strokeWidth={2.2} />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-[15px] font-bold text-slate-800 truncate group-hover:text-green-600 mb-1.5 transition-colors">
              {post.title}
            </h4>

            <div className="flex items-center gap-3 text-[12px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" strokeWidth={2.5} />{" "}
                {post.userId || "익명"}
              </span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />{" "}
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pr-6 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
            <Eye className="w-3.5 h-3.5 text-slate-300" strokeWidth={2.5} />
            <span className="text-[11px] font-bold">{post.viewCount || 0}</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
            <ChevronRight className="w-4 h-4" strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
};