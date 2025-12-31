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
} from "lucide-react";
import api from "@/api/axios";
import Cookies from "js-cookie";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// 1. Dynamic Import 설정 (SSR 에러 방지)
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
  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);

  // 초기 유저 정보 로드
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
        console.error("유저 정보 로드 실패:", err);
        router.replace("/sign-in");
      }
    };

    fetchUserInfo();
    checkSavedPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 임시 저장된 글 확인
  const checkSavedPost = () => {
    const savedPost = localStorage.getItem("local-hub-temp-post");
    if (savedPost) {
      const { title: sTitle, savedAt } = JSON.parse(savedPost);
      setTimeout(() => {
        if (
          window.confirm(
            `[${savedAt}]에 작성하던 글을 불러올까요?\n제목: ${
              sTitle || "제목 없음"
            }`
          )
        ) {
          const saved = localStorage.getItem("local-hub-temp-post");
          if (saved) {
            const { title: t, content: c, category: cat } = JSON.parse(saved);
            setTitle(t);
            setContent(c);
            setCategory(cat);
          }
        }
      }, 100);
    }
  };

  // 임시 저장 기능
  const saveTemporary = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      alert("저장할 내용이 없습니다.");
      return;
    }
    const tempData = {
      title,
      content,
      category,
      savedAt: new Date().toLocaleString(),
    };
    localStorage.setItem("local-hub-temp-post", JSON.stringify(tempData));
    alert("임시 저장되었습니다.");
  }, [title, content, category]);

  // 이미지 핸들러 (Base64 방식)
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

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
    };
  }, []);

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
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  // ▼▼▼▼▼ [핵심 수정] handleSubmit 함수 ▼▼▼▼▼
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userData?.userId) {
      alert("유저 정보를 확인 중입니다. 잠시만 기다려주세요.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        category === "RECOMMEND" ? "/community/recommend" : "/community/free";

      const payload = {
        userId: userData.userId,
        title: title,
        content: content,
        category: category,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };

      // 1. FormData 생성
      const formData = new FormData();

      // 2. JSON 데이터를 Blob으로 변환하여 'data' 파트에 추가
      // application/json 타입을 명시해야 백엔드가 DTO로 인식함
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("data", jsonBlob);

      console.log("🚀 전송 시작:", endpoint);

      // 3. 전송 (Axios가 Content-Type을 multipart/form-data로 자동 설정함)
      const response = await api.post(endpoint, formData);

      if (response.status === 200 || response.status === 201) {
        alert("게시글이 성공적으로 등록되었습니다!");
        localStorage.removeItem("local-hub-temp-post");
        router.push(
          category === "RECOMMEND" ? "/community/recommend" : "/community/free"
        );
      }
    } catch (error: any) {
      console.error("❌ 발행 실패:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "서버 오류";
      alert(`글 작성 실패: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // ▲▲▲▲▲ [수정 완료] ▲▲▲▲▲

  return (
    <div className="min-h-screen bg-[#fcfdfc] p-4 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* 상단 툴바 */}
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-400 text-sm focus:text-green-600 transition-colors cursor-pointer"
            >
              <option value="FREE">자유게시판</option>
              <option value="RECOMMEND">추천게시판</option>
            </select>
            {userData && (
              <span className="ml-auto text-xs text-slate-300 font-medium">
                작성자: {userData.nickname}
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

        {/* 하단 정보 */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-slate-300">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={14} className="text-green-500" />
            <span>Creative Hub Editor v2</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <History size={14} />
            <span>Auto-save enabled</span>
          </div>
        </div>
      </div>

      {/* Quill 에디터 커스텀 스타일 */}
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
