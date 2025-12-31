"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import Cookies from "js-cookie";
import { userService } from "@/api/services";
import {
  ChevronLeft,
  Clock,
  Eye,
  Trash2,
  Send,
  CornerDownRight,
  MessageSquare,
  Loader2, // ✅ [수정] 여기에 Loader2를 추가했습니다!
} from "lucide-react";

// 백엔드 이미지 경로 설정을 위한 상수 (환경 변수 사용 권장)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function TourReviewDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  // ================= 상태 관리 =================
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 댓글 입력 상태
  const [commentContent, setCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // ================= 데이터 로딩 =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 사용자 정보 로드
        const token = Cookies.get("token");
        if (token) {
          try {
            const userRes = await userService.getUserInfo();
            if (userRes?.data) {
              const data = userRes.data;
              setCurrentUser({
                userId: data.userId || data.id || data.loginId,
                nickname: data.userNickname || data.nickname,
              });
            }
          } catch (e) {
            console.error("Auth check failed", e);
          }
        }

        // 2. 게시글 로드 (수정된 올바른 엔드포인트: /post/{id})
        const postRes = await api.get(`/community/post/${id}`);
        setPost(postRes.data);

        // 3. 댓글 로드
        await fetchComments();
      } catch (err) {
        console.error("상세 로딩 실패:", err);
        alert("게시글을 불러올 수 없습니다.");
        router.push("/tour/review");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // 댓글 목록 조회 함수
  const fetchComments = async () => {
    try {
      const res = await api.get(`/community/comments/${id}`);
      const rawComments = res.data;

      // 계층형 댓글 구조 만들기
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
      console.error("댓글 로드 실패:", err);
    }
  };

  // ================= 기능 핸들러 =================

  // 이미지 URL 변환
  const getImageUrl = (path: string) => {
    if (!path) return null;
    const fileName = path.split(/[/\\]/).pop();
    // /images/ 경로가 백엔드 WebMvcConfig에 매핑되어 있어야 함
    return `${BACKEND_URL}/images/${fileName}`;
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/community/post/${id}`);
      alert("게시글이 삭제되었습니다.");
      router.push("/tour/review");
    } catch (error) {
      console.error(error);
      alert("삭제 실패했습니다.");
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (parentId: number | null = null) => {
    const content = parentId ? replyContent : commentContent;
    if (!content.trim()) return alert("내용을 입력해주세요.");
    if (!currentUser) return alert("로그인이 필요합니다.");

    try {
      await api.post("/community/comments", {
        postId: id,
        userId: currentUser.userId,
        userNickname: currentUser.nickname,
        content: content,
        parentId: parentId,
      });

      if (parentId) {
        setReplyContent("");
        setActiveReplyId(null);
      } else {
        setCommentContent("");
      }
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error(error);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.post("/community/comments/delete", { id: commentId });
      fetchComments();
    } catch (error) {
      alert("댓글 삭제 실패");
    }
  };

  // 댓글 렌더링 헬퍼
  const renderComments = (list: any[]) => {
    return list.map((comment) => {
      const isAuthor =
        currentUser && String(comment.userId) === String(currentUser.userId);
      const isReply = !!comment.parentId;

      return (
        <div key={comment.id} className="w-full">
          <div className={`flex ${isReply ? "mt-2" : "mt-6"}`}>
            {isReply && (
              <div className="flex flex-col items-end mr-3 pt-6 min-w-6">
                <CornerDownRight className="text-slate-300 w-5 h-5" />
              </div>
            )}
            <div
              className={`flex-1 rounded-3xl p-6 transition-all ${
                isReply
                  ? "bg-[#F1F5F9] border border-slate-200/50"
                  : "bg-white border border-slate-100 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center font-bold text-sm rounded-2xl ${
                      isReply
                        ? "w-8 h-8 bg-white text-slate-500 border border-slate-200"
                        : "w-10 h-10 text-white bg-indigo-500 shadow-lg shadow-indigo-100"
                    }`}
                  >
                    {(comment.userNickname || "?")[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-[15px]">
                        {comment.userNickname}
                      </span>
                      {isAuthor && (
                        <span className="text-[10px] px-1.5 rounded font-bold border border-indigo-100 text-indigo-600 bg-indigo-50">
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {comment.createdAt?.split("T")[0] || "날짜없음"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!comment.isDelete && (
                    <button
                      onClick={() =>
                        setActiveReplyId(
                          activeReplyId === comment.id ? null : comment.id
                        )
                      }
                      className="text-xs font-bold text-slate-400 hover:text-indigo-600 px-2 py-1 transition-colors"
                    >
                      답글
                    </button>
                  )}
                  {isAuthor && !comment.isDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <p
                className={`text-[15px] leading-relaxed pl-1 whitespace-pre-wrap ${
                  comment.isDelete
                    ? "text-slate-400 italic"
                    : "text-slate-700 font-medium"
                }`}
              >
                {comment.isDelete ? "삭제된 댓글입니다." : comment.content}
              </p>

              {/* 대댓글 입력창 */}
              {activeReplyId === comment.id && (
                <div className="mt-5 pt-4 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm h-24 outline-none resize-none shadow-sm focus:ring-4 focus:ring-indigo-500/10"
                    placeholder={`@${comment.userNickname} 님에게 답글 남기기...`}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleCommentSubmit(comment.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-lg shadow-indigo-100"
                    >
                      등록하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {comment.children?.length > 0 && (
            <div className="pl-6 md:pl-12">
              {renderComments(comment.children)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading || !post)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 상단 네비게이션 */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-20 px-6 h-16 flex items-center border-b border-slate-100">
        <button
          onClick={() => router.push("/tour/review")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors group"
        >
          <ChevronLeft className="text-slate-800 group-hover:-translate-x-1 transition-transform" />
        </button>
        <span className="ml-4 font-bold text-slate-800 truncate pr-6">
          {post.title}
        </span>
      </nav>

      <article className="max-w-4xl mx-auto pt-20 px-6">
        {/* 헤더 섹션 */}
        <div className="py-10 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-wider">
              Visit Review
            </span>
            {currentUser &&
              String(post.userId) === String(currentUser.userId) && (
                <button
                  onClick={handleDeletePost}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-all text-[11px] font-bold"
                >
                  <Trash2 size={12} /> 삭제
                </button>
              )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8 break-keep">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 font-medium">
            <span className="text-slate-800 font-bold">
              {post.userNickname}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {post.createdAt?.split("T")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} /> {post.viewCount}
            </span>
            <span className="flex items-center gap-1 text-indigo-600 font-bold">
              <MessageSquare size={14} /> {comments.length}
            </span>
          </div>
        </div>

        {/* 이미지 배너 (커스텀 디자인 유지) */}
        {post.filePath && (
          <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 mb-12 aspect-video md:aspect-[21/9]">
            <img
              src={getImageUrl(post.filePath)!}
              alt="메인 인증샷"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        {/* 본문 내용 */}
        <div
          className="prose prose-lg prose-slate max-w-none text-slate-700 leading-8 mb-20
            [&>p]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h2]:text-2xl [&>h2]:font-bold 
            [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 
            [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-4 [&>blockquote]:italic
            [&>a]:text-blue-500 [&>a]:underline [&>img]:max-w-full [&>img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 댓글 섹션 (기능 통합) */}
        <section className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              댓글
              <span className="text-lg font-bold bg-indigo-100 text-indigo-600 px-3 py-0.5 rounded-full">
                {comments.length}
              </span>
            </h3>

            {/* 댓글 입력창 */}
            <div className="relative mb-12">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={
                  currentUser
                    ? "소중한 의견을 남겨주세요..."
                    : "로그인이 필요합니다."
                }
                disabled={!currentUser}
                className="w-full p-6 bg-white border-none rounded-3xl focus:ring-2 focus:ring-indigo-500/10 h-32 resize-none transition-all text-slate-700 placeholder:text-slate-400 font-medium disabled:bg-slate-100 disabled:cursor-not-allowed shadow-sm"
              />
              <button
                onClick={() => handleCommentSubmit(null)}
                disabled={!currentUser}
                className={`absolute bottom-4 right-4 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm ${
                  currentUser
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                    : "bg-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={16} /> 등록하기
              </button>
            </div>

            {/* 댓글 리스트 */}
            <div className="space-y-1">
              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium">
                    아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                  </p>
                </div>
              ) : (
                renderComments(comments)
              )}
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
