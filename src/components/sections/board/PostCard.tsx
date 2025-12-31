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
} from "lucide-react";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
};

const BASE_STYLE =
  "relative flex items-center justify-between bg-white border border-slate-100 rounded-[1.2rem] md:rounded-[1.8rem] transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-0.5";

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
        {/* 왼쪽 섹션: 아이콘 + 제목 + 유저정보 */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 p-4 md:p-5">
          {/* 아이콘 박스 - 모바일에서 크기 축소 및 유연한 대응 */}
          <div
            className={`flex shrink-0 w-9 h-9 md:w-11 md:h-11 items-center justify-center rounded-xl md:rounded-2xl transition-all duration-300 ${
              isRecommendBoard
                ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
                : "bg-slate-50 text-slate-400 group-hover:bg-green-500 group-hover:text-white"
            }`}
          >
            {isRecommendBoard ? (
              <ThumbsUp className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.2} />
            ) : (
              <MessageSquareText
                className="w-4 h-4 md:w-5 md:h-5"
                strokeWidth={2.2}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* 제목: line-clamp-1로 모바일 글자수 제한 */}
            <h4 className="text-[14px] md:text-[15px] font-bold text-slate-800 line-clamp-1 group-hover:text-green-600 mb-1 transition-colors">
              {post.title}
            </h4>

            {/* 메타 데이터: 유저명, 날짜 */}
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[12px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 truncate max-w-20 md:max-w-none">
                <User className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={2.5} />{" "}
                {post.userNickname}
              </span>
              <span className="w-0.5 h-0.5 bg-slate-200 rounded-full" />
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

        {/* 오른쪽 섹션: 조회수 + 화살표 */}
        <div className="flex items-center gap-2 md:gap-4 pr-4 md:pr-6 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
            <Eye
              className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-300"
              strokeWidth={2.5}
            />
            <span className="text-[10px] md:text-[11px] font-bold">
              {post.viewCount || 0}
            </span>
          </div>

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
