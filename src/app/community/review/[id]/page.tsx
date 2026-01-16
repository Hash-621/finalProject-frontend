// 1. "use client" 선언
"use client";

// 2. React 필수 훅 불러오기
import React, { useEffect, useState, use } from "react";

// 3. 페이지 이동 훅
import { useRouter } from "next/navigation";

// 4. axios 도구
import api from "@/api/axios";

// 5. 쿠키 도구
import Cookies from "js-cookie";

// 6. 유저 서비스
import { userService } from "@/api/services";

// 7. 아이콘 불러오기
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
  Camera,
  ArrowLeft,
} from "lucide-react";

// 8. 모달 컴포넌트
import Modal from "@/components/common/Modal";

// 관리자 권한 체크 훅
import useAdminCheck from "@/hooks/useAdminCheck";

// 9. 백엔드 URL 설정
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ;

// 11. 메인 컴포넌트
export default function TourReviewDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = useAdminCheck(); // 관리자 여부 확인
  const router = useRouter();
  const { id } = use(params);

  // ================= 상태 관리 =================

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentContent, setCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // --- [모달 관련 상태] ---
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

  // ================= 데이터 로딩 =================

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 사용자 정보 로드
        const token = Cookies.get("token");
        let currentUserId = null;

        if (token) {
          try {
            const userRes = await userService.getUserInfo();
            if (userRes?.data) {
              const data = userRes.data;
              currentUserId = data.userId || data.id || data.loginId;
              setCurrentUser({
                userId: currentUserId,
                nickname: data.userNickname || data.nickname,
              });
            }
          } catch (e) {
            console.error("Auth check failed", e);
          }
        }

        // 2. 게시글 상세 정보 로드
        const postRes = await api.get(`/community/post/${id}`);
        const postData = postRes.data;

        setPost(postData);
        setLikeCount(postData.likeCount ?? 0);

        if (postData.liked !== undefined) {
          setIsLiked(postData.liked);
        } else if (postData.isLiked !== undefined) {
          setIsLiked(postData.isLiked);
        } else {
          setIsLiked(false);
        }

        // 3. 댓글 로드
        await fetchComments();
      } catch (err: any) {
        console.error("상세 로딩 실패:", err);

        // [수정] 에러 발생 시 모달 띄우기 (404, 500 등)
        if (
          err.response &&
          (err.response.status === 404 || err.response.status === 500)
        ) {
          openModal(
            "게시글을 찾을 수 없거나 삭제되었습니다.",
            "error",
            "오류",
            () => router.push("/community/review") // 확인 누르면 목록으로 이동
          );
        } else {
          openModal("데이터를 불러오는 중 오류가 발생했습니다.", "error");
        }
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

  // ================= 기능 핸들러 =================

  const getImageUrl = (path: string) => {
    if (!path) return null;
    const fileName = path.split(/[/\\]/).pop();
    return `${BACKEND_URL}/images/${fileName}`;
  };

  const handleLikeClick = async () => {
    if (!currentUser) {
      openModal("로그인이 필요한 서비스입니다.", "warning");
      return;
    }

    try {
      const res = await api.post(`/community/post/${id}/like`);
      setIsLiked(!isLiked);
      setLikeCount(res.data.likeCount);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      openModal("좋아요 처리에 실패했습니다.", "error");
    }
  };

  const handleDeletePost = () => {
    openModal(
      "정말로 이 글을 삭제하시겠습니까?",
      "confirm",
      "삭제 확인",
      async () => {
        try {
          await api.delete(`/community/post/${id}`);
          openModal("게시글이 삭제되었습니다.", "success", "삭제 완료", () =>
            router.push("/community/review")
          );
        } catch (error) {
          console.error(error);
          openModal("삭제 실패했습니다.", "error");
        }
      }
    );
  };

  const handleCommentSubmit = async (targetId: number | null = null) => {
    const finalParentId = targetId || activeReplyId;
    const content = finalParentId ? replyContent : commentContent;

    if (!content.trim()) return openModal("내용을 입력해주세요.", "warning");
    if (!currentUser) return openModal("로그인이 필요합니다.", "warning");

    try {
      await api.post("/community/comments", {
        postId: id,
        userId: currentUser.userId,
        userNickname: currentUser.nickname,
        content: content,
        parentId: finalParentId,
      });

      if (finalParentId) {
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

  const handleDeleteComment = (commentId: number) => {
    openModal("정말 삭제하시겠습니까?", "confirm", "댓글 삭제", async () => {
      try {
        await api.post("/community/comments/delete", { id: commentId });
        fetchComments();
      } catch (error) {
        openModal("댓글 삭제 실패", "error");
      }
    });
  };

  // ================= 렌더링 함수 =================

  const renderComments = (list: any[]) => {
    return list.map((comment) => {
      // 본인 확인
      const isAuthor =
        currentUser && String(comment.userId) === String(currentUser.userId);
      // [수정] 관리자이거나 작성자 본인이면 삭제 가능
      const canDelete = isAdmin || (isAuthor && !comment.isDelete);

      const isReply = !!comment.parentId;

      return (
        <div key={comment.id} className="w-full">
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
                      ? `bg-slate-50 rounded-2xl p-5 border-slate-200`
                      : "bg-white border border-slate-100 rounded-4xl p-5 sm:p-8 "
                  }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`hidden sm:flex items-center justify-center font-bold text-sm shadow-md rounded-2xl ${
                      isReply
                        ? "w-8 h-8 bg-white text-slate-600 border border-slate-200"
                        : "w-11 h-11 text-white bg-linear-to-br from-emerald-400 to-teal-500 shadow-emerald-100"
                    }`}
                  >
                    {(comment.userNickname || "?")[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          isReply
                            ? "text-slate-700 text-sm "
                            : "text-slate-900 text-[16px] block truncate max-w-[5em] sm:max-w-none"
                        }`}
                      >
                        {comment.userNickname}
                      </span>
                      {isAuthor && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {comment.createdAt?.split("T")[0] || ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:gap-1 opacity-90">
                  {!comment.isDelete && (
                    <button
                      onClick={() =>
                        setActiveReplyId(
                          activeReplyId === comment.id ? null : comment.id
                        )
                      }
                      className="text-xs font-bold text-slate-400 hover:text-emerald-600 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      답글
                    </button>
                  )}
                  {/* [수정] canDelete 변수 사용 (관리자 포함) */}
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
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-600 ml-1">
                    <CornerDownRight size={12} />
                    <span>@{comment.userNickname}님에게 작성 중...</span>
                  </div>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm h-24 outline-none resize-none shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-md shadow-emerald-100"
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

  // ================= 실제 HTML 반환 (메인 렌더링) =================

  // 1. 로딩 중일 때 스피너 표시
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );

  // 2. [중요 수정] 로딩은 끝났는데 게시글(post)이 없는 경우 (에러 상황)
  // 이때 Modal 컴포넌트를 렌더링해야 에러 알림창이 보입니다.
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
        {/* 모달 뒤에 보일 빈 배경 */}
        <div className="min-h-screen bg-[#F8FAFC]" />
      </>
    );
  }

  // 3. 정상 데이터가 있을 때 화면
  return (
    
    <div className="min-h-screen bg-[#F8FAFC] pb-8 sm:pb-32">
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-8">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/community/review")}
            className="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-bold">목록보기</span>
          </button>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden mb-12">
          <div className="p-8 md:p-12 pb-6">
            <div className="flex justify-between items-start mb-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-extrabold uppercase tracking-wider">
                <MapPin size={12} /> Travel Log
              </span>

              {/* [수정] 관리자(isAdmin)이거나 작성자 본인일 때 삭제 버튼 표시 */}
              {(isAdmin ||
                (currentUser &&
                  String(post.userId) === String(currentUser.userId))) && (
                <button
                  onClick={handleDeletePost}
                  className="flex items-center gap-1 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all text-xs font-bold"
                >
                  <Trash2 size={14} /> 삭제
                </button>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight mb-8 break-keep">
              {post.title}
            </h2>

            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-100">
                  {post.userNickname ? post.userNickname[0] : "?"}
                </div>
                <div>
                  <div className="font-bold text-slate-800">
                    {post.userNickname}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Traveler
                  </div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-slate-100" />

              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Clock size={14} /> {post.createdAt?.split("T")[0]}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Eye size={14} /> {post.viewCount}
                </span>
              </div>
            </div>
          </div>

          {post.filePath && (
            <div className="px-8 md:px-12 pb-8">
              <div className="relative w-full rounded-4xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
                <img
                  src={getImageUrl(post.filePath)!}
                  alt="여행 사진"
                  className="w-full h-auto max-h-[700px] object-contain mx-auto hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Camera size={14} /> Photo
                </div>
              </div>
            </div>
          )}

          <div className="px-8 md:px-12 pb-12">
            <div
              className="prose prose-lg prose-slate max-w-none text-slate-600 leading-8
               [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-slate-800
               [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-emerald-700 [&>h2]:mt-10
               [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-300 [&>blockquote]:bg-emerald-50/50 [&>blockquote]:py-2 [&>blockquote]:px-4 [&>blockquote]:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <div className="bg-slate-50 py-10 flex flex-col items-center justify-center gap-4 border-t border-slate-100">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all group scale-100 active:scale-95 shadow-lg ${
                isLiked
                  ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200 ring-4 ring-emerald-100"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              <ThumbsUp
                size={22}
                className={`transition-transform group-hover:-rotate-12 ${
                  isLiked ? "fill-white" : ""
                }`}
              />
              <span className="text-sm">
                <span className="hidden sm:block text-sm">
                  여행에 도움이 됐어요
                </span>
                <span className="block sm:hidden text-sm">좋아요</span>
              </span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-black ${
                  isLiked
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {likeCount}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              댓글{" "}
              <span className="text-lg font-bold bg-emerald-50 text-emerald-600 px-3 py-0.5 rounded-full border border-emerald-100">
                {allComments.length}
              </span>
            </h3>

            <div className="relative mb-6 sm:mb-12">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={
                  currentUser
                    ? "여행에 대한 궁금한 점이나 따뜻한 댓글을 남겨주세요 :)"
                    : "로그인이 필요합니다."
                }
                disabled={!currentUser}
                className="w-full p-6 bg-slate-50 border-none rounded-4xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white h-36 resize-none transition-all text-slate-700 placeholder:text-slate-400 font-medium shadow-inner"
              />
              <button
                onClick={() => handleCommentSubmit(null)}
                disabled={!currentUser}
                className={`absolute bottom-6 right-4 text-white font-bold p-3 sm:px-6 sm:py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm hover:-translate-y-1 ${
                  currentUser
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                    : "bg-slate-300 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={16} />{" "}
                <span className="hidden sm:block">등록하기</span>
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
        </div>
      </article>
    </div>
  );
}
