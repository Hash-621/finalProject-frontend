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
  ChevronLeft, // 뒤로가기 화살표
  Send, // 전송(종이비행기) 아이콘
  Loader2, // 로딩 스피너
  Trash2, // 삭제(휴지통) 아이콘
  CornerDownRight, // 대댓글 화살표 (ㄴ 모양)
  MessageSquare, // 댓글 말풍선 아이콘
} from "lucide-react";
import Cookies from "js-cookie"; // 쿠키 관리 (토큰 확인용)
import { userService } from "@/api/services"; // 유저 정보 조회 서비스
import useAdminCheck from "@/hooks/useAdminCheck"; // 관리자 권한 확인 훅

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

  // --- [1. 초기 데이터 로드 (useEffect)] ---
  // 컴포넌트가 처음 나타나거나 postId가 바뀌면 실행됩니다.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // (1) 유저 정보 확인 로직
        const token = Cookies.get("token"); // 쿠키에서 토큰 확인
        if (token) {
          try {
            // 토큰이 있으면 서버에 유저 정보 요청
            const userRes = await userService.getUserInfo().catch(() => null);
            if (userRes?.data) {
              const data = userRes.data;
              // 서버 응답에서 ID와 닉네임을 추출하여 상태에 저장
              setCurrentUser({
                userId: data.userId || data.id || data.loginId,
                nickname: data.userNickname || data.nickname,
              });
            }
          } catch (e) {
            console.error("Auth check failed", e);
          }
        }

        // (2) 게시글 상세 데이터 요청
        const postRes = await api.get(apiEndpoints.fetchPost);
        setPost(postRes.data); // 받아온 데이터 저장

        // (3) 댓글 목록 요청 (함수로 분리됨)
        await fetchComments();
      } catch (err) {
        console.error(err);
        alert("게시글을 불러올 수 없습니다.");
        router.push(listPath); // 에러 발생 시 목록 페이지로 강제 이동
      } finally {
        setLoading(false); // 로딩 종료 (성공하든 실패하든)
      }
    };

    if (postId) fetchData(); // postId가 있을 때만 실행
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
    if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return; // 확인 창

    try {
      await api.delete(apiEndpoints.deletePost); // 삭제 요청 전송
      alert("게시글이 삭제되었습니다.");
      router.push(listPath); // 목록으로 이동
    } catch (error) {
      console.error(error);
      alert("삭제 실패했습니다.");
    }
  };

  // --- [댓글/대댓글 작성 핸들러] ---
  const handleCommentSubmit = async (parentId: number | null = null) => {
    // parentId 유무에 따라 대댓글 내용인지, 일반 댓글 내용인지 선택
    const content = parentId ? replyContent : commentContent;

    // 유효성 검사
    if (!content.trim()) return alert("내용을 입력해주세요.");
    if (!currentUser) return alert("로그인이 필요합니다.");

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
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  // --- [댓글 삭제 핸들러] ---
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.post(apiEndpoints.deleteComment, { id: commentId });
      fetchComments(); // 삭제 후 목록 새로고침
    } catch (error) {
      alert("댓글 삭제 실패");
    }
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

  // (2) 데이터가 없을 때: 에러 메시지
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  // (3) 정상 렌더링
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 상단바 (뒤로가기 버튼) */}
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
            <div className="relative mb-12">
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
                className={`absolute bottom-6 right-4 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm ${
                  currentUser
                    ? styles.button
                    : "bg-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={16} /> 등록하기
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

// 1. 페이지 진입 및 로딩 (Loading Phase)

// 사용자가 URL을 클릭합니다.

// 컴포넌트가 마운트되면서 loading = true 상태로 시작해 로딩 스피너를 보여줍니다.

// 동시에 useEffect가 발동하여 3가지 데이터를 병렬로 요청합니다. (시간 절약을 위해)

// 유저 정보 확인: "지금 접속한 사람이 누구야?" (currentUser 저장)

// 글 상세 내용: "제목이랑 본문 줘." (post 저장)

// 댓글 목록: "여기 달린 댓글 싹 다 가져와." (fetchComments 실행)

// 2. 댓글 데이터 가공 (Data Processing)

// 댓글 API는 보통 댓글들을 1차원 리스트([{id:1}, {id:2, parentId:1}, ...])로 줍니다.

// fetchComments 함수가 이 리스트를 받아서 "2번은 1번의 자식이구나" 하고 판단하여 **트리 구조(가계도)**로 재조립합니다.

// 이렇게 정리된 데이터가 comments 상태에 저장됩니다.

// 3. 화면 렌더링 (Painting)

// 모든 데이터 준비가 끝나면 loading = false가 됩니다.

// 스피너가 사라지고, 게시글 본문과 댓글 목록이 예쁘게 렌더링됩니다.

// 이때 post.content에 포함된 HTML 태그들(굵은 글씨, 이미지 등)은 dangerouslySetInnerHTML을 통해 실제 스타일이 적용되어 보입니다.

// 4. 댓글 작성 및 인터랙션 (User Interaction)

// 사용자가 "비 온대요."라고 댓글을 쓰고 **[등록하기]**를 누릅니다.

// handleCommentSubmit이 서버로 전송하고, 성공하면 댓글 목록을 **새로고침(fetchComments)**해서 방금 쓴 댓글이 바로 보이게 합니다.

// 사용자가 다른 사람 댓글에 [답글] 버튼을 누릅니다.

// activeReplyId가 해당 댓글 ID로 바뀌면서, 그 댓글 바로 밑에 숨겨져 있던 대댓글 입력창이 스르륵 나타납니다.

// 5. 권한 확인 및 기능 제한 (Permission Check)

// 화면을 그릴 때, 게시글 작성자 ID와 내 ID(currentUser.userId)를 비교합니다.

// 내가 쓴 글이면: 우측 상단에 빨간색 [삭제] 버튼을 보여줍니다.

// 내가 쓴 댓글이면: 댓글 옆에 조그만 [휴지통] 아이콘을 보여줍니다.

// 남의 글이나 댓글에는 이 버튼들이 아예 생성되지 않아 클릭할 수 없습니다.
