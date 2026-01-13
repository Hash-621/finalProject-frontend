// "use client": 이 컴포넌트는 브라우저에서 실행됩니다. (상태 관리, 클릭 이벤트, 라우팅 등)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import {
  Clock,
  Eye,
  ChevronLeft,
  Send,
  Loader2,
  Trash2,
  CornerDownRight,
  MessageSquare,
  FileText, // 📄 파일 아이콘
  Download, // 📥 다운로드 아이콘
  Paperclip,
  ArrowLeft, // 📎 [수정] 파일 첨부 아이콘 추가됨
} from "lucide-react";
import Cookies from "js-cookie";
import { userService } from "@/api/services";
import useAdminCheck from "@/hooks/useAdminCheck";
import Modal from "@/components/common/Modal";

// --- [테마 설정 객체] ---
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
  slate: {
    badge: "bg-slate-100 text-slate-600",
    profileBg: "bg-linear-to-br from-slate-600 to-slate-800",
    profileShadow: "shadow-slate-200",
    textMain: "text-slate-600",
    button: "bg-slate-800 hover:bg-slate-900 shadow-slate-200",
    icon: "text-slate-500",
    commentCount: "bg-slate-100 text-slate-600",
    myBadge: "bg-slate-50 text-slate-600 border-slate-200",
    hoverText: "hover:text-slate-800",
    focusRing: "focus:ring-slate-500/10",
  },
};

// 백엔드 URL (파일 다운로드 경로용)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- [Props 타입 정의] ---
interface CommonPostDetailProps {
  postId: string;
  theme: "green" | "slate";
  categoryLabel: string;
  listPath: string;
  apiEndpoints: {
    fetchPost: string;
    deletePost?: string;
    fetchComments: string;
    postComment: string;
    deleteComment: string;
  };
}

// --- [메인 컴포넌트 시작] ---
export default function CommunutyPostDetail({
  postId,
  theme,
  categoryLabel,
  listPath,
  apiEndpoints,
}: CommonPostDetailProps) {
  const router = useRouter();
  const styles = THEMES[theme];

  // --- [상태 관리 (State)] ---
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✨ [추가] 첨부 파일 목록 상태
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  const [commentContent, setCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const { isAdmin } = useAdminCheck();

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  const openModal = (
    content: string,
    type: "success" | "error" | "warning" | "confirm" = "success",
    title?: string,
    onConfirm?: () => void
  ) => {
    setModalConfig({
      isOpen: true,
      content,
      type,
      title:
        title ||
        (type === "error" ? "오류" : type === "confirm" ? "확인" : "알림"),
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // --- [1. 초기 데이터 로드 (useEffect)] ---
  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // ✨ [추가] 첨부 파일 목록 불러오기
        try {
          const filesRes = await api.get(`/community/post/${postId}/files`);
          if (Array.isArray(filesRes.data)) {
            setAttachedFiles(filesRes.data);
          }
        } catch (fileErr) {
          console.error("파일 목록 로드 실패 (파일이 없거나 오류)", fileErr);
        }

        await fetchComments();
      } catch (err: any) {
        console.error(err);
        if (
          err.response &&
          (err.response.status === 404 || err.response.status === 500)
        ) {
          openModal(
            "게시글을 찾을 수 없거나 삭제되었습니다.",
            "error",
            "오류",
            () => router.push(listPath)
          );
        } else {
          openModal("게시글을 불러올 수 없습니다.", "error");
        }
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
      setAllComments(rawComments);
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

    openModal(
      "정말로 이 글을 삭제하시겠습니까?",
      "confirm",
      "삭제 확인",
      async () => {
        try {
          await api.delete(apiEndpoints.deletePost!);
          openModal("게시글이 삭제되었습니다.", "success", "삭제 완료", () =>
            router.push(listPath)
          );
        } catch (error) {
          console.error(error);
          openModal("삭제 실패했습니다.", "error");
        }
      }
    );
  };

  const handleCommentSubmit = async (parentId: number | null = null) => {
    const content = parentId ? replyContent : commentContent;

    if (!content.trim()) return openModal("내용을 입력해주세요.", "warning");
    if (!currentUser) return openModal("로그인이 필요합니다.", "warning");

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
      openModal("댓글 등록 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    openModal("정말 삭제하시겠습니까?", "confirm", "댓글 삭제", async () => {
      try {
        await api.post(apiEndpoints.deleteComment, { id: commentId });
        fetchComments();
      } catch (error) {
        openModal("댓글 삭제 실패", "error");
      }
    });
  };

  const renderComments = (list: any[]) => {
    return list.map((comment) => {
      const isAuthor =
        currentUser && String(comment.userId) === String(currentUser.userId);
      const canDelete = isAdmin || (isAuthor && !comment.isDelete);
      const isReply = !!comment.parentId;

      return (
        <div key={comment.id} className="w-fit min-w-full">
          <div
            className={`flex ${
              isReply ? "mt-3" : "mt-6"
            } w-[calc(100vw-7rem)] md:w-full`}
          >
            {isReply && (
              <div className="flex flex-col items-end mr-3 pt-4 min-w-5">
                <CornerDownRight
                  className="text-slate-300 w-5 h-5"
                  strokeWidth={2}
                />
              </div>
            )}

            <div
              className={`flex-1 transition-all relative overflow-hidden group
                ${
                  isReply
                    ? "bg-slate-50 rounded-2xl p-4"
                    : "bg-white border border-slate-100 rounded-2xl p-8 "
                }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center font-bold text-sm shadow-md rounded-2xl ${
                      isReply
                        ? "w-8 h-8 bg-white text-slate-600 border border-slate-200"
                        : `w-11 h-11 text-white ${styles.profileBg} ${styles.profileShadow}`
                    }`}
                  >
                    {(comment.userNickname || "?")[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          isReply
                            ? "text-slate-700 text-sm"
                            : "text-slate-900 text-[16px]"
                        }`}
                      >
                        {comment.userNickname}
                      </span>
                      {isAuthor && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${styles.myBadge}`}
                        >
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {comment.createdAt?.split("T")[0] || ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-90">
                  {!comment.isDelete && (
                    <button
                      onClick={() =>
                        setActiveReplyId(
                          activeReplyId === comment.id ? null : comment.id
                        )
                      }
                      className={`text-xs font-bold ${styles.hoverText} px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors`}
                    >
                      답글
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <p
                className={`whitespace-pre-wrap leading-relaxed ${
                  comment.isDelete
                    ? "text-slate-400 italic text-sm"
                    : `font-medium ${
                        isReply
                          ? "text-slate-600 text-[14px] pl-1"
                          : "text-slate-800 text-[16px] pl-1"
                      }`
                }`}
              >
                {comment.isDelete ? "삭제된 댓글입니다." : comment.content}
              </p>

              {activeReplyId === comment.id && (
                <div className="mt-5 pt-4 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 ml-1">
                    <CornerDownRight size={12} />
                    <span>@{comment.userNickname}님에게 작성 중...</span>
                  </div>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className={`w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm h-24 outline-none resize-none shadow-sm ${styles.focusRing} focus:ring-2`}
                    placeholder="내용을 입력하세요..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
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

          {comment.children?.length > 0 && (
            <div className="pl-6 md:pl-12 my-2">
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

  if (!post) {
    return (
      <>
        <Modal
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          title={modalConfig.title}
          content={modalConfig.content}
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
        />
        <div className="min-h-screen bg-[#F8FAFC]"></div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push(listPath)}
            className={`group flex items-center text-slate-500 ${styles.hoverText} transition-colors`}
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="ml-1 font-bold">목록보기</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {/* 1. 게시글 본문 섹션 */}
        <article className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-8 md:p-12 md:scroll-ml-2">
            <div className="flex items-center justify-between mb-6">
              <span
                className={`${styles.badge} text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider`}
              >
                {categoryLabel}
              </span>

              {apiEndpoints.deletePost &&
                ((currentUser &&
                  String(post.userId) === String(currentUser.userId)) ||
                  isAdmin) && (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all text-sm font-bold"
                  >
                    <Trash2 size={16} /> 삭제
                  </button>
                )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-[1.3] tracking-tight">
              {post.title}
            </h2>

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

            {/* ✨ [추가] 첨부 파일 목록 (다운로드 가능) */}
            {attachedFiles.length > 0 && (
              <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <Paperclip size={16} /> 첨부파일 ({attachedFiles.length})
                </p>
                <div className="flex flex-col gap-2">
                  {attachedFiles.map((filePath, idx) => {
                    const fileName = filePath.split("/").pop(); // 경로에서 파일명만 추출
                    const fullUrl = `${BACKEND_URL}${filePath}`; // 전체 다운로드 주소

                    return (
                      <a
                        key={idx}
                        href={fullUrl}
                        download // 다운로드 속성 추가
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            theme === "green"
                              ? "bg-green-50 text-green-500"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FileText size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                          {fileName}
                        </span>
                        <Download
                          size={16}
                          className="text-slate-400 group-hover:text-slate-600"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className="text-slate-700 leading-[1.8] text-[17px] font-medium min-h-[300px] wrap-break-words
              [&>p]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h2]:text-2xl [&>h2]:font-bold 
              [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 
              [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-4 [&>blockquote]:italic
              [&>a]:text-slate-500 [&>a]:underline [&>img]:max-w-full [&>img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* 2. 댓글 섹션 */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              댓글{" "}
              <span
                className={`text-lg font-bold ${styles.commentCount} px-3 py-0.5 rounded-full`}
              >
                {allComments.length}
              </span>
            </h3>

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
                className={`absolute bottom-6 right-4 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm ${
                  currentUser
                    ? styles.button
                    : "bg-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={16} /> 등록하기
              </button>
            </div>

            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="w-full space-y-1">
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
          </div>
        </section>
      </div>
    </div>
  );
}
