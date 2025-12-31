"use client";

import { useBoardData } from "@/hooks/main/useBoardData";
import { BoardColumn } from "@/components/sections/board/BoardColumn";

export default function BoardSection() {
  const CARD_EFFECT =
    "hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 group-hover:border-green-200";

  const { freePosts, bestPosts, loading } = useBoardData();

  return (
    <section className="py-12 bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <BoardColumn
            title="자유게시판"
            posts={freePosts}
            loading={loading}
            type="free"
            cardClassName={CARD_EFFECT}
          />
          <BoardColumn
            title="추천게시판"
            posts={bestPosts}
            loading={loading}
            type="recommend"
            cardClassName={CARD_EFFECT}
          />
        </div>
      </div>
    </section>
  );
}
