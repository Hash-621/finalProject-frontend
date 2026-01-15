// "use client": 이 파일이 서버가 아닌 브라우저(클라이언트)에서 실행되는 컴포넌트임을 선언합니다.
"use client";

// --- [라이브러리 및 훅 임포트] ---
import React, {
  useState,
  Suspense,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";

// Next.js 관련 기능 임포트
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

// 아이콘 라이브러리 (lucide-react) 임포트
import {
  ArrowLeft,
  Send,
  Save,
  LayoutList,
  Loader2,
  Paperclip, // 📎 파일 첨부 아이콘 추가
  X, // ❌ 파일 삭제 아이콘 추가
  FileText, // 📄 파일 아이콘 추가
} from "lucide-react";

// 서버 통신을 위한 axios 설정 파일
import api from "@/api/axios";
// 쿠키 조작을 위한 라이브러리
import Cookies from "js-cookie";
// 텍스트 에디터 라이브러리 (React Quill)
import ReactQuill from "react-quill-new";
// 텍스트 에디터의 스타일 시트
import "react-quill-new/dist/quill.snow.css";
// 커스텀 모달 컴포넌트
import Modal from "@/components/common/Modal";

const serverURL = process.env.NEXT_PUBLIC_API_URL;

// --- [1. 텍스트 에디터 동적 임포트 설정] ---
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

// --- [메인 컴포넌트: 실제 글쓰기 로직] ---
function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quillRef = useRef<ReactQuill | null>(null);

  const initialCategory = searchParams.get("category") || "FREE";

  // --- [상태 관리 (State)] ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ [추가] 첨부 파일 목록 상태
  const [files, setFiles] = useState<File[]>([]);

  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- [모달(알림창) 설정] ---
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

  // --- [임시 저장된 글 확인 로직] ---
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

  // --- [초기 진입 시 유저 정보 로드] ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("token");

      if (!token) {
        openModal(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동합니다.",
          "warning",
          "접근 제한",
          () => router.replace("/sign-in")
        );
        return;
      }

      try {
        const res = await api.get("/mypage/info");
        const fetchedId = res.data.userId || res.data.id || res.data.loginId;
        const fetchedNickname = res.data.userNickname || res.data.nickname;

        const response = await fetch(`/api/v1/admin/isAdmin`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ loginId: res.data.loginId }),
        });
        const isUserAdmin = await response.json();

        if (fetchedId) {
          setUserData({
            userId: fetchedId,
            nickname: fetchedNickname || "사용자",
          });
          setIsAdmin(isUserAdmin);
          setIsAuthChecking(false);
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

  // --- [카테고리 보안 로직] ---
  useEffect(() => {
    if (!isAuthChecking && !isAdmin && category === "NOTICE") {
      setCategory("FREE");
    }
  }, [category, isAdmin, isAuthChecking]);

  // --- [임시 저장 버튼 클릭 핸들러] ---
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

  // --- [이미지 업로드 핸들러 (에디터 본문용)] ---
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

  // --- [✨ 추가: 첨부 파일 핸들러] ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // 기존 파일 목록에 새 파일 추가
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- [에디터 설정 (Modules)] ---
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

  // --- [최종 발행 버튼 클릭 핸들러] ---
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
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };

      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("dto", jsonBlob);

      // ✨ [추가] 첨부 파일들을 FormData에 추가
      // 백엔드에서 @RequestPart("files") List<MultipartFile> files 로 받습니다.
      files.forEach((file) => {
        formData.append("files", file);
      });

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
              className="flex items-center gap-2 p-3 sm:px-6 sm:py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <Save size={18} />
              <span className="hidden sm:inline">임시저장</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="p-3 sm:px-8 sm:py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-green-600 transition-all flex items-center gap-2 group active:scale-95 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>발행 중...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:block">발행하기</span>
                  <Send
                    size={18}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 에디터 메인 영역 */}
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">
          <div className="px-8 md:px-12 pt-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <LayoutList size={20} />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!isAdmin}
              className={`bg-transparent border-none outline-none font-bold text-sm transition-colors ${
                !isAdmin
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-500 hover:text-green-600 cursor-pointer"
              }`}
            >
              <option value="FREE">자유게시판</option>
              {isAdmin && <option value="NOTICE">공지사항</option>}
            </select>

            {userData && (
              <span className="ml-auto text-xs text-slate-300 font-medium">
                작성자: {userData.nickname} {isAdmin && "(관리자)"}
              </span>
            )}
          </div>

          {/* 제목 및 파일 첨부 영역 */}
          <div className="px-8 md:px-12 py-6">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full text-2xl sm:text-3xl font-bold outline-none placeholder:text-slate-100 text-slate-900 disabled:opacity-50 mb-4"
            />

            {/* ✨ [추가] 파일 첨부 UI */}
            <div className="flex flex-col gap-3">
              {/* 파일 선택 버튼 */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors text-sm font-bold text-slate-500 hover:text-slate-700"
                >
                  <Paperclip size={16} />
                  <span>파일 첨부</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-xs text-slate-300">
                  (여러 개 선택 가능)
                </span>
              </div>

              {/* 선택된 파일 목록 표시 */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg text-xs font-medium text-green-700"
                    >
                      <FileText size={12} />
                      <span className="max-w-[150px] truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-0.5 hover:bg-green-100 rounded-full transition-colors text-green-500 hover:text-green-800"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          font-weight: 700 !important;
          font-size: 1.3rem;
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
