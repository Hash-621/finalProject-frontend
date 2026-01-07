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
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  Camera,
  X,
  LayoutList,
  Image as ImageIcon,
} from "lucide-react";
import api from "@/api/axios";
import Cookies from "js-cookie";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
// [추가] 모달 컴포넌트 임포트
import Modal from "@/components/common/Modal";

// 1. ReactQuill Dynamic Import (SSR 방지)
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

function TourReviewContent() {
  const router = useRouter();
  const quillRef = useRef<ReactQuill | null>(null);

  const category = "TOUR_REVIEW";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // [핵심] 인증 체크 상태 (초기값 true로 설정하여 로딩 전 화면 노출 방지)
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);

  // --- 모달 상태 관리 ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  // 모달 열기 함수
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

  // 모달 닫기 함수
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ----------------------

  // 2. 초기 유저 정보 로드 및 인증 체크
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("token");

      // (1) 토큰이 없는 경우: 모달 띄우고 로그인 페이지로 이동
      if (!token) {
        openModal(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동합니다.",
          "warning",
          "접근 제한",
          () => router.replace("/sign-in")
        );
        // 여기서 return하면 isAuthChecking이 true로 유지되어 글쓰기 폼이 보이지 않음
        return;
      }

      // (2) 토큰이 있는 경우: 유저 정보 확인
      try {
        const res = await api.get("/mypage/info");
        const fetchedId = res.data.userId || res.data.id || res.data.loginId;
        const fetchedNickname = res.data.userNickname || res.data.nickname;

        if (fetchedId) {
          setUserData({
            userId: fetchedId,
            nickname: fetchedNickname || "사용자",
          });
          // 인증 확인 완료 -> 화면 보여줌
          setIsAuthChecking(false);
        }
      } catch (err) {
        console.error("유저 정보 로드 실패:", err);
        openModal("로그인 정보가 만료되었습니다.", "error", "오류", () =>
          router.replace("/sign-in")
        );
      }
    };

    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. 에디터 이미지 핸들러 (용량 체크 포함)
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

        // [수정] alert -> openModal
        if (file.size > 5 * 1024 * 1024) {
          openModal("이미지 용량은 5MB를 초과할 수 없습니다.", "error");
          return;
        }

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

  // 4. 썸네일 이미지 핸들러
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        openModal("파일 크기는 5MB 이하여야 합니다.", "warning");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  // 5. 게시글 등록 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userData?.userId) {
      openModal("유저 정보를 확인 중입니다. 잠시만 기다려주세요.", "warning");
      return;
    }

    if (!title.trim() || !content.trim()) {
      openModal("제목과 내용을 모두 입력해주세요.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
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

      if (thumbnailFile) {
        formData.append("file", thumbnailFile);
      }

      const response = await api.post("/community/post", formData);

      if (response.status === 200 || response.status === 201) {
        // [수정] 성공 알림 모달 -> 확인 버튼 누르면 목록으로 이동
        openModal(
          "여행 리뷰가 성공적으로 등록되었습니다!",
          "success",
          "등록 완료",
          () => router.push("/tour/review")
        );
      }
    } catch (error: any) {
      console.error("발행 실패:", error);
      openModal("글 작성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // [중요] 인증 체크 중이면 모달과 로딩바만 보여주고 본문은 숨김 (로그인 페이지로 튕기기 전 화면 보호)
  if (isAuthChecking) {
    return (
      <>
        {/* 모달은 최상위에 렌더링되어 알림을 보여줌 */}
        <Modal
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          title={modalConfig.title}
          content={modalConfig.content}
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
        />
        {/* 뒷배경은 로딩 상태로 유지 */}
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      </>
    );
  }

  // 인증 완료 시 실제 글쓰기 화면 렌더링
  return (
    <div className="min-h-screen bg-[#fcfdfc] p-4 md:py-12">
      {/* 모달 컴포넌트 */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <div className="max-w-5xl mx-auto">
        {/* 상단 툴바 */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button
            onClick={() => router.push("/tour/review")}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>목록으로</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-[#00c73c] hover:shadow-green-100 transition-all flex items-center gap-2 group active:scale-95 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>발행 중...</span>
                </>
              ) : (
                <>
                  <span>리뷰 발행</span>
                  <Send
                    size={18}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 에디터 컨테이너 */}
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">
          <div className="px-8 md:px-12 pt-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <LayoutList size={20} />
            </div>
            <span className="font-bold text-slate-400 text-sm">여행 리뷰</span>
            {userData && (
              <span className="ml-auto text-xs text-slate-300 font-medium">
                작성자: {userData.nickname}
              </span>
            )}
          </div>

          {/* 제목 입력 */}
          <div className="px-8 md:px-12 py-6">
            <input
              type="text"
              placeholder="리뷰 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full text-4xl md:text-5xl font-bold outline-none placeholder:text-slate-100 text-slate-900 bg-transparent"
            />
          </div>

          {/* Quill 에디터 */}
          <div className="custom-editor-wrapper">
            <ReactQuillEditor
              forwardedRef={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="여행의 추억을 기록해보세요..."
              readOnly={isSubmitting}
            />
          </div>

          {/* 썸네일 업로드 영역 */}
          <div className="px-8 md:px-12 py-8 bg-slate-50/50 border-t border-slate-50">
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <ImageIcon size={16} />
                <span>대표 사진 설정</span>
                <span className="text-xs font-normal text-slate-400">
                  (목록에 표시될 이미지입니다)
                </span>
              </label>

              <div className="flex gap-4">
                {!thumbnailPreview && (
                  <label className="w-32 h-32 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-green-500 hover:text-green-500 text-slate-400 transition-all group">
                    <Camera
                      size={24}
                      className="mb-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-bold">사진 추가</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                )}

                {thumbnailPreview && (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 스타일 */}
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
        }
        .ql-editor {
          padding: 3rem !important;
          min-height: 400px;
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

export default function TourReviewWritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mr-2" />
          로딩 중...
        </div>
      }
    >
      <TourReviewContent />
    </Suspense>
  );
}
