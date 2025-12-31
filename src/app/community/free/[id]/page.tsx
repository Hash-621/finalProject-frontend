"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import {
  User,
  Clock,
  Eye,
  MessageSquare,
  ChevronLeft,
  Share2,
  MoreVertical,
  Send,
  Loader2,
} from "lucide-react";

export default function FreeBoardDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const CURRENT_USER_ID = "testUser";

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchData = async () => {
      try {
        const postRes = await api.get(`/community/free/${id}`);
        setPost(postRes.data);
        await fetchComments();
      } catch (err) {
        console.error(err);
        router.push("/community/free");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/community/comments/${id}`);
      const rawComments = res.data;
      const commentMap = new Map();
      const rootComments: any[] = [];
      rawComments.forEach((c: any) =>
        commentMap.set(c.id, { ...c, children: [] })
      );
      rawComments.forEach((c: any) => {
        if (c.parentId) {
          const parent = commentMap.get(c.parentId);
          if (parent) parent.children.push(commentMap.get(c.id));
        } else {
          rootComments.push(commentMap.get(c.id));
        }
      });
      setComments(rootComments);
    } catch (err) {
      console.error(err);
    }
  };

  const renderComments = (list: any[]) => {
    return list.map((comment) => (
      <div key={comment.id} className="group/item">
        <div className="flex gap-4 mb-4">
          {/* 답글일 경우 왼쪽 여백 및 아이콘 대신 인덴트 구조 활용 */}
          {comment.parentId && (
            <div className="w-6 md:w-10 border-l-2 border-green-100 ml-4 md:ml-6 mb-4" />
          )}

          <div
            className={`flex-1 ${
              comment.parentId ? "bg-green-50/30" : "bg-slate-50/50"
            } rounded-2xl p-5 transition-colors hover:bg-slate-50`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 ${
                    comment.parentId
                      ? "bg-green-100 text-green-600"
                      : "bg-white text-slate-400"
                  } rounded-xl flex items-center justify-center font-bold shadow-sm`}
                >
                  {comment.userId[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">
                    {comment.userId}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {!comment.parentId && !comment.isDelete && (
                <button
                  onClick={() =>
                    setActiveReplyId(
                      activeReplyId === comment.id ? null : comment.id
                    )
                  }
                  className="text-xs font-black text-green-600 hover:bg-green-100 px-3 py-1 rounded-full transition-colors"
                >
                  답글 달기
                </button>
              )}
            </div>
            <p
              className={`text-[15px] leading-relaxed pl-1 ${
                comment.isDelete
                  ? "text-slate-400 italic"
                  : "text-slate-600 font-medium"
              }`}
            >
              {comment.isDelete ? "삭제된 댓글입니다." : comment.content}
            </p>

            {/* 답글 작성 창 */}
            {activeReplyId === comment.id && (
              <div className="mt-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-4 bg-white border border-green-100 rounded-xl text-sm h-24 focus:ring-2 focus:ring-green-500/10 outline-none resize-none shadow-inner"
                  placeholder="답글을 남겨주세요..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setActiveReplyId(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => {
                      if (!replyContent.trim()) return;
                      await api.post("/community/comments", {
                        postId: id,
                        userId: CURRENT_USER_ID,
                        content: replyContent,
                        parentId: comment.id,
                      });
                      setReplyContent("");
                      setActiveReplyId(null);
                      fetchComments();
                    }}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-green-100"
                  >
                    답글 등록
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 대댓글 리스트 재귀 렌더링 */}
        {comment.children?.length > 0 && (
          <div className="contents">{renderComments(comment.children)}</div>
        )}
      </div>
    ));
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-green-500 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 상단 네비게이션 */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-slate-500 hover:text-green-600 transition-colors"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="ml-1 font-bold">목록으로</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {/* 게시글 본문 */}
        <article className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-green-50 text-green-600 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Free Board
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-[1.3] tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-between border-b border-slate-50 pb-8 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-100">
                  {(post.userNickname || post.userId || "익")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-slate-800 text-lg">
                    {post.userNickname || post.userId}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-3 mt-0.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <Eye size={14} /> {post.viewCount} views
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-slate-700 leading-[1.8] whitespace-pre-wrap text-[17px] font-medium min-h-[300px]">
              {post.content}
            </div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              댓글
              <span className="text-green-600 text-lg font-bold bg-green-50 px-3 py-0.5 rounded-full">
                {comments.length}
              </span>
            </h3>

            {/* 댓글 입력창 */}
            <div className="relative mb-12">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="자유롭게 의견을 나눠보세요"
                className="w-full p-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-500/10 h-32 resize-none transition-all text-slate-700 placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={async () => {
                  if (!commentContent.trim()) return;
                  await api.post("/community/comments", {
                    postId: id,
                    userId: CURRENT_USER_ID,
                    content: commentContent,
                  });
                  setCommentContent("");
                  fetchComments();
                }}
                className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-100 flex items-center gap-2 text-sm"
              >
                <Send size={16} />
                댓글 등록
              </button>
            </div>

            {/* 댓글 리스트 */}
            <div className="space-y-2">
              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium">
                    아직 작성된 댓글이 없습니다.
                  </p>
                </div>
              ) : (
                renderComments(comments)
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
