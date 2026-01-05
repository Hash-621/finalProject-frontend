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
  Save,
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

// 1. Dynamic Import (SSR 에러 방지)
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

  // 카테고리 고정
  const category = "TOUR_REVIEW";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 대표 사진(썸네일) 상태
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);

  // 유저 정보 로드
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("token");
      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        router.push("/sign-in");
        return;
      }
      try {
        const res = await api.get("/mypage/info");
        const fetchedId = res.data.userId || res.data.id || res.data.loginId;
        const fetchedNickname = res.data.userNickname || res.data.nickname;

        if (fetchedId) {
          setUserData({
            userId: fetchedId,
            nickname: fetchedNickname || "사용자",
          });
        }
      } catch (err) {
        router.replace("/sign-in");
      }
    };
    fetchUserInfo();
  }, [router]);

  // 본문 이미지 핸들러 (Base64)
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
        if (file.size > 5 * 1024 * 1024) {
          alert("이미지 용량은 5MB를 초과할 수 없습니다.");
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

  // 대표 사진(썸네일) 업로드
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!userData?.userId) return alert("유저 정보를 확인 중입니다.");
    if (!title.trim() || !content.trim())
      return alert("제목과 내용을 입력해주세요.");

    setIsSubmitting(true);

    try {
      const payload = {
        userId: userData.userId,
        title: title,
        content: content,
        category: category, // TOUR_REVIEW 고정
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };

      const formData = new FormData();

      // 1. DTO (JSON)
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("dto", jsonBlob);

      // 2. 대표 사진 (File) - 백엔드가 'file' 혹은 'files'로 받는지 확인 필요
      if (thumbnailFile) {
        formData.append("file", thumbnailFile);
      }

      // 전송
      const response = await api.post("/community/post", formData);

      if (response.status === 200 || response.status === 201) {
        alert("여행 리뷰가 등록되었습니다!");
        router.push("/tour/review"); // 목록 페이지로 이동
      }
    } catch (error: any) {
      console.error("발행 실패:", error);
      alert("글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] p-4 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* 상단 툴바 & 목록 버튼 */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button
            onClick={() => router.push("/tour/review")} // 목록으로 이동
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
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-[#00c73c] hover:shadow-green-100 transition-all flex items-center gap-2 group active:scale-95 disabled:bg-slate-400 disabled:scale-100"
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

        {/* 메인 에디터 영역 */}
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">
          {/* 헤더 정보 */}
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

          {/* 대표 사진 첨부 (하단 영역) */}
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
