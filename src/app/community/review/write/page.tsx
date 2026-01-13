// "use client": 이 파일이 서버가 아닌 브라우저(클라이언트)에서 실행되는 컴포넌트임을 명시합니다.
// React의 useState, useEffect 같은 훅을 사용하려면 필수입니다.
"use client";

// --- [라이브러리 및 훅 임포트] ---
import React, {
  useState, // 상태 관리 (변수 저장)
  Suspense, // 비동기 로딩 처리 (로딩 중에 보여줄 화면 처리)
  useMemo, // 성능 최적화 (값을 캐싱)
  useEffect, // 화면이 렌더링 된 후 실행될 작업 (초기화 등)
  useCallback, // 성능 최적화 (함수를 캐싱)
  useRef, // DOM 요소에 직접 접근하거나 값을 유지할 때 사용
} from "react";

// Next.js 관련 기능 임포트
import dynamic from "next/dynamic"; // 컴포넌트를 동적으로 로드 (SSR 방지용)
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 훅

// 아이콘 라이브러리 (lucide-react) 임포트
import {
  ArrowLeft, // 뒤로 가기 화살표
  Send, // 전송(비행기) 아이콘
  Loader2, // 로딩 스피너
  Camera, // 카메라 아이콘
  X, // 닫기(취소) 아이콘
  LayoutList, // 리스트 아이콘
  Image as ImageIcon, // 이미지 아이콘
} from "lucide-react";

// 서버 통신을 위한 axios 설정 파일
import api from "@/api/axios";
// 쿠키 조작을 위한 라이브러리 (로그인 토큰 확인용)
import Cookies from "js-cookie";
// 텍스트 에디터 라이브러리 (타입 정의)
import ReactQuill from "react-quill-new";
// 텍스트 에디터의 스타일 시트 (디자인)
import "react-quill-new/dist/quill.snow.css";
// [추가] 커스텀 모달 컴포넌트 (알림창)
import Modal from "@/components/common/Modal";

// --- [1. 텍스트 에디터 동적 임포트 설정] ---
// ReactQuill은 브라우저 전용 객체(document 등)를 쓰기 때문에 서버 사이드 렌더링(SSR)을 하면 에러가 납니다.
// 그래서 dynamic()을 써서 '브라우저에서만' 로딩되도록 설정합니다.
const ReactQuillEditor = dynamic(
  async () => {
    // react-quill-new 라이브러리를 비동기로 가져옵니다.
    const { default: RQ } = await import("react-quill-new");
    // 컴포넌트를 반환합니다. forwardedRef는 부모가 에디터를 제어할 수 있게 ref를 전달하는 역할입니다.
    return function Comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false, // 서버 사이드 렌더링을 끕니다. (중요)
    // 에디터가 로딩되는 동안 보여줄 깜빡이는 네모 박스(스켈레톤 UI)를 정의합니다.
    loading: () => (
      <div className="h-[400px] bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100" />
    ),
  }
);

// --- [메인 컴포넌트: 리뷰 작성 내용] ---
function TourReviewContent() {
  // 페이지 이동을 시킬 수 있는 도구(router)를 가져옵니다.
  const router = useRouter();
  // 에디터 객체에 직접 접근하기 위한 ref 생성 (이미지 업로드 핸들링 등에 필요)
  const quillRef = useRef<ReactQuill | null>(null);

  // 게시글 카테고리 고정값 (여행 리뷰)
  const category = "REVIEW";

  // --- [상태 관리 (State)] ---
  // 제목 저장
  const [title, setTitle] = useState("");

  // 에디터 내용(HTML 태그 포함) 저장
  const [content, setContent] = useState("");

  // 전송 중인지 여부 (중복 클릭 방지)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 썸네일 파일 객체 저장 (서버 전송용)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // 썸네일 미리보기 URL 저장 (화면 표시용)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // [핵심] 인증 체크 상태
  // true면 "아직 로그인했는지 확인 중"이라는 뜻입니다. 이때는 화면을 보여주지 않고 로딩만 띄웁니다.
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 사용자 정보 저장 (ID, 닉네임)
  const [userData, setUserData] = useState<{
    userId: any;
    nickname: string;
  } | null>(null);

  // --- [모달(알림창) 상태 관리] ---
  // 모달을 열고 닫고, 내용을 바꾸기 위한 설정값들입니다.
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, // 열림 여부
    title: "", // 모달 제목
    content: "", // 모달 내용
    type: "success" as "success" | "error" | "warning" | "confirm", // 모달 아이콘 타입
    onConfirm: undefined as (() => void) | undefined, // 확인 버튼 눌렀을 때 실행할 함수
  });

  // 모달을 여는 함수 (편하게 쓰기 위해 만듦)
  const openModal = (
    content: string, // 내용
    type: "success" | "error" | "warning" | "confirm" = "success", // 타입 (기본값 success)
    title?: string, // 제목 (없으면 타입에 맞춰 자동 설정)
    onConfirm?: () => void // 확인 시 실행할 함수
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

  // 모달을 닫는 함수
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ----------------------

  // --- [2. 초기 진입 시: 유저 정보 로드 및 인증 체크] ---
  // useEffect([], ...)는 컴포넌트가 처음 화면에 나타날 때 딱 한 번 실행됩니다.
  useEffect(() => {
    const fetchUserInfo = async () => {
      // 1. 쿠키에서 'token'이라는 이름의 값을 가져옵니다.
      const token = Cookies.get("token");

      // (1) 토큰이 없는 경우: 로그인이 안 된 상태
      if (!token) {
        // 경고 모달을 띄우고 확인을 누르면 로그인 페이지로 보냅니다.
        openModal(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동합니다.",
          "warning",
          "접근 제한",
          () => router.replace("/sign-in")
        );
        // 여기서 함수를 종료(return)해서 아래 코드가 실행되지 않게 합니다.
        // isAuthChecking이 true로 유지되므로 글쓰기 폼은 보이지 않습니다.
        return;
      }

      // (2) 토큰이 있는 경우: 서버에 유저 정보를 요청해 봅니다.
      try {
        const res = await api.get("/mypage/info");

        // 서버 응답에서 ID와 닉네임을 찾습니다. (API마다 필드명이 다를 수 있어 여러 개 체크)
        const fetchedId = res.data.userId || res.data.id || res.data.loginId;
        const fetchedNickname = res.data.userNickname || res.data.nickname;

        if (fetchedId) {
          // 유저 정보를 상태에 저장합니다.
          setUserData({
            userId: fetchedId,
            nickname: fetchedNickname || "사용자",
          });
          // 인증 확인이 끝났으므로 로딩 화면을 끄고 실제 글쓰기 화면을 보여줍니다.
          setIsAuthChecking(false);
        }
      } catch (err) {
        // 서버 요청이 실패하면 (토큰 만료 등) 에러 로그를 찍고 로그인 페이지로 보냅니다.
        console.error("유저 정보 로드 실패:", err);
        openModal("로그인 정보가 만료되었습니다.", "error", "오류", () =>
          router.replace("/sign-in")
        );
      }
    };

    fetchUserInfo(); // 위에서 정의한 함수 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- [3. 에디터 이미지 핸들러 (본문 삽입용)] ---
  // 에디터 툴바의 '이미지' 버튼을 눌렀을 때 실행되는 함수입니다.
  const imageHandler = useCallback(() => {
    // 1. 가상의 <input type="file"> 태그를 만듭니다.
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*"); // 이미지 파일만 허용
    input.setAttribute("multiple", ""); // 여러 장 선택 가능
    input.click(); // 사용자가 파일을 선택하도록 창을 띄웁니다.

    // 사용자가 파일을 선택하고 '열기'를 누르면 실행됩니다.
    input.onchange = async () => {
      const fileArray = input.files;
      if (!fileArray?.length) return; // 선택된 파일이 없으면 종료

      // 선택된 파일들을 하나씩 처리합니다.
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // 파일 용량 체크 (5MB 초과 시 차단)
        if (file.size > 5 * 1024 * 1024) {
          openModal("이미지 용량은 5MB를 초과할 수 없습니다.", "error");
          return;
        }

        // FileReader를 사용해 이미지를 Base64 문자열로 읽어옵니다.
        const reader = new FileReader();
        reader.readAsDataURL(file);

        // 읽기가 완료되면 실행됩니다.
        reader.onload = () => {
          // 현재 에디터 객체를 가져옵니다.
          const quill = quillRef.current?.getEditor();
          // 현재 커서 위치를 알아냅니다.
          const range = quill?.getSelection()?.index;
          // 커서 위치가 유효하다면 그 자리에 이미지를 삽입합니다.
          if (range !== undefined && range !== null) {
            quill?.insertEmbed(range, "image", reader.result);
          }
        };
      }
    };
  }, []);

  // --- [4. 썸네일 이미지 핸들러 (대표 사진)] ---
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 이벤트에서 첫 번째 파일을 가져옵니다.
    const file = e.target.files?.[0];
    if (file) {
      // 5MB 용량 체크
      if (file.size > 5 * 1024 * 1024) {
        openModal("파일 크기는 5MB 이하여야 합니다.", "warning");
        return;
      }
      // 전송용 파일 상태 저장
      setThumbnailFile(file);

      // 미리보기용 이미지 읽기
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 썸네일 삭제 함수
  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  // --- [에디터 설정 (툴바)] ---
  // useMemo를 써서 불필요한 재성성을 막습니다.
  const modules = useMemo(
    () => ({
      toolbar: {
        // 툴바에 들어갈 버튼 구성
        container: [
          [{ header: [1, 2, 3, false] }], // 제목 크기
          ["bold", "italic", "underline", "strike"], // 굵게, 기울임, 밑줄, 취소선
          [{ color: [] }, { background: [] }], // 글자색, 배경색
          [{ list: "ordered" }, { list: "bullet" }], // 숫자 리스트, 점 리스트
          ["link", "image"], // 링크, 이미지
          ["clean"], // 서식 지우기
        ],
        // 이미지 버튼 클릭 시 우리가 만든 imageHandler를 쓰도록 연결
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  // --- [5. 게시글 등록 핸들러 (서버 전송)] ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작(새로고침) 막기
    if (isSubmitting) return; // 이미 전송 중이면 중복 실행 막기

    // 유저 정보가 없으면 차단
    if (!userData?.userId) {
      openModal("유저 정보를 확인 중입니다. 잠시만 기다려주세요.", "warning");
      return;
    }

    // 제목이나 내용이 비었으면 차단
    if (!title.trim() || !content.trim()) {
      openModal("제목과 내용을 모두 입력해주세요.", "warning");
      return;
    }

    // 전송 시작 상태로 변경 (버튼 비활성화)
    setIsSubmitting(true);

    try {
      // 1. 서버로 보낼 JSON 데이터 객체 생성
      const payload = {
        userId: userData.userId,
        title: title,
        content: content,
        category: category,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };

      // 2. FormData 객체 생성 (파일과 JSON을 같이 보내기 위해 사용)
      const formData = new FormData();

      // 3. JSON 데이터를 Blob으로 변환해서 'dto'라는 이름으로 추가
      // (백엔드에서 @RequestPart("dto")로 받기 때문)
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("dto", jsonBlob);

      // 4. 썸네일 파일이 있다면 'file'이라는 이름으로 추가
      if (thumbnailFile) {
        formData.append("file", thumbnailFile);
      }

      // 5. 서버로 POST 요청 전송
      const response = await api.post("/community/post", formData);

      // 6. 성공 시 (상태 코드 200 또는 201)
      if (response.status === 200 || response.status === 201) {
        // 성공 모달 띄우고, 확인 누르면 목록 페이지로 이동
        openModal(
          "여행 리뷰가 성공적으로 등록되었습니다!",
          "success",
          "등록 완료",
          () => router.push("/community/review")
        );
      }
    } catch (error: any) {
      // 실패 시 에러 로그 찍고 모달 띄움
      console.error("발행 실패:", error);
      openModal("글 작성에 실패했습니다.", "error");
    } finally {
      // 성공하든 실패하든 전송 상태를 끔 (버튼 다시 활성화)
      setIsSubmitting(false);
    }
  };

  // --- [화면 렌더링 분기] ---

  // [중요] 인증 체크 중일 때 (isAuthChecking === true)
  // 로그인 안 된 사람이 화면을 보는 것을 막기 위해 로딩 화면만 보여줍니다.
  if (isAuthChecking) {
    return (
      <>
        {/* 모달은 최상위에 있어야 하므로 여기서도 렌더링 */}
        <Modal
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          title={modalConfig.title}
          content={modalConfig.content}
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
        />
        {/* 화면 중앙에 빙글빙글 도는 로딩 아이콘 표시 */}
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      </>
    );
  }

  // --- [인증 완료 시: 실제 글쓰기 화면 렌더링] ---
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
        {/* 상단 툴바 영역 (목록 버튼, 발행 버튼) */}
        <div className="flex items-center justify-between mb-8 px-4">
          {/* 목록으로 돌아가기 버튼 */}
          <button
            onClick={() => router.push("/community/review")}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>목록으로</span>
          </button>

          {/* 발행하기 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit} // 클릭 시 handleSubmit 함수 실행
              disabled={isSubmitting} // 전송 중이면 클릭 불가
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-[#00c73c] hover:shadow-green-100 transition-all flex items-center gap-2 group active:scale-95 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                // 전송 중일 때 보여줄 UI (로딩 아이콘)
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>발행 중...</span>
                </>
              ) : (
                // 평소 상태일 때 보여줄 UI (비행기 아이콘)
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

        {/* 에디터 메인 컨테이너 (흰색 박스) */}
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">
          {/* 헤더 부분 (아이콘, 작성자 표시) */}
          <div className="px-8 md:px-12 pt-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <LayoutList size={20} />
            </div>
            <span className="font-bold text-slate-400 text-sm">여행 리뷰</span>
            {/* 유저 데이터가 있으면 작성자 닉네임 표시 */}
            {userData && (
              <span className="ml-auto text-xs text-slate-300 font-medium">
                작성자: {userData.nickname}
              </span>
            )}
          </div>

          {/* 제목 입력 필드 */}
          <div className="px-8 md:px-12 py-6">
            <input
              type="text"
              placeholder="리뷰 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)} // 입력할 때마다 title 상태 업데이트
              disabled={isSubmitting} // 전송 중엔 수정 불가
              className="w-full text-4xl md:text-5xl font-bold outline-none placeholder:text-slate-100 text-slate-900 bg-transparent"
            />
          </div>

          {/* Quill 에디터 영역 */}
          <div className="custom-editor-wrapper">
            <ReactQuillEditor
              forwardedRef={quillRef} // ref 전달
              theme="snow" // 테마 설정
              value={content} // 내용 바인딩
              onChange={setContent} // 내용 변경 시 state 업데이트
              modules={modules} // 툴바 설정 등
              placeholder="여행의 추억을 기록해보세요..."
              readOnly={isSubmitting} // 전송 중엔 읽기 전용
            />
          </div>

          {/* 썸네일 업로드 영역 (하단) */}
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
                {/* 썸네일이 없을 때: 업로드 버튼 보여줌 */}
                {!thumbnailPreview && (
                  <label className="w-32 h-32 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-green-500 hover:text-green-500 text-slate-400 transition-all group">
                    <Camera
                      size={24}
                      className="mb-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-bold">사진 추가</span>
                    <input
                      type="file"
                      className="hidden" // 실제 input은 숨김
                      accept="image/*"
                      onChange={handleThumbnailChange} // 파일 선택 시 핸들러 실행
                    />
                  </label>
                )}

                {/* 썸네일이 있을 때: 미리보기 보여줌 */}
                {thumbnailPreview && (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    {/* 삭제 버튼 (호버 시 등장) */}
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

      {/* 스타일 커스터마이징 (global 스타일) */}
      {/* Quill 에디터의 기본 스타일을 덮어쓰기 위해 사용합니다. */}
      <style jsx global>{`
        /* 툴바 스타일: 테두리 없애고 배경색 맞춤, 상단 고정(sticky) */
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
        /* 에디터 컨테이너 테두리 제거 */
        .ql-container.ql-snow {
          border: none !important;
        }
        /* 에디터 내부 입력 공간 스타일 */
        .ql-editor {
          padding: 3rem !important;
          min-height: 400px;
          font-size: 1.15rem;
          line-height: 1.8;
          color: #334155;
        }
        /* placeholder(안내 문구) 스타일 */
        .ql-editor.ql-blank::before {
          left: 3rem !important;
          color: #e2e8f0 !important;
          font-style: normal !important;
          font-weight: 800 !important;
          font-size: 1.5rem;
        }
        /* 모바일 화면(폭 640px 이하) 대응 스타일 */
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

// --- [최상위 페이지 컴포넌트] ---
export default function TourReviewWritePage() {
  // Suspense: 하위 컴포넌트(TourReviewContent)가 로딩되는 동안 fallback UI를 보여줍니다.
  // useSearchParams 등을 사용할 때 클라이언트 컴포넌트 감싸기가 권장됩니다.
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

// 1. 초기 로드 및 컴포넌트 마운트 (Client-Side Rendering)

// 사용자가 /tour/review/write 주소로 접속하면 브라우저는 JavaScript를 실행합니다.

// Next.js 번들 로드: TourReviewWritePage 컴포넌트가 실행됩니다.

// 동적 임포트 대기: ReactQuillEditor는 ssr: false 옵션 때문에 서버에서 미리 만들어지지 않고, 브라우저에서만 로드됩니다. 이 로딩 시간 동안 Suspense의 fallback인 "로딩 중..." 스피너가 잠깐 보입니다.

// 상태(State) 초기화: useState들이 실행되며 메모리에 변수 공간(title, content, isAuthChecking = true 등)이 생성됩니다.

// 2. 인증 체크 프로세스 (useEffect 실행)

// 화면이 처음 그려진 직후(Mount), useEffect 훅이 즉시 실행되어 로그인 여부를 판단합니다.

// 쿠키 확인: 브라우저 쿠키 저장소에서 token 값을 조회합니다.

// 토큰 없음: 즉시 openModal 함수가 실행되어 경고창이 뜨고, 확인 클릭 시 router.replace("/sign-in")이 실행되어 로그인 페이지로 이동합니다.

// API 요청 (검증): 토큰이 있다면 api.get("/mypage/info")를 호출해 백엔드 서버에 유저 정보를 요청합니다.

// 응답 성공: 받아온 데이터에서 userId와 nickname을 추출해 setUserData로 상태에 저장합니다. 그리고 setIsAuthChecking(false)를 실행해 로딩 화면을 걷어내고 실제 글쓰기 폼을 렌더링합니다.

// 응답 실패: 토큰이 만료되었거나 유효하지 않다면 에러 모달을 띄우고 로그인 페이지로 이동시킵니다.

// 3. 사용자 입력 및 상태 업데이트 (Interaction)
// 이제 사용자가 화면을 조작합니다. 모든 입력은 React의 상태(State)와 동기화됩니다.

// 제목 입력: <input>에 타이핑할 때마다 onChange가 발생하여 setTitle이 호출되고, title 변수 값이 실시간으로 갱신됩니다.

// 본문 작성 (Quill): 에디터에 글을 쓰면 ReactQuill 라이브러리가 HTML 태그 문자열(예: <p>안녕하세요</p>)을 생성하여 setContent를 통해 content 변수에 저장합니다.

// 에디터 내 이미지 삽입:

// 툴바의 이미지 버튼을 누르면 imageHandler가 실행됩니다.

// 숨겨진 <input type="file">이 열리고 파일을 선택하면 FileReader가 작동합니다.

// 파일을 Base64 문자열로 변환하여 에디터 내부에 <img> 태그 형태로 즉시 삽입합니다. (이때 5MB 용량 체크 수행)

// 썸네일(대표 사진) 업로드:

// 카메라 아이콘을 눌러 파일을 선택하면 handleThumbnailChange가 실행됩니다.

// 실제 파일 객체(File)는 thumbnailFile 상태에 저장(서버 전송용)됩니다.

// 동시에 FileReader로 미리보기 URL을 만들어 thumbnailPreview 상태에 저장(화면 표시용)합니다.

// 4. 데이터 전송 준비 및 요청 (Submit Logic)
// 사용자가 [리뷰 발행] 버튼을 클릭하면 handleSubmit 함수가 실행됩니다.

// 유효성 검사 (Validation):

// isSubmitting이 true인지 확인 (중복 전송 방지).

// userData.userId 존재 여부 확인.

// title과 content가 비어있는지 확인.

// 하나라도 문제가 있으면 openModal로 경고하고 함수를 종료(return)합니다.

// 전송 잠금: setIsSubmitting(true)를 실행하여 버튼을 비활성화하고 로딩 아이콘으로 변경합니다.

// 데이터 패키징 (FormData 구성):

// JSON 데이터: userId, title, content 등이 담긴 객체를 생성하고, JSON.stringify로 문자열로 만든 뒤 Blob 타입으로 변환하여 FormData에 dto라는 키로 담습니다.

// 파일 데이터: 앞서 저장해둔 thumbnailFile이 있다면 FormData에 file이라는 키로 담습니다.

// 비동기 API 호출: await api.post("/community/post", formData)를 실행하여 서버로 데이터를 전송합니다. 브라우저는 응답이 올 때까지 대기합니다.

// 5. 응답 처리 및 페이지 이동
// 백엔드 서버로부터 응답이 도착한 후의 처리 과정입니다.

// 성공 (HTTP 200/201):

// openModal을 통해 "등록되었습니다" 성공 알림을 띄웁니다.

// 사용자가 모달의 확인 버튼을 누르면 onConfirm 콜백이 실행되어 router.push("/tour/review")가 작동, 목록 페이지로 화면이 전환됩니다.

// 실패 (Error):

// catch 블록으로 넘어가 에러 로그를 출력하고, 실패 알림 모달을 띄웁니다. 현재 페이지에 머무릅니다.

// 마무리 (Finally):

// 성공/실패 여부와 상관없이 setIsSubmitting(false)가 실행되어 버튼의 로딩 상태가 해제되고 다시 클릭 가능한 상태가 됩니다.
