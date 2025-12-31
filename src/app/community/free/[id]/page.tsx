"use client";

import { use } from "react";
import CommonPostDetail from "@/components/community/CommunutyPostDetail";

export default function FreeBoardDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <CommonPostDetail
      postId={id}
      theme="green"
      categoryLabel="Free Board"
      listPath="/community/free"
      apiEndpoints={{
        fetchPost: `/community/free/${id}`,
        fetchComments: `/community/comments/${id}`,
        postComment: "/community/comments",
        deleteComment: "/community/comments/delete",
      }}
    />
  );
}
