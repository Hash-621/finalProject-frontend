// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 입력, URL 파라미터 읽기, 상태 관리 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useState, FormEvent } from "react"; // 리액트 훅 (상태, 효과, 이벤트 타입)
import { useRouter, useSearchParams } from "next/navigation"; // 라우팅 관련 훅 (이동, 파라미터 읽기)
import axios from "axios"; // 서버 통신 라이브러리
import Link from "next/link"; // 링크 이동 컴포넌트
// 아이콘 라이브러리
import {
  Lock, // 자물쇠 아이콘
  Eye, // 눈 (비밀번호 보이기)
  EyeOff, // 눈 감김 (비밀번호 숨기기)
  ArrowRight, // 화살표 아이콘
  KeyRound, // 열쇠 아이콘
  ChevronLeft, // 뒤로가기 화살표
  Loader2, // 로딩 스피너
} from "lucide-react";
// [추가] 모달 컴포넌트 임포트 (알림창용)
import Modal from "@/components/common/Modal";

// --- [메인 페이지 컴포넌트] ---
export default function ResetPwPage() {
  const router = useRouter(); // 라우터 객체 생성
  const searchParams = useSearchParams(); // URL 쿼리 파라미터(?token=...&email=...)를 읽는 훅

  // --- [상태 관리] ---
  const [isVerified, setIsVerified] = useState(false); // 토큰 검증 완료 여부 (true면 비밀번호 입력창 보여줌)
  const [isLoading, setIsLoading] = useState(true); // 로딩 중 여부 (초기엔 로딩 상태)
  const [password, setPassword] = useState(""); // 사용자가 입력한 새 비밀번호
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 보이기/숨기기 토글

  // --- [모달 상태 관리] ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, // 모달 열림 여부
    title: "", // 제목
    content: "", // 내용
    type: "success" as "success" | "error" | "warning" | "confirm", // 타입
    onConfirm: undefined as (() => void) | undefined, // 확인 버튼 콜백
  });

  // --- [모달 헬퍼 함수] ---
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
      title: title || (type === "error" ? "오류 발생" : "알림"),
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  // ---------------------------

  // --- http://m.blog.naver.com/sw4r/222035063635 ---
  // 이메일 링크에 포함된 token과 email 값을 가져옵니다.
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // --- [1. 초기 토큰 검증 (useEffect)] ---
  // 페이지에 들어오자마자 실행되어 이 링크가 유효한지 서버에 물어봅니다.
  useEffect(() => {
    const verifyToken = async () => {
      // 파라미터가 하나라도 없으면 잘못된 접근으로 간주
      if (!token || !email) {
        // [수정] 모달로 경고 띄우고 확인 누르면 로그인 페이지로 쫓아냄
        openModal("잘못된 접근입니다.", "error", "오류", () =>
          router.replace("/sign-in")
        );
        return;
      }

      try {
        // 서버에 토큰 검증 요청 (GET 방식)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/resetPw`,
          {
            params: { token, email }, // 쿼리 파라미터로 전달
          }
        );
        console.log("토큰 검증 성공:", response.data);
        setIsVerified(true); // 검증 성공! 비밀번호 입력창을 보여줄 준비 완료
      } catch (error: any) {
        console.error("토큰 검증 실패:", error);

        // 에러 상태에 따라 메시지 다르게 설정
        const status = error.response?.status;
        const msg =
          status === 404 || status === 400
            ? "유효하지 않거나 만료된 링크입니다. 다시 요청해주세요."
            : "서버 통신 중 오류가 발생했습니다.";

        // [수정] 실패 모달 띄우고 확인 누르면 로그인 페이지로 이동
        openModal(msg, "error", "인증 실패", () => router.replace("/sign-in"));
      } finally {
        setIsLoading(false); // 성공하든 실패하든 로딩 끝
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열이므로 컴포넌트 마운트 시 1회만 실행

  // --- [2. 비밀번호 변경 요청 핸들러] ---
  const handleResetPw = async (e: FormEvent) => {
    e.preventDefault(); // 폼 제출 시 새로고침 막기

    // 유효성 검사: 빈 값 체크
    if (!password || password.trim().length === 0) {
      openModal("새 비밀번호를 입력해주세요.", "warning");
      return;
    }

    // 유효성 검사: 길이 체크 (최소 8자)
    if (password.length < 8) {
      openModal("비밀번호는 최소 8자 이상이어야 합니다.", "warning");
      return;
    }

    try {
      // 서버에 비밀번호 변경 요청 (POST 방식)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/resetPw`,
        {
          email: email,
          token: token,
          password: password, // 새 비밀번호
        }
      );
      console.log("비밀번호 재설정 성공:", response.data);

      // [수정] 성공 모달 띄우고 확인 누르면 로그인 페이지로 이동
      openModal(
        "비밀번호가 성공적으로 변경되었습니다.\n로그인 페이지로 이동합니다.",
        "success",
        "변경 완료",
        () => router.push("/sign-in")
      );
    } catch (error) {
      console.error("비밀번호 재설정 실패:", error);
      openModal("비밀번호 변경에 실패했습니다. 다시 시도해주세요.", "error");
    }
  };

  // --- [화면 렌더링] ---
  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      {/* [추가] 모달 컴포넌트 렌더링 (평소엔 숨겨져 있음) */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      {/* 3. 로딩 중이거나 검증 실패 시 화면 */}
      {isLoading || !isVerified ? (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50 flex flex-col items-center gap-4">
          {/* 모달이 떠있지 않을 때만 로딩 스피너 보여줌 (깔끔하게) */}
          {!modalConfig.isOpen && (
            <Loader2 className="animate-spin text-green-500" size={40} />
          )}
          <p className="text-slate-500 font-bold text-sm">
            {/* 상황에 따라 안내 문구 변경 */}
            {modalConfig.isOpen
              ? "알림을 확인해주세요."
              : "유효성 검사 중입니다..."}
          </p>
        </div>
      ) : (
        /* 4. 메인 비밀번호 변경 폼 화면 (검증 성공 시에만 보임) */
        <div className="max-w-md w-full">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-black tracking-tight">
              Back to Login
            </span>
          </Link>

          <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden relative p-8 md:p-12">
            {/* 배경 장식 원 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-10 -mr-10 -mt-10" />

            <div className="mb-10 text-center relative z-10">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-100 mx-auto mb-6">
                <KeyRound size={24} className="fill-white/20 stroke-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                Reset Password
              </h2>
              <p className="text-slate-400 text-sm font-bold tracking-tight px-2">
                새로운 비밀번호를 입력해주세요.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleResetPw}>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em] cursor-pointer"
                >
                  새 비밀번호
                </label>
                <div className="relative group">
                  {/* 자물쇠 아이콘 */}
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  {/* 비밀번호 입력창 */}
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"} // 보이기/숨기기 토글
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full pl-14 pr-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50"
                  />
                  {/* 눈 모양 아이콘 (보이기/숨기기 버튼) */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 변경하기 버튼 */}
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-5 rounded-4xl shadow-2xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 group"
              >
                비밀번호 변경하기
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 1. 페이지 진입 및 검증 (Entry & Verification)

// 페이지가 열리면 isLoading이 true이므로 로딩 화면이 먼저 뜹니다.

// 동시에 useEffect가 실행되어 URL에 있는 token과 email을 확인합니다.

// 파라미터 누락 시: "잘못된 접근입니다" 모달이 뜨고, 확인 누르면 로그인 페이지로 쫓겨납니다.

// 파라미터 존재 시: 서버에 GET /resetPw 요청을 보내 유효한 링크인지 검사합니다.

// 2. 검증 결과 처리 (Validation Result)

// 검증 실패 (만료/위조): "유효하지 않은 링크입니다" 모달이 뜨고 로그인 페이지로 이동합니다.

// 검증 성공: isVerified가 true가 되면서 로딩 화면이 사라지고, 비밀번호 입력 폼이 나타납니다.

// 3. 비밀번호 변경 (Reset Password)

// 사용자가 새 비밀번호를 입력하고 [변경하기] 버튼을 누릅니다.

// handleResetPw가 실행되어 8자 이상인지 등을 체크합니다.

// 통과하면 서버에 POST /resetPw 요청을 보내 실제 비밀번호 변경을 수행합니다.

// 4. 완료 및 이동 (Completion)

// 서버에서 성공 응답이 오면 "성공적으로 변경되었습니다" 모달이 뜹니다.

// 사용자가 **[확인]**을 누르면 로그인 페이지(/sign-in)로 이동하여 새 비밀번호로 로그인을 시도할 수 있게 됩니다.
