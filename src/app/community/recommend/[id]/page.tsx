"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/axios";
import {
  User,
  Clock,
  Eye,
  ChevronLeft,
  MessageSquare,
  Share2,
  MoreVertical,
  Send,
  Loader2,
} from "lucide-react";

export default function RecommendPostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    const fetchData = async () => {
      try {
        const postRes = await api.get(`/community/post/${postId}`);
        setPost(postRes.data);
        const commentsRes = await api.get(`/community/comments/${postId}`);
        setComments(commentsRes.data);
      } catch (error) {
        alert("글을 불러오지 못했습니다.");
        router.push("/community/recommend");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId, router]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return alert("댓글 내용을 입력해주세요.");
    try {
      await api.post("/community/comments", {
        postId: postId,
        userId: "testUser",
        userNickname: "익명",
        content: commentContent,
      });
      const res = await api.get(`/community/comments/${postId}`);
      setComments(res.data);
      setCommentContent("");
    } catch (error) {
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#fcfcfc]">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 상단 네비게이션 바 */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors"
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
        {/* 메인 포스트 카드 */}
        <article className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-8 md:p-12">
            {/* 카테고리 & 태그 */}
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-blue-50 text-blue-600 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Recommendation
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-[1.3] tracking-tight">
              {post.title}
            </h1>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-8 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
                  {(post.userNickname || "익")[0]}
                </div>
                <div>
                  <div className="font-black text-slate-800 text-lg">
                    {post.userNickname || "익명"}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {post.createdAt?.split("T")[0]}
                    </span>
                    <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <Eye size={14} /> {post.viewCount} views
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 본문 내용 */}
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
              <span className="text-blue-600 text-lg font-bold bg-blue-50 px-3 py-0.5 rounded-full">
                {comments.length}
              </span>
            </h3>

            {/* 댓글 입력창 */}
            <div className="relative mb-12">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                className="w-full p-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-500/10 h-32 resize-none transition-all text-slate-700 placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={handleCommentSubmit}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2 text-sm"
              >
                <Send size={16} />
                등록하기
              </button>
            </div>

            {/* 댓글 리스트 */}
            <div className="space-y-8">
              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium">
                    아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="group">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center text-slate-500 font-bold">
                        {comment.userNickname[0]}
                      </div>
                      <div className="flex-1 bg-slate-50/50 rounded-2xl rounded-tl-none p-5 group-hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {comment.userNickname}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium tracking-tighter">
                            {comment.createdAt?.split("T")[0]}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[15px] leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
