"use client";

import React, {
  useState,
  Suspense,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Save,
  LayoutList,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import api from "@/api/axios";
import Cookies from "js-cookie"; // [추가] 쿠키 사용을 위해 임포트
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Modal from "@/components/common/Modal";

// 1. Dynamic Import 설정
const ReactQuillEditor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function Comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100" />
    ),
  }
);

function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quillRef = useRef<ReactQuill | null>(null);

  const initialCategory = searchParams.get("category") || "FREE";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // [변경] useAdminCheck 훅 제거 -> 수동 상태 관리로 원복
  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 상태 추가

  // 관리자용 상단 고정 상태
  const [isFixed, setIsFixed] = useState(false);

  // --- 모달 설정 ---
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

  // [중요] 임시 저장된 글 확인 (useEffect에서 호출하기 위해 위로 올림)
  const checkSavedPost = useCallback(() => {
    const savedPost = localStorage.getItem("local-hub-temp-post");
    if (savedPost) {
      const { title: sTitle, savedAt } = JSON.parse(savedPost);
      setTimeout(() => {
        openModal(
          `[${savedAt}]에 작성하던 글을 불러올까요?`,
          "confirm",
          "임시 저장 불러오기",
          () => {
            const saved = localStorage.getItem("local-hub-temp-post");
            if (saved) {
              const { title: t, content: c, category: cat } = JSON.parse(saved);
              setTitle(t);
              setContent(c);
              // 불러온 카테고리가 NOTICE인데 관리자가 아니면 FREE로 강제 변경
              if (cat === "NOTICE" && !isAdmin) {
                setCategory("FREE");
              } else {
                setCategory(cat);
              }
            }
          }
        );
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // [변경] 요청하신 useEffect 로직 적용
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("token");

      // 1. 토큰이 없을 때
      if (!token) {
        openModal(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동합니다.",
          "warning",
          "접근 제한",
          () => router.replace("/sign-in")
        );
        return;
      }

      // 2. 토큰이 있을 때 유저 정보 확인
      try {
        const res = await api.get("/mypage/info");
        const fetchedId = res.data.userId || res.data.id || res.data.loginId;
        const fetchedNickname = res.data.userNickname || res.data.nickname;

        // [추가] 관리자 여부 확인 (API 응답에 role이 있다고 가정)
        const fetchedRole = res.data.role || "USER";
        const isUserAdmin = fetchedRole === "ADMIN";

        if (fetchedId) {
          setUserData({
            userId: fetchedId,
            nickname: fetchedNickname || "사용자",
          });
          setIsAdmin(isUserAdmin); // 관리자 상태 업데이트

          setIsAuthChecking(false);

          // 상태 업데이트가 반영된 후 실행되도록 약간의 지연을 주거나 의존성 배열 활용
          // 여기서는 직접 호출하되, checkSavedPost 내부 로직이 isAdmin을 참조함
          checkSavedPost();
        }
      } catch (err) {
        console.error("유저 정보 로드 실패:", err);
        openModal("로그인 세션이 만료되었습니다.", "error", "오류", () =>
          router.replace("/sign-in")
        );
      }
    };

    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카테고리 변경 시 권한 재확인 (방어 로직)
  useEffect(() => {
    if (!isAuthChecking && !isAdmin && category === "NOTICE") {
      setCategory("FREE");
    }
  }, [category, isAdmin, isAuthChecking]);

  // 임시 저장 기능
  const saveTemporary = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      openModal("저장할 내용이 없습니다.", "warning");
      return;
    }
    const tempData = {
      title,
      content,
      category,
      savedAt: new Date().toLocaleString(),
    };
    localStorage.setItem("local-hub-temp-post", JSON.stringify(tempData));
    openModal("임시 저장되었습니다.", "success");
  }, [title, content, category]);

  // 이미지 핸들러
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "");
    input.click();

    input.onchange = async () => {
      const fileArray = input.files;
      if (!fileArray?.length) return;

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection()?.index;
          if (range !== undefined && range !== null) {
            quill?.insertEmbed(range, "image", reader.result);
          }
        };
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userData?.userId) {
      openModal("유저 정보를 확인 중입니다.", "warning");
      return;
    }

    if (!title.trim() || !content.trim()) {
      openModal("제목과 내용을 모두 입력해주세요.", "warning");
      return;
    }

    // 최종 권한 방어
    if (!isAdmin && category === "NOTICE") {
      openModal("공지사항 작성 권한이 없습니다.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        category === "NOTICE" ? "/community/notice" : "/community/free";

      const payload = {
        userId: userData.userId,
        title: title,
        content: content,
        category: category,
        isFixed: isFixed, // 상단 고정 여부
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };

      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("dto", jsonBlob);

      const response = await api.post(endpoint, formData);

      if (response.status === 200 || response.status === 201) {
        openModal(
          "게시글이 성공적으로 등록되었습니다!",
          "success",
          "등록 완료",
          () => {
            localStorage.removeItem("local-hub-temp-post");
            router.push(
              category === "NOTICE" ? "/community/notice" : "/community/free"
            );
          }
        );
      }
    } catch (error: any) {
      console.error("❌ 발행 실패:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "서버 오류";
      openModal(`글 작성 실패: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // [인증 체크 중 UI]
  if (isAuthChecking) {
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
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc] p-4 md:py-12">
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <div className="max-w-5xl mx-auto">
        {/* 상단 버튼 영역 */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>돌아가기</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={saveTemporary}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <Save size={18} />
              <span className="hidden sm:inline">임시저장</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-green-600 transition-all flex items-center gap-2 group active:scale-95 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>발행 중...</span>
                </>
              ) : (
                <>
                  <span>발행하기</span>
                  <Send
                    size={18}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 에디터 영역 */}
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">
          <div className="px-8 md:px-12 pt-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <LayoutList size={20} />
            </div>

            {/* 카테고리 선택 (관리자만 NOTICE 선택 가능) */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!isAdmin} // 일반 유저는 변경 불가 (FREE 고정)
              className={`bg-transparent border-none outline-none font-bold text-sm transition-colors ${
                !isAdmin
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-500 hover:text-green-600 cursor-pointer"
              }`}
            >
              <option value="FREE">자유게시판</option>
              {isAdmin && <option value="NOTICE">공지사항</option>}
            </select>

            {/* 상단 고정 체크박스 (관리자 & 공지사항일 때만) */}
            {isAdmin && category === "NOTICE" && (
              <button
                onClick={() => setIsFixed(!isFixed)}
                className={`flex items-center gap-1.5 ml-4 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  isFixed
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {isFixed ? <CheckSquare size={14} /> : <Square size={14} />}
                <span>상단 고정</span>
              </button>
            )}

            {userData && (
              <span className="ml-auto text-xs text-slate-300 font-medium">
                작성자: {userData.nickname} {isAdmin && "(관리자)"}
              </span>
            )}
          </div>

          <div className="px-8 md:px-12 py-6">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full text-4xl md:text-5xl font-bold outline-none placeholder:text-slate-100 text-slate-900 disabled:opacity-50"
            />
          </div>

          <div className="custom-editor-wrapper">
            <ReactQuillEditor
              forwardedRef={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="당신의 이야기를 이웃들과 나누어 보세요..."
              readOnly={isSubmitting}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          background: #fcfdfc;
          padding: 1.5rem 3rem !important;
          border-top: 1px solid #f8fafc !important;
          border-bottom: 1px solid #f8fafc !important;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
        }
        .ql-editor {
          padding: 3rem !important;
          min-height: 500px;
          font-size: 1.15rem;
          line-height: 1.8;
          color: #334155;
        }
        .ql-editor.ql-blank::before {
          left: 3rem !important;
          color: #e2e8f0 !important;
          font-style: normal !important;
          font-weight: 800 !important;
          font-size: 1.5rem;
        }
        @media (max-width: 640px) {
          .ql-toolbar.ql-snow {
            padding: 1rem !important;
          }
          .ql-editor {
            padding: 1.5rem !important;
          }
          .ql-editor.ql-blank::before {
            left: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mr-2" />
          에디터 준비 중...
        </div>
      }
    >
      <WriteContent />
    </Suspense>
  );
}
