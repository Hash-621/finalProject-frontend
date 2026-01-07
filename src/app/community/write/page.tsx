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
  Sparkles,
  Save,
  LayoutList,
  History,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import api from "@/api/axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Modal from "@/components/common/Modal";

import useAdminCheck from "@/hooks/useAdminCheck";

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

  // [핵심] 훅 하나로 유저 정보 & 관리자 여부 한방에 해결!
  const { isAdmin, userData, loading: isAuthChecking } = useAdminCheck();

  const initialCategory = searchParams.get("category") || "FREE";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 로딩이 끝나면 임시 저장된 글 확인
  useEffect(() => {
    if (!isAuthChecking && userData) {
      checkSavedPost();

      // 일반 유저가 공지사항 URL로 강제 접근 시 차단
      if (!isAdmin && category === "NOTICE") {
        setCategory("FREE");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthChecking, userData]);

  // 카테고리 변경 시 권한 재확인
  useEffect(() => {
    if (!isAuthChecking && !isAdmin && category === "NOTICE") {
      setCategory("FREE");
    }
  }, [category, isAdmin, isAuthChecking]);

  const checkSavedPost = () => {
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
              setCategory(cat);
            }
          }
        );
      }, 500);
    }
  };

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

  // 이미지 핸들러 등 생략 (동일)
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

    if (!userData?.userId && !userData?.id) {
      openModal("유저 정보를 찾을 수 없습니다. 다시 로그인해주세요.", "error");
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
        userId: userData.userId || userData.id, // 훅에서 받아온 ID
        title,
        content,
        category,
        isFixed, // 상단 고정 여부
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
        openModal("게시글이 등록되었습니다!", "success", "완료", () => {
          localStorage.removeItem("local-hub-temp-post");
          router.push(
            category === "NOTICE" ? "/community/notice" : "/community/free"
          );
        });
      }
    } catch (error: any) {
      console.error("발행 실패:", error);
      openModal("글 작성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
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
            className="flex items-center gap-2 text-slate-400 font-bold"
          >
            <ArrowLeft size={20} />
            <span>돌아가기</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={saveTemporary}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-slate-400"
            >
              <Save size={18} />
              <span>임시저장</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-green-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              <span>발행하기</span>
            </button>
          </div>
        </div>

        {/* 에디터 본문 */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="px-8 md:px-12 pt-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <LayoutList size={20} />
            </div>

            {/* 카테고리 선택 (관리자만 공지 선택 가능) */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!isAdmin}
              className={`bg-transparent outline-none font-bold text-sm ${
                !isAdmin
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-500 cursor-pointer"
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
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                {isFixed ? <CheckSquare size={14} /> : <Square size={14} />}
                <span>상단 고정</span>
              </button>
            )}

            <span className="ml-auto text-xs text-slate-300 font-medium">
              작성자: {userData?.nickname || "사용자"} {isAdmin && "(관리자)"}
            </span>
          </div>

          <div className="px-8 md:px-12 py-6">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold outline-none placeholder:text-slate-100 text-slate-900"
            />
          </div>

          <div className="custom-editor-wrapper">
            <ReactQuillEditor
              forwardedRef={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="내용을 입력하세요..."
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          background: #fcfdfc;
          padding: 1.5rem 3rem !important;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .ql-container.ql-snow {
          border: none !important;
        }
        .ql-editor {
          padding: 3rem !important;
          min-height: 500px;
          font-size: 1.15rem;
          color: #334155;
        }
        @media (max-width: 640px) {
          .ql-toolbar.ql-snow {
            padding: 1rem !important;
          }
          .ql-editor {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <WriteContent />
    </Suspense>
  );
}
