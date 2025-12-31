"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/api/axios"; // 아까 확인한 axios 인스턴스
import { PostData } from "@/types/board";
// 에러 방지를 위해 경로를 다시 한번 확인하고, 필요한 경우 상대 경로로 시도해보세요.
import { PostCard } from "./PostCard";

interface BoardColumnProps {
  title: string;
  posts: PostData[];
  loading: boolean;
  type: "free" | "recommend"; // API 엔드포인트와 매칭되는 값
  cardClassName?: string;
}

export const BoardColumn = ({
  title,
  type,
  cardClassName,
}: BoardColumnProps) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const isBest = type === "recommend";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // 1. 확인하신 로직에 따라 엔드포인트 결정
        const endpoint =
          type === "free" ? "/community/free" : "/community/recommend";

        // 2. api 인스턴스를 사용하여 호출
        const response = await api.get(endpoint);

        // 3. 데이터 저장 (응답 구조가 response.data.data일 수도 있으니 확인 필요)
        const rawData = response.data;
        const finalData = Array.isArray(rawData) ? rawData : rawData.data || [];

        setPosts(finalData.slice(0, 5)); // 상위 5개만 출력
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
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBest ? "bg-blue-400" : "bg-green-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBest ? "bg-blue-500" : "bg-green-500"
                }`}
              ></span>
            </span>
            <p className="uppercase">{isBest ? "Popular" : "Community"}</p>
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
