// 1. "use client" 선언: 이 파일이 브라우저에서 동작하는 컴포넌트임을 Next.js에게 알립니다.
// (hooks 사용이나 상호작용을 위해 필수입니다.)
"use client";

// 2. React 필수 훅(기능)들을 불러옵니다.
// useEffect: 화면이 켜질 때 실행할 코드, useState: 화면에 바뀔 값을 저장하는 변수, use: 비동기 데이터를 풀 때 사용
import React, { useEffect, useState, use } from "react";

// 3. 페이지 이동을 위한 Next.js 훅을 불러옵니다.
import { useRouter } from "next/navigation";

// 4. 백엔드 서버와 통신하기 위해 미리 설정해둔 axios 도구입니다.
import api from "@/api/axios";

// 5. 로그인 정보(토큰)가 담긴 쿠키를 다루기 위한 라이브러리입니다.
import Cookies from "js-cookie";

// 6. 사용자 정보 조회 등 유저 관련 API 함수들을 모아둔 파일입니다.
import { userService } from "@/api/services";

// 7. 화면에 예쁜 아이콘을 넣기 위해 아이콘들을 불러옵니다.
import {
  ChevronLeft, // 뒤로가기 화살표
  Clock, // 시계 아이콘 (작성일)
  Eye, // 눈 아이콘 (조회수)
  Trash2, // 쓰레기통 아이콘 (삭제)
  Send, // 종이비행기 아이콘 (전송)
  CornerDownRight, // ㄴ자 화살표 (대댓글용)
  MessageSquare, // 말풍선 아이콘
  Loader2, // 로딩 스피너
  MapPin, // 지도 핀 (여행지 표시)
  ThumbsUp, // 엄지척 (좋아요)
  Camera, // 카메라 아이콘
} from "lucide-react";

// 8. 알림창(팝업)을 띄우기 위해 만든 커스텀 모달 컴포넌트입니다.
import Modal from "@/components/common/Modal";

// 9. 백엔드 서버 주소를 설정합니다. 환경변수가 없으면 로컬주소(8080)를 씁니다.
// 이미지를 불러올 때 주소 앞에 붙여야 하기 때문입니다.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 10. 디자인 일관성을 위해 테마 색상들을 변수로 정해둡니다. (여기서는 에메랄드 색상)
const THEME_COLOR = "text-emerald-600";
const THEME_BG = "bg-emerald-50";
const THEME_BORDER = "border-emerald-200";

// 11. 여행 후기 상세 페이지의 메인 컴포넌트 함수 시작입니다.
export default function TourReviewDetail({
  params,
}: {
  // URL에 있는 id값(글 번호)이 들어옵니다. Next.js 15부터는 비동기(Promise)로 옵니다.
  params: Promise<{ id: string }>;
}) {
  // 12. 페이지 이동을 도와주는 router 도구를 준비합니다.
  const router = useRouter();

  // 13. params 안에 들어있는 id를 꺼냅니다. (예: /review/100 -> id는 100)
  const { id } = use(params);

  // ================= 상태 관리 (화면에 보여줄 데이터 저장소) =================

  // 14. 게시글 본문 데이터를 저장할 공간입니다. 초기값은 없습니다(null).
  const [post, setPost] = useState<any>(null);

  // 15. 댓글 목록을 저장할 공간입니다. 초기값은 빈 배열([])입니다.
  const [comments, setComments] = useState<any[]>([]);

  // 16. 데이터를 불러오는 중인지 표시하기 위한 상태입니다. 처음엔 로딩중(true)입니다.
  const [loading, setLoading] = useState(true);

  // 17. 현재 로그인한 내 정보를 저장할 공간입니다.
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 18. 내가 이 글에 좋아요를 눌렀는지 여부입니다.
  const [isLiked, setIsLiked] = useState(false);

  // 19. 이 글의 총 좋아요 개수입니다.
  const [likeCount, setLikeCount] = useState(0);

  // 20. 댓글 입력창에 쓴 글자를 저장하는 변수입니다.
  const [commentContent, setCommentContent] = useState("");

  // 21. 현재 '답글(대댓글)' 버튼을 누른 댓글의 ID를 저장합니다. 없으면 null.
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  // 22. 대댓글 입력창에 쓴 글자를 저장하는 변수입니다.
  const [replyContent, setReplyContent] = useState("");

  // --- [모달(알림창) 관련 상태] ---
  // 23. 모달의 열림 여부, 제목, 내용, 타입, 확인버튼 동작 등을 관리하는 객체입니다.
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, // 닫혀있는게 기본
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  // 24. 모달을 쉽게 열기 위한 헬퍼 함수입니다. 복잡한 설정을 한 번에 해줍니다.
  const openModal = (
    content: string, // 내용
    type: "success" | "error" | "warning" | "confirm" = "success", // 아이콘 타입
    title?: string, // 제목 (없으면 자동 설정)
    onConfirm?: () => void // 확인 버튼 눌렀을 때 할 일
  ) => {
    setModalConfig({
      isOpen: true, // 모달 열기
      content,
      type,
      // 제목이 안 넘어오면 타입에 따라 적절한 기본 제목을 붙여줍니다.
      title:
        title ||
        (type === "error" ? "오류" : type === "confirm" ? "확인" : "알림"),
      onConfirm,
    });
  };

  // 25. 모달을 닫는 함수입니다. isOpen만 false로 바꿉니다.
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // ================= 데이터 로딩 (페이지 접속 시 실행) =================

  // 26. useEffect: 컴포넌트가 처음 화면에 나타날 때(마운트) 실행되는 로직입니다.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 27. [1단계] 사용자 정보 로드: 쿠키에 토큰이 있는지 확인합니다.
        const token = Cookies.get("token");
        if (token) {
          try {
            // 토큰이 있으면 백엔드에 내 정보를 요청합니다.
            const userRes = await userService.getUserInfo();
            if (userRes?.data) {
              const data = userRes.data;
              // 받아온 내 정보를 상태에 저장합니다. (ID와 닉네임)
              setCurrentUser({
                userId: data.userId || data.id || data.loginId,
                nickname: data.userNickname || data.nickname,
              });
            }
          } catch (e) {
            // 토큰이 있지만 유효하지 않은 경우 콘솔에 에러를 찍습니다.
            console.error("Auth check failed", e);
          }
        }

        // 28. [2단계] 게시글 로드: 백엔드 API를 통해 글 내용을 가져옵니다.
        const postRes = await api.get(`/community/post/${id}`);
        setPost(postRes.data); // 가져온 글 내용을 상태에 저장
        setLikeCount(postRes.data.likeCount || 0); // 좋아요 수도 저장

        // 29. [3단계] 댓글 로드: 아래에 정의한 댓글 불러오기 함수를 실행합니다.
        await fetchComments();
      } catch (err) {
        // 30. 에러 발생 시 (글이 없거나 서버 오류 등)
        console.error("상세 로딩 실패:", err);
        // 에러 모달을 띄우고, 확인을 누르면 목록 페이지로 보냅니다.
        openModal("게시글을 불러올 수 없습니다.", "error", "오류", () =>
          router.push("/tour/review")
        );
      } finally {
        // 31. 성공하든 실패하든 로딩 상태를 false로 바꿔서 로딩바를 없앱니다.
        setLoading(false);
      }
    };

    fetchData(); // 위에서 만든 fetchData 함수를 실행합니다.
    // 의존성 배열: id나 router가 바뀌면 이 useEffect가 다시 실행됩니다.
  }, [id, router]);

  // 32. 댓글을 불러와서 계층형(대댓글 구조)으로 정리하는 함수입니다.
  const fetchComments = async () => {
    try {
      // 백엔드에서 댓글 목록을 가져옵니다.
      const res = await api.get(`/community/comments/${id}`);
      const rawComments = res.data; // 아직은 부모-자식이 섞인 일자 목록입니다.

      const commentMap = new Map(); // 데이터 정리를 위해 Map을 만듭니다.
      const rootComments: any[] = []; // 최상위(부모 없는) 댓글만 모을 배열입니다.

      // 1. 모든 댓글을 Map에 넣으면서, 자식들을 담을 children 배열을 미리 만들어줍니다.
      rawComments.forEach((c: any) =>
        commentMap.set(c.id, { ...c, children: [] })
      );

      // 2. 댓글들을 하나씩 꺼내서 부모-자식 관계를 연결합니다.
      rawComments.forEach((c: any) => {
        if (c.parentId) {
          // 부모 ID가 있다? -> 대댓글입니다.
          const parent = commentMap.get(c.parentId); // 부모 댓글을 찾습니다.
          if (parent) parent.children.push(commentMap.get(c.id)); // 부모의 children 목록에 나를 넣습니다.
        } else {
          // 부모 ID가 없다? -> 최상위 댓글입니다.
          rootComments.push(commentMap.get(c.id)); // root 목록에 넣습니다.
        }
      });
      // 3. 정리가 끝난 계층형 댓글 목록을 상태에 저장합니다.
      setComments(rootComments);
    } catch (err) {
      console.error("댓글 로드 실패:", err);
    }
  };

  // ================= 기능 핸들러 (버튼 클릭 시 동작) =================

  // 33. 이미지 경로를 완전한 URL로 만들어주는 함수입니다.
  const getImageUrl = (path: string) => {
    if (!path) return null;
    const fileName = path.split(/[/\\]/).pop(); // 경로에서 파일명만 쏙 빼냅니다.
    return `${BACKEND_URL}/images/${fileName}`; // 백엔드 주소와 합칩니다.
  };

  // 34. 좋아요 버튼을 눌렀을 때 실행되는 함수입니다.
  const handleLikeClick = async () => {
    // 로그인을 안 했으면 경고 모달을 띄웁니다.
    if (!currentUser) {
      openModal("로그인이 필요한 서비스입니다.", "warning");
      return;
    }

    try {
      // 백엔드에 좋아요 요청을 보냅니다.
      const res = await api.post(`/community/post/${id}/like`);
      setIsLiked(!isLiked); // 하트 색깔을 반대로 바꿉니다.
      setLikeCount(res.data.likeCount); // 백엔드에서 준 최신 좋아요 수로 업데이트합니다.
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      openModal("좋아요 처리에 실패했습니다.", "error");
    }
  };

  // 35. 게시글 삭제 버튼을 눌렀을 때 실행되는 함수입니다.
  const handleDeletePost = () => {
    openModal(
      "정말로 이 글을 삭제하시겠습니까?", // 질문 내용
      "confirm", // 확인/취소 버튼이 있는 타입
      "삭제 확인", // 제목
      async () => {
        // '확인' 버튼을 눌렀을 때 실행될 비동기 함수
        try {
          await api.delete(`/community/post/${id}`); // 백엔드에 삭제 요청
          // 성공하면 알림을 띄우고, 확인 누르면 목록으로 이동
          openModal("게시글이 삭제되었습니다.", "success", "삭제 완료", () =>
            router.push("/tour/review")
          );
        } catch (error) {
          console.error(error);
          openModal("삭제 실패했습니다.", "error");
        }
      }
    );
  };

  // 36. 댓글 또는 대댓글을 등록하는 함수입니다.
  // targetId가 있으면 대댓글, 없으면 일반 댓글로 처리합니다.
  const handleCommentSubmit = async (targetId: number | null = null) => {
    // 최종 부모 ID 결정 (파라미터로 받았거나, 현재 열려있는 답글창 ID)
    const finalParentId = targetId || activeReplyId;

    // 내용 결정 (대댓글이면 replyContent, 아니면 commentContent)
    const content = finalParentId ? replyContent : commentContent;

    // 내용이 비었으면 경고
    if (!content.trim()) return openModal("내용을 입력해주세요.", "warning");
    // 로그인 안 했으면 경고
    if (!currentUser) return openModal("로그인이 필요합니다.", "warning");

    try {
      // 백엔드에 댓글 저장 요청을 보냅니다.
      await api.post("/community/comments", {
        postId: id, // 글 번호
        userId: currentUser.userId, // 내 아이디
        userNickname: currentUser.nickname, // 내 닉네임
        content: content, // 내용
        parentId: finalParentId, // 부모 댓글 번호 (없으면 null)
      });

      // 입력이 성공하면 입력창을 비웁니다.
      if (finalParentId) {
        setReplyContent("");
        setActiveReplyId(null); // 답글 입력창 닫기
      } else {
        setCommentContent("");
      }
      // 댓글 목록을 새로 불러옵니다.
      fetchComments();
    } catch (error) {
      console.error(error);
      openModal("댓글 등록 중 오류가 발생했습니다.", "error");
    }
  };

  // 37. 내 댓글을 삭제하는 함수입니다.
  const handleDeleteComment = (commentId: number) => {
    openModal("정말 삭제하시겠습니까?", "confirm", "댓글 삭제", async () => {
      try {
        // 백엔드에 삭제 요청
        await api.post("/community/comments/delete", { id: commentId });
        fetchComments(); // 목록 새로고침
      } catch (error) {
        openModal("댓글 삭제 실패", "error");
      }
    });
  };

  // ================= 렌더링 함수 (화면 그리기) =================

  // 38. 댓글 목록을 화면에 그려주는 함수입니다. (재귀 호출을 사용합니다)
  const renderComments = (list: any[]) => {
    return list.map((comment) => {
      // 이 댓글이 내가 쓴 글인지 확인합니다.
      const isAuthor =
        currentUser && String(comment.userId) === String(currentUser.userId);
      // 부모 ID가 있으면 대댓글입니다.
      const isReply = !!comment.parentId;

      return (
        <div key={comment.id} className="w-full">
          {/* 대댓글이면 위쪽 여백(margin-top)을 조금 줄입니다 */}
          <div className={`flex ${isReply ? "mt-3" : "mt-6"}`}>
            {/* 대댓글일 경우에만 왼쪽에 'ㄴ' 화살표 아이콘을 보여줍니다 */}
            {isReply && (
              <div className="flex flex-col items-end mr-3 pt-4 min-w-5">
                <CornerDownRight
                  className="text-slate-300 w-5 h-5"
                  strokeWidth={2}
                />
              </div>
            )}

            {/* 댓글 카드 본문 영역 */}
            <div
              className={`flex-1 transition-all relative overflow-hidden group
                  ${
                    isReply
                      ? `bg-slate-50 rounded-2xl p-5 border-slate-200` // 대댓글은 회색 배경
                      : "bg-white border border-slate-100 rounded-4xl p-8 " // 일반 댓글은 흰색 배경
                  }`}
            >
              <div className="flex justify-between items-start mb-3">
                {/* 작성자 정보 영역 */}
                <div className="flex items-center gap-3">
                  {/* 프로필 이미지 (닉네임 첫 글자 표시) */}
                  <div
                    className={`flex items-center justify-center font-bold text-sm shadow-md rounded-2xl ${
                      isReply
                        ? "w-8 h-8 bg-white text-slate-600 border border-slate-200"
                        : "w-11 h-11 text-white bg-linear-to-br from-emerald-400 to-teal-500 shadow-emerald-100"
                    }`}
                  >
                    {(comment.userNickname || "?")[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      {/* 닉네임 */}
                      <span
                        className={`font-bold ${
                          isReply
                            ? "text-slate-700 text-sm"
                            : "text-slate-900 text-[16px]"
                        }`}
                      >
                        {comment.userNickname}
                      </span>
                      {/* 내가 쓴 글이면 '나'라는 뱃지를 붙여줍니다 */}
                      {isAuthor && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">
                          나
                        </span>
                      )}
                    </div>
                    {/* 작성 날짜 표시 */}
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {comment.createdAt?.split("T")[0] || ""}
                    </div>
                  </div>
                </div>

                {/* 답글/삭제 버튼 영역 */}
                <div className="flex items-center gap-1 opacity-90">
                  {/* 삭제된 댓글이 아니면 '답글' 버튼 표시 */}
                  {!comment.isDelete && (
                    <button
                      onClick={() =>
                        // 버튼 누르면 해당 댓글 ID를 activeReplyId로 설정 (토글 방식)
                        setActiveReplyId(
                          activeReplyId === comment.id ? null : comment.id
                        )
                      }
                      className="text-xs font-bold text-slate-400 hover:text-emerald-600 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      답글
                    </button>
                  )}
                  {/* 내가 쓴 글이고 삭제 안 됐으면 '삭제(쓰레기통)' 버튼 표시 */}
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

              {/* 실제 댓글 내용 텍스트 */}
              <p
                className={`whitespace-pre-wrap leading-relaxed ${
                  comment.isDelete
                    ? "text-slate-400 italic text-sm" // 삭제됐으면 회색 기울임꼴
                    : `font-medium ${
                        isReply
                          ? "text-slate-600 text-[14px] pl-1"
                          : "text-slate-800 text-[16px] pl-1"
                      }`
                }`}
              >
                {/* 삭제 여부에 따라 다른 텍스트 표시 */}
                {comment.isDelete ? "삭제된 댓글입니다." : comment.content}
              </p>

              {/* 답글 입력창 (activeReplyId가 현재 댓글 ID랑 같을 때만 보임) */}
              {activeReplyId === comment.id && (
                <div className="mt-5 pt-4 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-600 ml-1">
                    <CornerDownRight size={12} />
                    <span>@{comment.userNickname}님에게 작성 중...</span>
                  </div>
                  {/* 답글 입력 Textarea */}
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm h-24 outline-none resize-none shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="내용을 입력하세요..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    {/* 취소 버튼 */}
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    {/* 등록 버튼 */}
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

          {/* ★ 재귀 렌더링의 핵심: 대댓글이 있으면 자기 자신(renderComments)을 다시 호출해서 그립니다. */}
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

  // 39. 데이터가 로딩 중이거나 게시글이 없으면 로딩바를 보여줍니다.
  if (loading || !post)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );

  // 40. 데이터가 준비되면 실제 내용을 보여줍니다.
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* 화면 전체 어디서든 쓸 수 있게 모달 컴포넌트를 최상위에 둡니다. */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      {/* 배경에 은은한 빛 효과를 주는 장식용 div입니다. (클릭 안됨) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-[120px]" />
      </div>

      {/* 상단 네비게이션 바 (뒤로가기 버튼 포함) */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-8">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/community/review")}
            className="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-bold">여행기 목록</span>
          </button>
        </div>
      </nav>

      {/* 본문 콘텐츠가 들어가는 영역 */}
      <article className="max-w-4xl mx-auto px-6 relative z-10">
        {/* 게시글 내용을 담은 흰색 카드 */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden mb-12">
          {/* 게시글 헤더 영역 */}
          <div className="p-8 md:p-12 pb-6">
            <div className="flex justify-between items-start mb-6">
              {/* 여행 로그 배지 */}
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-extrabold uppercase tracking-wider">
                <MapPin size={12} /> Travel Log
              </span>

              {/* 내가 쓴 글일 때만 삭제 버튼 표시 */}
              {currentUser &&
                String(post.userId) === String(currentUser.userId) && (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all text-xs font-bold"
                  >
                    <Trash2 size={14} /> 삭제
                  </button>
                )}
            </div>

            {/* 글 제목 */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-8 break-keep">
              {post.title}
            </h1>

            {/* 작성자 정보 및 날짜 */}
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

              {/* 날짜 및 조회수 */}
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

          {/* 메인 이미지 영역 (이미지가 있을 때만 보임) */}
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

          {/* 본문 내용 영역 (HTML 태그를 해석해서 보여줍니다) */}
          <div className="px-8 md:px-12 pb-12">
            <div
              className="prose prose-lg prose-slate max-w-none text-slate-600 leading-8
               [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-slate-800
               [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-emerald-700 [&>h2]:mt-10
               [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-300 [&>blockquote]:bg-emerald-50/50 [&>blockquote]:py-2 [&>blockquote]:px-4 [&>blockquote]:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* 하단 좋아요 버튼 영역 */}
          <div className="bg-slate-50 py-10 flex flex-col items-center justify-center gap-4 border-t border-slate-100">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all group scale-100 active:scale-95 shadow-lg ${
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
              <span className="text-sm">여행에 도움이 됐어요</span>
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

        {/* 댓글 섹션 시작 */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-20">
          <div className="p-8 md:p-12">
            {/* 댓글 개수 헤더 */}
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              댓글{" "}
              <span className="text-lg font-bold bg-emerald-50 text-emerald-600 px-3 py-0.5 rounded-full border border-emerald-100">
                {comments.length}
              </span>
            </h3>

            {/* 댓글 입력창 (최상단) */}
            <div className="relative mb-12">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={
                  currentUser
                    ? "여행에 대한 궁금한 점이나 따뜻한 댓글을 남겨주세요 :)"
                    : "로그인이 필요합니다."
                }
                disabled={!currentUser} // 로그인 안 했으면 입력 불가
                className="w-full p-6 bg-slate-50 border-none rounded-4xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white h-36 resize-none transition-all text-slate-700 placeholder:text-slate-400 font-medium shadow-inner"
              />
              <button
                onClick={() => handleCommentSubmit(null)} // null이면 일반 댓글 등록
                disabled={!currentUser}
                className={`absolute bottom-6 right-4 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm hover:-translate-y-1 ${
                  currentUser
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                    : "bg-slate-300 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={16} /> 등록
              </button>
            </div>

            {/* 댓글 목록 표시 영역 */}
            <div className="space-y-1">
              {comments.length === 0 ? (
                // 댓글이 하나도 없을 때 보여줄 안내 메시지
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-4xl">
                  <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">
                    아직 작성된 댓글이 없습니다.
                    <br />첫 번째 방문 흔적을 남겨보세요!
                  </p>
                </div>
              ) : (
                // 댓글이 있으면 renderComments 함수로 그려줍니다.
                renderComments(comments)
              )}
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
