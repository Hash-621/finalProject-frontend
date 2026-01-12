// 1. "use client": 이 컴포넌트는 브라우저에서 실행됩니다. (상태 관리, 클릭 이벤트, 라우팅 등)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import React, { useEffect, useState } from "react"; // 리액트 기본 훅(상태 관리, 수명 주기)
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 훅
import api from "@/api/axios"; // 서버 통신용 axios 인스턴스
// 각종 아이콘들을 가져옵니다.
import {
  Clock, // 작성 시간 아이콘
  Eye, // 조회수 아이콘
  ArrowLeft, // 뒤로가기 화살표
  Send, // 전송(종이비행기) 아이콘
  Loader2, // 로딩 스피너
  Trash2, // 삭제(휴지통) 아이콘
  CornerDownRight, // 대댓글 화살표 (ㄴ 모양)
  MessageSquare, // 댓글 말풍선 아이콘
} from "lucide-react";
import Cookies from "js-cookie"; // 쿠키 관리 (토큰 확인용)
import { userService } from "@/api/services"; // 유저 정보 조회 서비스
import useAdminCheck from "@/hooks/useAdminCheck"; // 관리자 권한 확인 훅

// [추가됨] 공통 모달 컴포넌트 임포트
import Modal from "@/components/common/Modal";

// --- [테마 설정 객체] ---
// theme prop('green' 또는 'slate')에 따라 적용할 Tailwind CSS 클래스들을 미리 정의해둡니다.
// 이렇게 하면 디자인을 일일이 조건문으로 분기하지 않고 깔끔하게 관리할 수 있습니다.
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

// --- [Props 타입 정의] ---
// 부모 컴포넌트로부터 받아야 할 데이터들의 규칙을 정합니다.
interface CommonPostDetailProps {
  postId: string; // 게시글 고유 ID
  theme: "green" | "slate"; // 테마 색상 선택
  categoryLabel: string; // 카테고리 이름 라벨 (예: "자유게시판")
  listPath: string; // '목록으로' 버튼 클릭 시 이동할 경로
  apiEndpoints: {
    // 각 기능별 API 주소 모음
    fetchPost: string; // 글 상세 조회
    deletePost?: string; // 글 삭제 (선택 사항)
    fetchComments: string; // 댓글 목록 조회
    postComment: string; // 댓글 작성
    deleteComment: string; // 댓글 삭제
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
  // 1. 라우터와 테마 스타일 준비
  const router = useRouter();
  const styles = THEMES[theme]; // 선택된 테마('green' 등)의 스타일 객체를 가져옵니다.

  // --- [상태 관리 (State)] ---
  const [post, setPost] = useState<any>(null); // 게시글 상세 데이터
  const [comments, setComments] = useState<any[]>([]); // 댓글 목록 (계층 구조로 변환된)
  const [loading, setLoading] = useState(true); // 데이터 로딩 중 여부

  // 댓글 입력 관련 상태
  const [commentContent, setCommentContent] = useState(""); // 새 댓글 입력창 내용
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null); // 현재 답글(대댓글) 작성 중인 부모 댓글 ID
  const [replyContent, setReplyContent] = useState(""); // 대댓글 입력창 내용

  // 로그인한 사용자 정보 상태
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { isAdmin } = useAdminCheck(); // 관리자 권한 여부 확인 훅 사용

  // [추가됨] 모달의 열림 여부, 제목, 내용 등을 관리하는 상태
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  // [추가됨] 모달을 쉽게 열기 위한 헬퍼 함수
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

  // [추가됨] 모달 닫기 함수
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // --- [1. 초기 데이터 로드 (useEffect)] ---
  // 컴포넌트가 처음 나타나거나 postId가 바뀌면 실행됩니다.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // (1) 유저 정보 확인 로직 (기존 코드 유지)
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

        // (2) 게시글 상세 데이터 요청 (기존 코드 유지)
        const postRes = await api.get(apiEndpoints.fetchPost);
        setPost(postRes.data);

        // (3) 댓글 목록 요청 (기존 코드 유지)
        await fetchComments();
      } catch (err: any) {
        console.error(err);

        // 🔥 [수정됨] 404(없음) 혹은 500 에러 시 모달을 띄우고 목록으로 이동
        if (
          err.response &&
          (err.response.status === 404 || err.response.status === 500)
        ) {
          openModal(
            "게시글을 찾을 수 없거나 삭제되었습니다.",
            "error",
            "오류",
            () => router.push(listPath) // 확인 버튼 누르면 목록으로 이동
          );
        } else {
          // 그 외 다른 에러일 때
          openModal("게시글을 불러올 수 없습니다.", "error");
        }
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    if (postId) fetchData();
  }, [postId, listPath]);

  // --- [댓글 목록 조회 및 구조화 함수] ---
  const fetchComments = async () => {
    try {
      const res = await api.get(apiEndpoints.fetchComments);
      const rawComments = res.data; // 서버에서 받은 댓글 데이터 (평평한 1차원 배열)
      console.log("전체 댓글 데이터:", rawComments);

      // [핵심 로직] 1차원 배열을 부모-자식 트리 구조로 변환
      const commentMap = new Map(); // 빠른 조회를 위해 Map 사용
      const rootComments: any[] = []; // 최상위(부모 없는) 댓글들만 담을 배열

      // 1단계: 모든 댓글을 Map에 등록하고, children 배열을 빈 값으로 초기화
      rawComments.forEach((c: any) =>
        commentMap.set(c.id, { ...c, children: [] })
      );

      // 2단계: 부모-자식 관계 연결
      rawComments.forEach((c: any) => {
        if (c.parentId) {
          // 부모가 있는 댓글(대댓글)인 경우
          const parent = commentMap.get(c.parentId); // 부모를 찾아서
          if (parent) parent.children.push(commentMap.get(c.id)); // 부모의 children 목록에 나를 넣음
        } else {
          // 부모가 없는 댓글(최상위 댓글)인 경우
          rootComments.push(commentMap.get(c.id)); // 최상위 목록에 넣음
        }
      });

      setComments(rootComments); // 구조화된 댓글 목록 저장
    } catch (err) {
      console.error("댓글 로드 실패:", err);
    }
  };

  // --- [게시글 삭제 핸들러] ---
  const handleDeletePost = async () => {
    if (!apiEndpoints.deletePost) return; // 삭제 API가 없으면 실행 안 함

    // [수정됨] confirm 대신 openModal 사용
    openModal(
      "정말로 이 글을 삭제하시겠습니까?",
      "confirm",
      "삭제 확인",
      async () => {
        try {
          await api.delete(apiEndpoints.deletePost!); // 삭제 요청 전송 (!는 위에서 체크했으므로 확신)
          // 삭제 성공 시 성공 알림 후 목록 이동
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

  // --- [댓글/대댓글 작성 핸들러] ---
  const handleCommentSubmit = async (parentId: number | null = null) => {
    // parentId 유무에 따라 대댓글 내용인지, 일반 댓글 내용인지 선택
    const content = parentId ? replyContent : commentContent;

    // 유효성 검사 (alert -> openModal)
    if (!content.trim()) return openModal("내용을 입력해주세요.", "warning");
    if (!currentUser) return openModal("로그인이 필요합니다.", "warning");

    try {
      // 댓글 등록 API 요청
      await api.post(apiEndpoints.postComment, {
        postId: postId,
        userId: currentUser.userId,
        userNickname: currentUser.nickname,
        content: content,
        parentId: parentId, // 대댓글이면 부모 ID 포함
      });

      // 작성 후 입력창 초기화
      if (parentId) {
        setReplyContent("");
        setActiveReplyId(null); // 대댓글 입력창 닫기
      } else {
        setCommentContent("");
      }
      fetchComments(); // 댓글 목록 새로고침 (즉시 반영을 위해)
    } catch (error) {
      console.error(error);
      openModal("댓글 등록 중 오류가 발생했습니다.", "error");
    }
  };

  // --- [댓글 삭제 핸들러] ---
  const handleDeleteComment = async (commentId: number) => {
    // [수정됨] confirm 대신 openModal 사용
    openModal("정말 삭제하시겠습니까?", "confirm", "댓글 삭제", async () => {
      try {
        await api.post(apiEndpoints.deleteComment, { id: commentId });
        fetchComments(); // 삭제 후 목록 새로고침
      } catch (error) {
        openModal("댓글 삭제 실패", "error");
      }
    });
  };

  // --- [댓글 렌더링 함수] ---
  const renderComments = (list: any[]) => {
    return list.map((comment) => {
      const isAuthor =
        currentUser && String(comment.userId) === String(currentUser.userId);
      const isReply = !!comment.parentId;

      return (
        // [수정 1] w-full -> w-fit min-w-full
        // 설명: 자식 요소(댓글 카드)가 오른쪽으로 밀려나면, 이 컨테이너도 같이 커지도록 w-fit을 줍니다.
        // min-w-full은 댓글이 짧아도 최소한 화면 너비는 차지하게 합니다.
        <div key={comment.id} className="w-fit min-w-full">
          {/* [수정 2] 너비 고정 로직 추가
              - 모바일: w-[calc(100vw-6rem)] -> 화면 너비에서 좌우 패딩을 뺀 만큼만 너비를 가짐 (늘어나지 않음)
              - 데스크탑(md): w-full -> 기존처럼 꽉 채움
          */}
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
              {/* ... (댓글 내용 - 기존 코드와 동일) ... */}
              <div className="flex justify-between items-start mb-3">
                {/* ... (프로필, 이름 등) ... */}
                <div className="flex items-center gap-3">
                  <div
                    className={`items-center justify-center font-bold text-sm shadow-md rounded-2xl hidden sm:flex ${
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
                            : "text-slate-900 text-[16px] block truncate max-w-[5em] sm:max-w-none"
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
                  {isAuthor && !comment.isDelete && (
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
            // [수정 3] 들여쓰기 부분 (margin-left)
            // 깊이가 깊어지면 자식 div(w-fit)가 점점 오른쪽으로 밀려나면서 전체 너비를 키움
            <div className="pl-6 md:pl-12 my-2">
              {renderComments(comment.children)}
            </div>
          )}
        </div>
      );
    });
  };

  // --- [화면 렌더링 분기] ---

  // (1) 로딩 중일 때: 화면 중앙 스피너
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Loader2 className={`animate-spin ${styles.textMain} w-10 h-10`} />
      </div>
    );

  // (2) [중요] 데이터가 없을 때:
  // 기존에는 텍스트만 리턴했지만, 에러 모달을 보여주기 위해 Modal 컴포넌트를 포함합니다.
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
        {/* 빈 화면 (모달 뒤 배경 역할) */}
        <div className="min-h-screen bg-[#F8FAFC]"></div>
      </>
    );
  }

  // (3) 정상 렌더링
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 화면 전체 어디서든 쓸 수 있게 모달 컴포넌트를 최상위에 둡니다. */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      {/* 상단바 (뒤로가기 버튼) */}
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
            <span className="ml-1 font-bold">목록으로</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {/* 1. 게시글 본문 섹션 */}
        <article className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="p-8 md:p-12 md:scroll-ml-2">
            {/* 상단 뱃지 및 삭제 버튼 */}
            <div className="flex items-center justify-between mb-6">
              <span
                className={`${styles.badge} text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider`}
              >
                {categoryLabel}
              </span>

              {/* 게시글 삭제 버튼: 삭제 API가 있고, 작성자 본인일 때만 표시 */}
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

            {/* 제목 */}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-[1.3] tracking-tight">
              {post.title}
            </h2>

            {/* 작성자 정보 및 조회수 */}
            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-100">
                  {post.userNickname ? post.userNickname[0] : "?"}
                </div>
                <div>
                  <div className="font-bold text-slate-800">
                    {post.userNickname}
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

            {/* 본문 내용 (HTML 태그 해석) */}
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
                {comments.length}
              </span>
            </h3>

            {/* 댓글 작성란 (고정) */}
            <div className="relative mb-6 sm:mb-12">
              {/* ... (textarea 코드는 그대로 유지) ... */}
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
                className={`absolute bottom-6 right-4 text-white font-bold p-3 sm:px-5 sm:py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm ${
                  currentUser
                    ? styles.button
                    : "bg-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={16} /> <span className="hidden">등록하기</span>
              </button>
            </div>

            {/* ▼▼▼ [수정된 부분] 댓글 목록 컨테이너 ▼▼▼ */}

            {/* overflow-x-auto: 대댓글이 깊어져서 화면을 넘어가면 스크롤 발생 */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {/* min-w-[500px] 제거하고 w-full로 변경 */}
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
            {/* ▲▲▲ [수정 끝] ▲▲▲ */}
          </div>
        </section>
      </div>
    </div>
  );
}
