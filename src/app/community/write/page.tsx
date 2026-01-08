// "use client": 이 파일이 서버가 아닌 브라우저(클라이언트)에서 실행되는 컴포넌트임을 선언합니다.
// (useState, useEffect 같은 리액트 훅을 사용하려면 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import React, {
  useState, // 상태 관리 (변수 저장)
  Suspense, // 비동기 로딩 처리 (데이터가 준비될 때까지 기다림)
  useMemo, // 값 캐싱 (성능 최적화)
  useEffect, // 화면이 그려진 후 실행될 작업 (초기화 등)
  useCallback, // 함수 캐싱 (성능 최적화)
  useRef,
  use, // DOM 요소에 직접 접근하거나 값을 유지할 때 사용
} from "react";

// Next.js 관련 기능 임포트
import dynamic from "next/dynamic"; // 컴포넌트를 동적으로 로드 (SSR 방지용)
import { useRouter, useSearchParams } from "next/navigation"; // 페이지 이동 및 URL 파라미터 읽기

// 아이콘 라이브러리 (lucide-react) 임포트
import {
  ArrowLeft, // 뒤로 가기 화살표
  Send, // 전송(비행기) 아이콘
  Save, // 저장(디스켓) 아이콘
  LayoutList, // 리스트 아이콘
  Loader2, // 로딩 스피너
  CheckSquare, // 체크된 네모 박스
  Square, // 빈 네모 박스
} from "lucide-react";

// 서버 통신을 위한 axios 설정 파일
import api from "@/api/axios";
// 쿠키 조작을 위한 라이브러리 (로그인 토큰 확인용)
import Cookies from "js-cookie";
// 텍스트 에디터 라이브러리 (React Quill)
import ReactQuill from "react-quill-new";
// 텍스트 에디터의 스타일 시트 (디자인)
import "react-quill-new/dist/quill.snow.css";
// 커스텀 모달 컴포넌트 (알림창)
import Modal from "@/components/common/Modal";

const serverURL = process.env.NEXT_PUBLIC_API_URL;
// --- [1. 텍스트 에디터 동적 임포트 설정] ---
// ReactQuill은 브라우저의 'document' 객체를 사용하므로 서버 사이드 렌더링(SSR)을 하면 에러가 납니다.
// 그래서 dynamic()을 사용하여 '브라우저에서만' 실행되도록 설정합니다.
const ReactQuillEditor = dynamic(
  async () => {
    // 비동기로 라이브러리를 가져옵니다.
    const { default: RQ } = await import("react-quill-new");
    // 컴포넌트를 반환합니다. forwardedRef는 부모가 에디터를 제어할 수 있게 ref를 전달합니다.
    return function Comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false, // 서버 사이드 렌더링을 끕니다. (중요)
    // 에디터가 로딩되는 동안 보여줄 깜빡이는 박스(스켈레톤 UI)를 정의합니다.
    loading: () => (
      <div className="h-[400px] bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100" />
    ),
  }
);

// --- [메인 컴포넌트: 실제 글쓰기 로직] ---
function WriteContent() {
  // 페이지 이동을 위한 도구
  const router = useRouter();
  // URL의 쿼리 파라미터(?category=FREE 등)를 읽어오는 도구
  const searchParams = useSearchParams();
  // 에디터에 직접 접근하기 위한 ref (이미지 핸들링 등에 필요)
  const quillRef = useRef<ReactQuill | null>(null);

  // URL에 카테고리가 있으면 그걸 쓰고, 없으면 기본값 'FREE'(자유게시판)로 설정
  const initialCategory = searchParams.get("category") || "FREE";

  // --- [상태 관리 (State)] ---
  const [title, setTitle] = useState(""); // 글 제목
  const [content, setContent] = useState(""); // 글 내용 (HTML)
  const [category, setCategory] = useState(initialCategory); // 선택된 카테고리
  const [isSubmitting, setIsSubmitting] = useState(false); // 전송 중 여부 (중복 클릭 방지)

  // 사용자 정보 상태 (로그인한 사람의 정보)
  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);

  // 인증 체크 중인지 여부 (초기값 true: 로딩 중)
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 관리자 여부 (true면 공지사항 작성 가능)
  const [isAdmin, setIsAdmin] = useState(false);

  // --- [모달(알림창) 설정] ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, // 열림 여부
    title: "", // 제목
    content: "", // 내용
    type: "success" as "success" | "error" | "warning" | "confirm", // 아이콘 타입
    onConfirm: undefined as (() => void) | undefined, // 확인 버튼 클릭 시 실행할 함수
  });

  // 모달 열기 함수 (편의를 위해 만듦)
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
      // 제목이 없으면 타입에 따라 자동 설정
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

  // --- [임시 저장된 글 확인 로직] ---
  // useCallback을 써서 함수를 메모리에 저장해둡니다. (isAdmin이 바뀔 때만 갱신)
  const checkSavedPost = useCallback(() => {
    // 브라우저의 로컬 스토리지에서 임시 저장된 글을 가져옵니다.
    const savedPost = localStorage.getItem("local-hub-temp-post");

    if (savedPost) {
      // 저장된 데이터가 있다면 JSON으로 파싱해서 내용과 저장 시간을 꺼냅니다.
      const { title: sTitle, savedAt } = JSON.parse(savedPost);

      // 모달이 너무 빨리 뜨는 것을 방지하기 위해 0.5초 뒤에 물어봅니다.
      setTimeout(() => {
        openModal(
          `[${savedAt}]에 작성하던 글을 불러올까요?`,
          "confirm", // 확인/취소 타입
          "임시 저장 불러오기",
          () => {
            // 사용자가 '확인'을 누르면 실행되는 부분
            const saved = localStorage.getItem("local-hub-temp-post");
            if (saved) {
              const { title: t, content: c, category: cat } = JSON.parse(saved);
              setTitle(t); // 제목 복구
              setContent(c); // 내용 복구

              // [중요] 저장된 카테고리가 '공지사항(NOTICE)'인데 현재 유저가 관리자가 아니라면?
              // 보안을 위해 강제로 '자유게시판(FREE)'으로 바꿉니다.
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
  }, [isAdmin]); // 관리자 권한 여부에 따라 로직이 달라지므로 의존성 배열에 추가

  // --- [2. 초기 진입 시: 유저 정보 로드 및 인증 체크] ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      // 쿠키에서 토큰 확인
      const token = Cookies.get("token");

      // 1. 토큰이 없는 경우 (로그인 안 함)
      if (!token) {
        openModal(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동합니다.",
          "warning",
          "접근 제한",
          () => router.replace("/sign-in") // 로그인 페이지로 튕겨냄
        );
        return;
      }

      // 2. 토큰이 있는 경우 (유저 정보 요청)
      try {
        const res = await api.get("/mypage/info");
        // API 응답에서 ID와 닉네임 추출
        const fetchedId = res.data.userId || res.data.id || res.data.loginId;
        const fetchedNickname = res.data.userNickname || res.data.nickname;
        const response = await fetch(`${serverURL}/api/v1/admin/isAdmin`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ loginId: res.data.loginId }),
        });
        const isUserAdmin = await response.json();

        // [추가] 관리자 여부 확인 (API에서 role 정보를 준다고 가정)

        const fetchedRole = res.data.role || "USER";
        // const isUserAdmin = fetchedRole === "ADMIN";

        if (fetchedId) {
          // 상태 업데이트
          setUserData({
            userId: fetchedId,
            nickname: fetchedNickname || "사용자",
          });
          setIsAdmin(isUserAdmin); // 관리자 상태 저장

          // 인증 체크 끝났음을 알림 (로딩 화면 해제)
          setIsAuthChecking(false);

          // 유저 정보를 다 불러온 뒤에 임시 저장된 글이 있는지 확인합니다.
          // (여기서 호출해야 isAdmin 값이 반영된 상태로 체크 가능)
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
  // 카테고리나 권한이 바뀔 때마다 실행되어, 관리자가 아닌데 공지사항을 선택했는지 감시합니다.
  useEffect(() => {
    // 로딩이 끝났고, 관리자가 아닌데, 카테고리가 NOTICE라면?
    if (!isAuthChecking && !isAdmin && category === "NOTICE") {
      setCategory("FREE"); // 강제로 자유게시판으로 변경
    }
  }, [category, isAdmin, isAuthChecking]);

  // --- [임시 저장 버튼 클릭 핸들러] ---
  const saveTemporary = useCallback(() => {
    // 내용이 없으면 저장 안 함
    if (!title.trim() && !content.trim()) {
      openModal("저장할 내용이 없습니다.", "warning");
      return;
    }
    // 저장할 데이터 객체 생성
    const tempData = {
      title,
      content,
      category,
      savedAt: new Date().toLocaleString(), // 저장한 시간
    };
    // 로컬 스토리지에 JSON 문자열로 저장
    localStorage.setItem("local-hub-temp-post", JSON.stringify(tempData));
    openModal("임시 저장되었습니다.", "success");
  }, [title, content, category]);

  // --- [이미지 업로드 핸들러] ---
  // 에디터 툴바의 이미지 버튼을 눌렀을 때 실행됩니다.
  const imageHandler = useCallback(() => {
    // 가상의 파일 입력창(input type=file) 생성
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", ""); // 여러 장 선택 가능
    input.click();

    // 파일이 선택되면 실행
    input.onchange = async () => {
      const fileArray = input.files;
      if (!fileArray?.length) return;

      // 선택된 파일들을 하나씩 처리
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        // FileReader로 이미지를 읽어서 Base64 문자열로 변환
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const quill = quillRef.current?.getEditor();
          // 현재 커서 위치 확인
          const range = quill?.getSelection()?.index;
          // 커서 위치에 이미지 태그 삽입
          if (range !== undefined && range !== null) {
            quill?.insertEmbed(range, "image", reader.result);
          }
        };
      }
    };
  }, []);

  // --- [에디터 설정 (Modules)] ---
  const modules = useMemo(
    () => ({
      toolbar: {
        // 툴바 버튼 구성
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        // 이미지 버튼 클릭 시 우리가 만든 핸들러 사용
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  // --- [최종 발행 버튼 클릭 핸들러] ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 방지
    if (isSubmitting) return; // 이미 전송 중이면 무시

    // 유저 정보 없으면 차단
    if (!userData?.userId) {
      openModal("유저 정보를 확인 중입니다.", "warning");
      return;
    }

    // 제목/내용 비었으면 차단
    if (!title.trim() || !content.trim()) {
      openModal("제목과 내용을 모두 입력해주세요.", "warning");
      return;
    }

    // [최종 방어] 관리자가 아닌데 공지사항이면 에러 처리
    if (!isAdmin && category === "NOTICE") {
      openModal("공지사항 작성 권한이 없습니다.", "error");
      return;
    }

    // 전송 시작 (로딩 상태)
    setIsSubmitting(true);

    try {
      // 카테고리에 따라 API 주소 결정 (공지사항 API / 자유게시판 API)
      const endpoint =
        category === "NOTICE" ? "/community/notice" : "/community/free";

      // 서버로 보낼 데이터 객체
      const payload = {
        userId: userData.userId,
        title: title,
        content: content,
        category: category,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };

      // FormData 생성 (JSON + 파일 전송 대비, 현재는 JSON만 보내지만 확장성 고려)
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("dto", jsonBlob);

      // API POST 요청 전송
      const response = await api.post(endpoint, formData);

      // 성공 시 (200 OK 또는 201 Created)
      if (response.status === 200 || response.status === 201) {
        openModal(
          "게시글이 성공적으로 등록되었습니다!",
          "success",
          "등록 완료",
          () => {
            // 성공했으니 임시 저장된 내용은 삭제
            localStorage.removeItem("local-hub-temp-post");
            // 해당 게시판 목록으로 이동
            router.push(
              category === "NOTICE" ? "/community/notice" : "/community/free"
            );
          }
        );
      }
    } catch (error: any) {
      // 실패 시 에러 처리
      console.error("❌ 발행 실패:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "서버 오류";
      openModal(`글 작성 실패: ${errorMessage}`, "error");
    } finally {
      // 성공하든 실패하든 전송 상태 해제
      setIsSubmitting(false);
    }
  };

  // --- [화면 렌더링 1: 인증 체크 중일 때] ---
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
        {/* 화면 중앙에 로딩 스피너만 표시 */}
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      </>
    );
  }

  // --- [화면 렌더링 2: 인증 완료 후 실제 글쓰기 화면] ---
  return (
    <div className="min-h-screen bg-[#fcfdfc] p-4 md:py-12">
      {/* 알림 모달 컴포넌트 */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <div className="max-w-5xl mx-auto">
        {/* 상단 버튼 영역 (뒤로가기, 임시저장, 발행하기) */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button
            onClick={() => router.back()} // 뒤로 가기
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>돌아가기</span>
          </button>

          <div className="flex gap-3">
            {/* 임시 저장 버튼 */}
            <button
              onClick={saveTemporary}
              disabled={isSubmitting} // 전송 중엔 비활성화
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <Save size={18} />
              <span className="hidden sm:inline">임시저장</span>
            </button>
            {/* 발행하기 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-green-600 transition-all flex items-center gap-2 group active:scale-95 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                // 로딩 중 UI
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>발행 중...</span>
                </>
              ) : (
                // 평소 UI
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

        {/* 에디터 메인 영역 (흰색 박스) */}
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">
          {/* 헤더 부분: 아이콘, 카테고리 선택, 작성자 표시 */}
          <div className="px-8 md:px-12 pt-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <LayoutList size={20} />
            </div>

            {/* 카테고리 선택 (중요: 관리자만 변경 가능) */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!isAdmin} // 관리자가 아니면 비활성화 (선택 불가)
              className={`bg-transparent border-none outline-none font-bold text-sm transition-colors ${
                !isAdmin
                  ? "text-slate-400 cursor-not-allowed" // 일반 유저 스타일
                  : "text-slate-500 hover:text-green-600 cursor-pointer" // 관리자 스타일
              }`}
            >
              <option value="FREE">자유게시판</option>
              {isAdmin && <option value="NOTICE">공지사항</option>}
            </select>

            {/* 상단 고정 체크박스 (관리자이고 공지사항일 때만 보임) */}

            {/* 작성자 닉네임 표시 */}
            {userData && (
              <span className="ml-auto text-xs text-slate-300 font-medium">
                작성자: {userData.nickname} {isAdmin && "(관리자)"}
              </span>
            )}
          </div>

          {/* 제목 입력 필드 */}
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

          {/* React Quill 에디터 본문 영역 */}
          <div className="custom-editor-wrapper">
            <ReactQuillEditor
              forwardedRef={quillRef} // ref 전달
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules} // 툴바 설정
              placeholder="당신의 이야기를 이웃들과 나누어 보세요..."
              readOnly={isSubmitting} // 전송 중엔 수정 불가
            />
          </div>
        </div>
      </div>

      {/* 스타일 커스터마이징 (전역 스타일) */}
      <style jsx global>{`
        /* 툴바 스타일: 배경색 맞추고 상단 고정 */
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
        /* 에디터 테두리 제거 및 폰트 설정 */
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
        }
        /* 에디터 내부 입력 영역 스타일 */
        .ql-editor {
          padding: 3rem !important;
          min-height: 500px;
          font-size: 1.15rem;
          line-height: 1.8;
          color: #334155;
        }
        /* placeholder 스타일 */
        .ql-editor.ql-blank::before {
          left: 3rem !important;
          color: #e2e8f0 !important;
          font-style: normal !important;
          font-weight: 800 !important;
          font-size: 1.5rem;
        }
        /* 모바일 반응형 스타일 */
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

// --- [최상위 컴포넌트] ---
// useSearchParams를 사용하는 컴포넌트(WriteContent)는 Suspense로 감싸야 에러가 안 납니다.
export default function WritePage() {
  return (
    <Suspense
      fallback={
        // 로딩 중에 보여줄 간단한 UI
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

// 1. 페이지 진입 및 리소스 로드 (Initialization)
// 사용자가 URL을 입력하면 브라우저는 자바스크립트를 실행합니다.

// Suspense 대기: WritePage 컴포넌트가 먼저 실행됩니다. 하위 컴포넌트인 WriteContent가 준비될 때까지 fallback에 정의된 "에디터 준비 중..." 로딩 화면을 먼저 렌더링합니다.

// 동적 임포트 (Dynamic Import): ReactQuillEditor는 ssr: false 설정 때문에 서버에서 미리 렌더링되지 않습니다. 브라우저가 이 부분에 도달했을 때 비로소 react-quill-new 라이브러리(무거운 파일)를 다운로드하고 실행합니다.

// 상태 변수 초기화:

// title, content: 빈 문자열로 생성.

// userData: null로 시작.

// isAuthChecking: true (검증 전이므로 로딩 상태).

// isAdmin: false (일단 일반 유저로 가정).

// category: URL 파라미터(?category=...)를 확인하고, 없으면 기본값 "FREE"(자유게시판)로 설정.

// 2. 보안 검문 및 신원 확인 (Authentication Flow)
// 화면이(로딩바가) 그려진 직후 useEffect가 즉시 발동하여 사용자 인증을 시작합니다.

// 쿠키 조회: 브라우저 쿠키 저장소에서 token을 찾습니다.

// 없음: 즉시 경고 모달(openModal)을 띄우고, 확인 시 로그인 페이지로 강제 이동(router.replace)시킵니다.

// API 검증 요청: 토큰이 있다면 api.get("/mypage/info")를 호출해 서버에 "이 토큰 주인 누구냐?"라고 묻습니다.

// 응답 처리 및 권한 부여:

// 서버로부터 ID, 닉네임, 그리고 역할(Role) 정보를 받습니다.

// setUserData로 내 정보를 저장합니다.

// 만약 역할이 ADMIN이면 setIsAdmin(true)를 실행하여 **관리자 모드(공지사항 작성 권한)**를 활성화합니다.

// 모든 확인이 끝났으므로 setIsAuthChecking(false)를 실행해 로딩 화면을 걷어내고 진짜 글쓰기 에디터 화면을 보여줍니다.

// 3. 과거의 기억 소환 (임시 저장 확인)
// 인증 체크가 끝나자마자(isAdmin 상태가 확정된 직후), checkSavedPost 함수가 실행됩니다.

// 로컬 스토리지 탐색: 브라우저 내부 저장소(localStorage)에 local-hub-temp-post라는 키값이 있는지 뒤져봅니다.

// 복구 제안: 데이터가 발견되면 0.5초 뒤 "작성하던 글을 불러올까요?"라는 확인 모달을 띄웁니다.

// 데이터 복원 및 방어:

// 사용자가 '확인'을 누르면 저장된 제목, 내용을 상태에 덮어씌웁니다.

// [중요] 저장된 카테고리가 '공지사항(NOTICE)'이었더라도, 현재 로그인한 사람이 관리자가 아니라면(!isAdmin) 강제로 '자유게시판(FREE)'으로 변경하여 해킹이나 버그를 방지합니다.

// 4. 작성 및 인터랙션 (User Interaction)
// 이제 사용자가 글을 씁니다.

// 텍스트 입력: 제목과 본문을 칠 때마다 setTitle, setContent가 작동하여 메모리 상의 변수 값을 실시간으로 업데이트합니다.

// 카테고리 변경:

// 관리자: 드롭다운을 눌러 '공지사항'을 선택할 수 있습니다.

// 일반 유저: 드롭다운이 비활성화(disabled)되어 있어 변경 자체가 불가능합니다.

// 이미지 업로드:

// 에디터의 이미지 아이콘을 클릭하면 imageHandler가 작동해 파일 탐색기를 엽니다.

// 사진을 선택하면 별도의 서버 업로드 API를 타지 않고, 브라우저가 FileReader를 사용해 이미지를 **Base64 문자열(엄청 긴 텍스트)**로 변환합니다.

// 변환된 문자열을 에디터의 <img> 태그 src에 바로 꽂아 넣습니다. (즉, 글 내용 자체에 이미지 데이터가 포함됩니다.)

// 임시 저장 버튼: 클릭 시 현재 작성 중인 상태를 JSON.stringify로 문자열로 만들어 localStorage에 덮어씌웁니다.

// 5. 방어 기제 작동 (Security Effect)
// 사용자가 개발자 도구 등을 조작해 강제로 카테고리를 바꾸려 할 수 있습니다. 이를 막기 위해 별도의 useEffect가 감시 중입니다.

// 감시: category나 isAdmin 상태가 변할 때마다 실행됩니다.

// 차단: "관리자가 아닌데(!isAdmin) 카테고리가 공지사항(NOTICE)이다?" -> 즉시 setCategory("FREE")를 실행해 자유게시판으로 되돌려버립니다.

// 6. 전송 및 마무리 (Submission Flow)
// 사용자가 [발행하기] 버튼을 누르면 handleSubmit이 실행됩니다.

// 클라이언트 유효성 검사:

// isSubmitting(전송 중)이면 클릭 무시.

// 유저 정보, 제목, 내용이 비었는지 검사.

// 최종 권한 검사: 관리자가 아닌데 공지사항으로 되어 있다면 여기서 한 번 더 막고 에러 모달을 띄웁니다.

// 데이터 패키징:

// payload 객체에 제목, 내용, 카테고리, 유저 ID 등을 담습니다.

// new Blob을 사용해 이 객체를 JSON 파일 형태(application/json)로 포장합니다.

// FormData라는 전송용 박스에 dto라는 이름으로 담습니다.

// API 전송:

// 카테고리가 NOTICE면 /community/notice, FREE면 /community/free로 주소를 다르게 설정하여 api.post 요청을 날립니다.

// 결과 처리:

// 성공(200): 성공 모달을 띄우고, 확인 클릭 시 localStorage의 임시 저장 데이터를 삭제한 뒤 해당 게시판 목록으로 이동합니다.

// 실패(Error): 에러 내용을 모달로 띄우고, 현재 페이지에 그대로 머무릅니다(작성한 내용 보존). 마지막으로 isSubmitting을 풀어 버튼을 다시 누를 수 있게 합니다.
