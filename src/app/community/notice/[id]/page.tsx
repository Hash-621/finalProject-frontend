"use client";

import React, { use } from "react";
import CommonPostDetail from "@/components/community/CommunityPostDetail";

export default function RecommendPostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CommonPostDetail
      postId={id}
      theme="slate"
      categoryLabel="Notice"
      listPath="/community/notice"
      apiEndpoints={{
        fetchPost: `/community/post/${id}`,
        deletePost: `/community/post/${id}`,
        fetchComments: `/community/comments/${id}`,
        postComment: "/community/comments",
        deleteComment: "/community/comments/delete",
      }}
    />
  );
}
