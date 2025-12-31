"use client";

import { useEffect, useState } from "react";
import api from "@/api/axios";
import { PostData } from "@/types/board";
import { BoardColumn } from "@/components/boardTools/BoardColumn";

export default function BoardSection() {
  const MAIN_PAGE_CARD_EFFECT =
    "hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 group-hover:border-green-200";
  const [freePosts, setFreePosts] = useState<PostData[]>([]);
  const [bestPosts, setBestPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const [freeRes, bestRes] = await Promise.all([
          api.get("/community/free"),
          api.get("/community/recommend"),
        ]);

        const mapData = (data: any[]): PostData[] =>
          (data || []).map(
            (item) =>
              ({
                id: item.ID ?? item.id,
                userId: item.USER_ID ?? item.userId,
                title: item.TITLE ?? item.title,
                viewCount: item.VIEW_COUNT ?? item.viewCount ?? 0,
                createdAt: item.CREATED_AT ?? item.createdAt,
                // 필요한 다른 필드들...
              } as PostData)
          );

        setFreePosts(mapData(freeRes.data).slice(0, 5));
        setBestPosts(mapData(bestRes.data).slice(0, 5));
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  return (
    <section className="py-12 bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 자유게시판 */}
          <BoardColumn
            title="자유게시판"
            posts={freePosts}
            loading={loading}
            type="free"
            cardClassName={MAIN_PAGE_CARD_EFFECT}
          />
          {/* 추천게시판 */}
          <BoardColumn
            title="추천게시판"
            posts={bestPosts}
            loading={loading}
            type="recommend"
            cardClassName={MAIN_PAGE_CARD_EFFECT}
          />
        </div>
      </div>
    </section>
  );
}
