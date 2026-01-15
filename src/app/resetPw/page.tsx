// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
"use client";

// --- [라이브러리 및 훅 임포트] ---
// [수정] Suspense 추가
import { useEffect, useState, FormEvent, Suspense } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Modal from "@/components/common/Modal";

// --- [내부 로직 컴포넌트] --- 
// 원래 ResetPwPage였던 것을 ResetPwContent로 이름 변경하고 export default 제거
function ResetPwContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- [상태 관리] ---
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- [모달 상태 관리] ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
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

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // --- [1. 초기 토큰 검증 (useEffect)] ---
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        openModal("잘못된 접근입니다.", "error", "오류", () =>
          router.replace("/sign-in")
        );
        return;
      }

      try {
        const response = await axios.get(
          `/api/v1/user/resetPw`,
          {
            params: { token, email },
          }
        );
        console.log("토큰 검증 성공:", response.data);
        setIsVerified(true);
      } catch (error: any) {
        console.error("토큰 검증 실패:", error);
        const status = error.response?.status;
        const msg =
          status === 404 || status === 400
            ? "유효하지 않거나 만료된 링크입니다. 다시 요청해주세요."
            : "서버 통신 중 오류가 발생했습니다.";
        openModal(msg, "error", "인증 실패", () => router.replace("/sign-in"));
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- [2. 비밀번호 변경 요청 핸들러] ---
  const handleResetPw = async (e: FormEvent) => {
    e.preventDefault();

    if (!password || password.trim().length === 0) {
      openModal("새 비밀번호를 입력해주세요.", "warning");
      return;
    }

    if (password.length < 8) {
      openModal("비밀번호는 최소 8자 이상이어야 합니다.", "warning");
      return;
    }

    try {
      const response = await axios.post(
        `/api/v1/user/resetPw`,
        {
          email: email,
          token: token,
          password: password,
        }
      );
      console.log("비밀번호 재설정 성공:", response.data);

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
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      {isLoading || !isVerified ? (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50 flex flex-col items-center gap-4">
          {!modalConfig.isOpen && (
            <Loader2 className="animate-spin text-green-500" size={40} />
          )}
          <p className="text-slate-500 font-bold text-sm">
            {modalConfig.isOpen
              ? "알림을 확인해주세요."
              : "유효성 검사 중입니다..."}
          </p>
        </div>
      ) : (
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
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full pl-14 pr-14 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

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

// [수정] 진짜 페이지 컴포넌트: Suspense로 감싸서 내보냄
export default function ResetPwPage() {
  return (
    // fallback에는 데이터를 불러오는 동안 보여줄 간단한 로딩 UI를 넣습니다.
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      }
    >
      <ResetPwContent />
    </Suspense>
  );
}