"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/api/axios";
import { PostData } from "@/types/board";
import { PostCard } from "@/components/sections/board/PostCard";

interface BoardColumnProps {
  title: string;
  posts: PostData[];
  loading: boolean;
  type: "free" | "notice";
  cardClassName?: string;
}

export const BoardColumn = ({
  title,
  type,
  cardClassName,
}: BoardColumnProps) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const isBest = type === "notice";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const endpoint =
          type === "free" ? "/community/free" : "/community/notice";

        const response = await api.get(endpoint);

        const rawData = response.data;
        const finalData = Array.isArray(rawData) ? rawData : rawData.data || [];

        setPosts(finalData.slice(0, 5));
      } catch (error: any) {
        console.error(
          `${title} 데이터 로드 실패:`,
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [type, title]);

  return (
    <div className="space-y-8">
      {/* 헤더 부분 */}
      <div className="flex items-end justify-between px-2">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
              isBest
                ? "bg-slate-100 text-slate-700"
                : "bg-green-100 text-green-700"
            }`}
          >
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
          <h3 className="text-4xl font-bold text-slate-900 tracking-tighter">
            {title}
          </h3>
        </div>
        <Link
          href={`/community/${type}`}
          className="text-[11px] font-bold text-slate-300 hover:text-slate-600 tracking-widest transition-colors"
        >
          SEE ALL
        </Link>
      </div>

      {/* 리스트 부분 */}
      <div className="space-y-4">
        {loading
          ? Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-${type}-${i}`}
                  className="h-[88px] bg-white border border-slate-50 rounded-[1.8rem] animate-pulse"
                />
              ))
          : posts.map((post) => (
              <PostCard
                key={`${type}-${post.id}`}
                post={post}
                type={type}
                className={cardClassName}
              />
            ))}
        {!loading && posts.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-sm">
            게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
