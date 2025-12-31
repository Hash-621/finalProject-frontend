"use client";

import React, { use } from "react";
import CommonPostDetail from "@/components/community/CommunutyPostDetail";

export default function RecommendPostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CommonPostDetail
      postId={id}
      theme="blue"
      categoryLabel="Recommendation"
      listPath="/community/recommend"
      apiEndpoints={{
        fetchPost: `/community/post/${id}`, // 추천게시판은 엔드포인트가 다름에 주의
        deletePost: `/community/post/${id}`, // 삭제 기능 활성화
        fetchComments: `/community/comments/${id}`,
        postComment: "/community/comments",
        deleteComment: "/community/comments/delete",
      }}
    />
  );
}
