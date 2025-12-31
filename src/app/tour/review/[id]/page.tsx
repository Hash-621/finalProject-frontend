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
  Loader2,
  MapPin,
  ThumbsUp,
} from "lucide-react";
import { LucideThumbsUp } from "lucide-react";

// 백엔드 이미지 경로 설정을 위한 상수
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
  const [isLiked, setIsLiked] = useState(false); // 좋아요 상태
  const [likeCount, setLikeCount] = useState(0); // 좋아요 수

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

        // 2. 게시글 로드
        const postRes = await api.get(`/community/post/${id}`);
        setPost(postRes.data);
        setLikeCount(postRes.data.likeCount || 0);

        // 3. 좋아요 여부 확인 (백엔드에 관련 API가 있다면 호출)
        // const likeCheck = await api.get(`/community/post/${id}/like-check`);
        // setIsLiked(likeCheck.data.isLiked);

        // 4. 댓글 로드
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
      console.error("댓글 로드 실패:", err);
    }
  };

  // ================= 기능 핸들러 =================

  // 이미지 URL 변환
  const getImageUrl = (path: string) => {
    if (!path) return null;
    const fileName = path.split(/[/\\]/).pop();
    return `${BACKEND_URL}/images/${fileName}`;
  };

  // ★ 좋아요 기능 구현
  const handleLikeClick = async () => {
    if (!currentUser) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    try {
      // 백엔드 엔드포인트: /community/post/{id}/like (POST 방식 가정)
      const res = await api.post(`/community/post/${id}/like`);

      // 백엔드에서 변경된 좋아요 수를 반환한다고 가정
      setIsLiked(!isLiked);
      setLikeCount(res.data.likeCount);

      // 만약 단순 토글이라면 수동 계산
      // setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

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
      fetchComments();
    } catch (error) {
      console.error(error);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.post("/community/comments/delete", { id: commentId });
      fetchComments();
    } catch (error) {
      alert("댓글 삭제 실패");
    }
  };

  // 댓글 렌더링 (디자인 유지)
  const renderComments = (list: any[]) => {
    return list.map((comment) => {
      const isAuthor =
        currentUser && String(comment.userId) === String(currentUser.userId);
      const isReply = !!comment.parentId;

      return (
        <div key={comment.id} className="w-full group/comment">
          <div className={`flex ${isReply ? "mt-3" : "mt-8"}`}>
            {isReply && (
              <div className="flex flex-col items-end mr-4 pt-4 min-w-6">
                <CornerDownRight className="text-emerald-300 w-5 h-5" />
              </div>
            )}
            <div
              className={`flex-1 rounded-[24px] p-6 transition-all duration-300 ${
                isReply
                  ? "bg-slate-50 border border-slate-100"
                  : "bg-white border border-slate-100 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center font-bold text-sm rounded-full shrink-0 ${
                      isReply
                        ? "w-8 h-8 bg-white text-slate-400 border border-slate-200"
                        : "w-10 h-10 text-white bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200"
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {comment.createdAt?.split("T")[0] || "날짜없음"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                  {!comment.isDelete && (
                    <button
                      onClick={() =>
                        setActiveReplyId(
                          activeReplyId === comment.id ? null : comment.id
                        )
                      }
                      className="text-xs font-bold text-slate-400 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                    >
                      답글달기
                    </button>
                  )}
                  {isAuthor && !comment.isDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p
                className={`text-[15px] leading-7 pl-1 whitespace-pre-wrap ${
                  comment.isDelete
                    ? "text-slate-400 italic"
                    : "text-slate-700 font-medium"
                }`}
              >
                {comment.isDelete ? "삭제된 댓글입니다." : comment.content}
              </p>
              {activeReplyId === comment.id && (
                <div className="mt-5 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-24 outline-none resize-none shadow-inner focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all"
                    placeholder={`@${comment.userNickname} 님에게 답글 작성 중...`}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleCommentSubmit(comment.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-200"
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
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <nav className="sticky top-4 mx-4 md:mx-auto max-w-4xl z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-full px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/tour/review")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition-all group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-sm font-bold text-slate-800 truncate px-4 max-w-[200px] md:max-w-md opacity-80">
            {post.title}
          </h1>
          <div className="w-10" />
        </div>
      </nav>

      <article className="max-w-4xl mx-auto pt-8 px-6 pb-32 relative z-10">
        <div className="py-12 text-center">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                <MapPin size={12} className="text-emerald-500" /> Visit Review
              </span>
              {currentUser &&
                String(post.userId) === String(currentUser.userId) && (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-all text-[11px] font-bold"
                  >
                    삭제
                  </button>
                )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight break-keep tracking-tight">
              {post.title}
            </h1>
          </div>

          <div className="inline-flex items-center gap-6 md:gap-8 px-8 py-4 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                {post.userNickname ? post.userNickname[0] : "?"}
              </div>
              <span className="text-sm font-bold text-slate-700">
                {post.userNickname}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {post.createdAt?.split("T")[0]}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> {post.viewCount}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <MessageSquare size={14} /> {comments.length}
              </span>
            </div>
          </div>
        </div>

        {/* 🖼️ 수정된 이미지 영역: 짤리지 않게 크기 조정 */}
        {post.filePath && (
          <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 mb-16 border-4 border-white bg-white">
            <img
              src={getImageUrl(post.filePath)!}
              alt="메인 인증샷"
              className="w-full h-auto max-h-[800px] object-contain mx-auto transition-transform duration-1000 ease-out"
            />
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100 mb-12">
          <div
            className="prose prose-lg prose-slate max-w-none text-slate-600 leading-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* ❤️ 좋아요(도움이 됐어요) 버튼 구현 */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all group scale-100 active:scale-95 ${
                isLiked
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-100"
              }`}
            >
              <ThumbsUp
                size={20}
                className={`transition-transform group-hover:scale-110 ${
                  isLiked ? "fill-white" : ""
                }`}
              />
              <span>{isLiked ? "추천했습니다!" : "도움이 됐어요"}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  isLiked ? "bg-white/20" : "bg-slate-200 text-slate-600"
                }`}
              >
                {likeCount}
              </span>
            </button>
            <p className="text-xs text-slate-400 font-medium tracking-tight">
              이 리뷰가 도움이 되었다면 버튼을 눌러주세요!
            </p>
          </div>
        </div>

        {/* 댓글 섹션 (기존 코드 유지) */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 rounded-[3rem] -z-10 shadow-sm border border-slate-100" />
          <div className="p-8 md:p-12">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              댓글{" "}
              <span className="flex items-center justify-center h-6 min-w-[24px] px-1.5 text-xs font-bold bg-emerald-100 text-emerald-600 rounded-full">
                {comments.length}
              </span>
            </h3>
            <div className="relative mb-12 group focus-within:z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500 -z-10" />
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={
                  currentUser
                    ? "따뜻한 댓글 한마디는 작성자에게 큰 힘이 됩니다 :)"
                    : "로그인이 필요합니다."
                }
                disabled={!currentUser}
                className="w-full p-6 bg-white border border-transparent rounded-[1.8rem] focus:border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 h-36 resize-none transition-all text-slate-700 placeholder:text-slate-300 font-medium leading-relaxed disabled:bg-slate-50 disabled:cursor-not-allowed shadow-sm"
              />
              <button
                onClick={() => handleCommentSubmit(null)}
                disabled={!currentUser}
                className={`absolute bottom-4 right-4 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2 text-sm hover:-translate-y-1 ${
                  currentUser
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30"
                    : "bg-slate-300 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={16} /> 작성완료
              </button>
            </div>
            <div className="space-y-2">
              {comments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">
                    아직 댓글이 없습니다.
                    <br />첫 번째 댓글의 주인공이 되어보세요!
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
