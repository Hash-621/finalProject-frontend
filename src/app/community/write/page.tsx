"use client";

import React, {
  useState,
  Suspense,
  useMemo,
  useEffect,
  useCallback,
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
} from "lucide-react";
import api from "@/api/axios";
import Cookies from "js-cookie";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100" />
  ),
});

import "react-quill-new/dist/quill.snow.css";

function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "FREE";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);

  // 1. 유저 정보 가져오기 (마운트 시 한 번만 실행)
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("token");
      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        router.push("/login");
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
        // 에러 시 강제 로그아웃 처리 등을 방지하기 위해 alert 후 이동
        router.replace("/login");
      }
    };

    fetchUserInfo();

    // 임시 저장 확인
    const savedPost = localStorage.getItem("local-hub-temp-post");
    if (savedPost) {
      const { title: sTitle, savedAt } = JSON.parse(savedPost);
      // setTimeout을 사용하여 렌더링 사이클이 끝난 후 confirm 창을 띄움
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
    // 의존성 배열을 완전히 비우거나, router가 확실히 고정되도록 설정
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.userId) {
      alert("유저 정보를 확인 중입니다. 잠시만 기다려주세요.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const endpoint =
        category === "RECOMMEND" ? "/community/recommend" : "/community/free";
      const payload = {
        userId: userData.userId,
        title: title,
        content: content,
        category: category,
      };

      const response = await api.post(endpoint, payload);

      if (response.status === 200 || response.status === 201) {
        alert("게시글이 성공적으로 등록되었습니다!");
        localStorage.removeItem("local-hub-temp-post");
        router.push(
          category === "RECOMMEND" ? "/community/recommend" : "/community/free"
        );
      }
    } catch (error: any) {
      console.error("발행 실패:", error);
      alert(`글 작성 실패: ${error.response?.data?.message || "서버 오류"}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] p-4 md:py-12">
      <div className="max-w-5xl mx-auto">
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
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <Save size={18} />
              <span className="hidden sm:inline">임시저장</span>
            </button>
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
              className="w-full text-4xl md:text-5xl font-bold outline-none placeholder:text-slate-100 text-slate-900"
            />
          </div>

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
        <div className="min-h-screen flex items-center justify-center">
          에디터 로딩 중...
        </div>
      }
    >
      <WriteContent />
    </Suspense>
  );
}
