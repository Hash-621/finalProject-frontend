"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios"; // 경로에 맞게 수정
import {
  Clock,
  Eye,
  ChevronLeft,
  Send,
  Loader2,
  Trash2,
  CornerDownRight,
  MessageSquare,
} from "lucide-react";
import Cookies from "js-cookie";
import { userService } from "@/api/services";

// 테마 설정
const THEMES = {
  green: {
    badge: "bg-green-50 text-green-600",
    profileBg: "bg-linear-to-br from-green-500 to-green-600",
    profileShadow: "shadow-green-100",
    textMain: "text-green-600",
    button: "bg-green-600 hover:bg-green-700 shadow-green-100",
    icon: "text-green-500",
    commentCount: "bg-green-50 text-green-600",
    myBadge: "bg-green-50 text-green-600 border-green-100",
    hoverText: "hover:text-green-600",
    focusRing: "focus:ring-green-500/10",
  },
  blue: {
    badge: "bg-blue-50 text-blue-600",
    profileBg: "bg-linear-to-br from-blue-500 to-blue-600",
    profileShadow: "shadow-blue-100",
    textMain: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
    icon: "text-blue-500",
    commentCount: "bg-blue-50 text-blue-600",
    myBadge: "bg-blue-50 text-blue-600 border-blue-100",
    hoverText: "hover:text-blue-600",
    focusRing: "focus:ring-blue-500/10",
  },
};

interface CommonPostDetailProps {
  postId: string;
  theme: "green" | "blue";
  categoryLabel: string; // 예: Free Board, Recommendation
  listPath: string; // 목록으로 돌아갈 경로
  apiEndpoints: {
    fetchPost: string; // 게시글 조회 API URL
    deletePost?: string; // 게시글 삭제 API URL (옵션)
    fetchComments: string; // 댓글 조회 API URL
    postComment: string; // 댓글 작성 API URL
    deleteComment: string; // 댓글 삭제 API URL
  };
}

export default function CommunutyPostDetail({
  postId,
  theme,
  categoryLabel,
  listPath,
  apiEndpoints,
}: CommonPostDetailProps) {
  const router = useRouter();
  const styles = THEMES[theme];

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 댓글 관련 상태
  const [commentContent, setCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // 유저 정보
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. 유저 정보 및 게시글/댓글 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 유저 정보 가져오기 (토큰 기반)
        const token = Cookies.get("token");
        if (token) {
          try {
            const userRes = await userService.getUserInfo().catch(() => null);
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

        const postRes = await api.get(apiEndpoints.fetchPost);
        setPost(postRes.data);

        await fetchComments();
      } catch (err) {
        console.error(err);
        alert("게시글을 불러올 수 없습니다.");
        router.push(listPath);
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchData();
  }, [postId, listPath]);

  const fetchComments = async () => {
    try {
      const res = await api.get(apiEndpoints.fetchComments);
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

  const handleDeletePost = async () => {
    if (!apiEndpoints.deletePost) return;
    if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return;

    try {
      await api.delete(apiEndpoints.deletePost);
      alert("게시글이 삭제되었습니다.");
      router.push(listPath);
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
      await api.post(apiEndpoints.postComment, {
        postId: postId,
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
      await api.post(apiEndpoints.deleteComment, { id: commentId });
      fetchComments();
    } catch (error) {
      alert("댓글 삭제 실패");
    }
  };

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
                        : `w-10 h-10 text-white ${styles.profileBg} shadow-lg ${styles.profileShadow}`
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
                        <span
                          className={`text-[10px] px-1.5 rounded font-bold border ${styles.myBadge}`}
                        >
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
                      className={`text-xs font-bold text-slate-400 ${styles.hoverText} px-2 py-1 transition-colors`}
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

              {/* 답글 입력창 */}
              {activeReplyId === comment.id && (
                <div className="mt-5 pt-4 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className={`w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm h-24 outline-none resize-none shadow-sm ${styles.focusRing} focus:ring-4`}
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
                      className={`${styles.button} text-white px-5 py-2 rounded-lg font-bold text-xs transition-all`}
                    >
                      등록하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 대댓글 재귀 렌더링 */}
          {comment.children?.length > 0 && (
            <div className="pl-6 md:pl-12">
              {renderComments(comment.children)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Loader2 className={`animate-spin ${styles.textMain} w-10 h-10`} />
      </div>
    );
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 상단 네비게이션 */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push(listPath)}
            className={`group flex items-center text-slate-500 ${styles.hoverText} transition-colors`}
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
            <div className="flex items-center justify-between mb-6">
              <span
                className={`${styles.badge} text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider`}
              >
                {categoryLabel}
              </span>

              {apiEndpoints.deletePost &&
                currentUser &&
                String(post.userId) === String(currentUser.userId) && (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all text-sm font-bold"
                  >
                    <Trash2 size={16} /> 삭제
                  </button>
                )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-[1.3] tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 border-b border-slate-50 pb-8 mb-10">
              <div
                className={`w-12 h-12 ${styles.profileBg} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${styles.profileShadow}`}
              >
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

            <div
              className="text-slate-700 leading-[1.8] text-[17px] font-medium min-h-[300px] wrap-break-words
              [&>p]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h2]:text-2xl [&>h2]:font-bold 
              [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 
              [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-4 [&>blockquote]:italic
              [&>a]:text-blue-500 [&>a]:underline [&>img]:max-w-full [&>img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              댓글{" "}
              <span
                className={`text-lg font-bold ${styles.commentCount} px-3 py-0.5 rounded-full`}
              >
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
                className={`w-full p-6 bg-slate-50 border-none rounded-3xl ${styles.focusRing} focus:ring-2 h-32 resize-none transition-all text-slate-700 placeholder:text-slate-400 font-medium disabled:bg-slate-100 disabled:cursor-not-allowed`}
              />
              <button
                onClick={() => handleCommentSubmit(null)}
                disabled={!currentUser}
                className={`absolute bottom-4 right-4 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm ${
                  currentUser
                    ? styles.button
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
                    아직 댓글이 없습니다.
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
