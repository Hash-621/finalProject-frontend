"use client";

import React, { useState, Suspense, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Save,
  LayoutList,
  Eye,
  History,
} from "lucide-react";
import api from "@/api/axios";

// Quill 에디터를 클라이언트 사이드 전용으로 로드 (SSR 에러 및 findDOMNode 에러 해결 버전)
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100" />
  ),
});

// react-quill-new 전용 스타일 시트 임포트
import "react-quill-new/dist/quill.snow.css";

function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "FREE";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);

  // 1. 페이지 로드 시 임시 저장된 글이 있는지 확인
  useEffect(() => {
    const savedPost = localStorage.getItem("local-hub-temp-post");
    if (savedPost) {
      const { title: sTitle, savedAt } = JSON.parse(savedPost);
      // 사용자에게 불러올지 확인 (제목과 저장 시간을 보여줌)
      if (
        window.confirm(
          `[${savedAt}]에 작성하던 임시 저장 글이 있습니다. 불러오시겠습니까?\n제목: ${
            sTitle || "제목 없음"
          }`
        )
      ) {
        loadTemporary();
      }
    }
  }, []);

  // 2. 임시 저장 로직 (LocalStorage)
  const saveTemporary = () => {
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
    alert("브라우저에 임시 저장되었습니다. 페이지를 새로고침해도 유지됩니다.");
  };

  // 3. 임시 저장 데이터 불러오기
  const loadTemporary = () => {
    const saved = localStorage.getItem("local-hub-temp-post");
    if (saved) {
      const {
        title: sTitle,
        content: sContent,
        category: sCategory,
      } = JSON.parse(saved);
      setTitle(sTitle);
      setContent(sContent);
      setCategory(sCategory);
    }
  };

  // 에디터 툴바 설정
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  // 최종 발행 로직
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const endpoint =
        category === "RECOMMEND" ? "/community/recommend" : "/community/free";

      await api.post(endpoint, {
        userId: "testUser",
        userNickname: "익명",
        title: title,
        content: content,
        category: category,
      });

      alert("게시글이 성공적으로 등록되었습니다!");

      // 발행 성공 시 임시 저장 데이터 삭제
      localStorage.removeItem("local-hub-temp-post");

      router.push(
        category === "RECOMMEND" ? "/community/recommend" : "/community/free"
      );
    } catch (error: any) {
      console.error("작성 실패:", error);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] p-4 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* 상단 액션바 */}
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
            {/* 임시저장 버튼 */}
            <button
              onClick={saveTemporary}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <Save size={18} />
              <span className="hidden sm:inline">임시저장</span>
            </button>

            {/* 발행 버튼 */}
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-green-600 transition-all flex items-center gap-2 group active:scale-95"
            >
              <span>발행하기</span>
              <Send
                size={18}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* 메인 에디터 컨테이너 */}
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">
          {/* 카테고리 선택 영역 */}
          <div className="px-8 md:px-12 pt-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <LayoutList size={20} />
            </div>
            <select
              id="category-select"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-400 text-sm focus:text-green-600 transition-colors cursor-pointer"
            >
              <option value="FREE">자유게시판</option>
              <option value="RECOMMEND">추천게시판</option>
            </select>
          </div>

          {/* 제목 입력 영역 */}
          <div className="px-8 md:px-12 py-6">
            <input
              id="post-title"
              name="title"
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl md:text-5xl font-bold outline-none placeholder:text-slate-100 text-slate-900"
            />
          </div>

          {/* Quill 에디터 영역 */}
          <div className="custom-editor-wrapper">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="당신의 이야기를 이웃들과 나누어 보세요..."
            />
          </div>
        </div>

        {/* 하단 푸터 정보 */}
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
          <div className="hidden sm:block w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <Eye size={14} />
            <span>Responsive View</span>
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

        .ql-editor h1 {
          font-weight: 900;
          font-size: 2.5rem;
        }
        .ql-editor h2 {
          font-weight: 800;
          font-size: 2rem;
        }

        .ql-snow .ql-stroke {
          stroke: #94a3b8;
          stroke-width: 2px;
        }
        .ql-snow .ql-fill {
          fill: #94a3b8;
        }
        .ql-snow.ql-toolbar button:hover .ql-stroke {
          stroke: #22c55e;
        }
        .ql-snow.ql-toolbar button:hover .ql-fill {
          fill: #22c55e;
        }

        /* 모바일 대응 패딩 조절 */
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
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center animate-bounce">
              <Sparkles className="text-green-500" />
            </div>
            <p className="text-slate-400 font-black tracking-[0.2em] text-[10px] uppercase">
              Initializing Editor...
            </p>
          </div>
        </div>
      }
    >
      <WriteContent />
    </Suspense>
  );
}
