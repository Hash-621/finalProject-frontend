"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // router import 수정
import axios from "axios";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ChevronLeft,
  Loader2, // 로딩 아이콘 추가
} from "lucide-react";

export default function ResetPwPage() {
  // const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL; // 사용하지 않는 변수 제거
  const router = useRouter(); // next/navigation의 router 사용
  const searchParams = useSearchParams();

  // 상태 관리
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 명시적 분리
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // URL 파라미터 가져오기
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // 1. 초기 토큰 검증
  useEffect(() => {
    const verifyToken = async () => {
      // 파라미터가 없는 경우
      if (!token || !email) {
        alert("잘못된 접근입니다.");
        router.replace("/sign-in");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/resetPw`,
          {
            params: { token, email }, // 쿼리 파라미터를 params 객체로 전달 (더 깔끔함)
          }
        );
        console.log("토큰 검증 성공:", response.data);
        setIsVerified(true);
      } catch (error: any) {
        console.error("토큰 검증 실패:", error);

        const status = error.response?.status;
        if (status === 404 || status === 400) {
          alert("유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.");
        } else {
          alert("서버 통신 중 오류가 발생했습니다.");
        }
        router.replace("/sign-in");
      } finally {
        setIsLoading(false); // 성공이든 실패든 로딩 종료
      }
    };

    verifyToken();
  }, [token, email, router]); // 의존성 배열 추가

  // 2. 비밀번호 변경 요청
  const handleResetPw = async (e: FormEvent) => {
    e.preventDefault(); // 폼 기본 동작 방지 (새로고침 막기)

    if (!password || password.trim().length === 0) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    // 최소 길이 검사 등 추가 가능
    if (password.length < 8) {
      alert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/resetPw`,
        {
          email: email,
          token: token,
          password: password,
        }
      );
      console.log("비밀번호 재설정 성공:", response.data);
      alert(
        "비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다."
      );
      router.push("/sign-in");
    } catch (error) {
      console.error("비밀번호 재설정 실패:", error);
      alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 3. 로딩 중이거나 검증 실패 시 화면
  if (isLoading || !isVerified) {
    return (
      <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-green-500" size={40} />
          <p className="text-slate-500 font-bold text-sm">
            유효성 검사 중입니다...
          </p>
        </div>
      </div>
    );
  }

  // 4. 메인 UI
  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full">
        {/* 상단 뒤로가기 */}
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

        {/* 메인 카드 */}
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden relative p-8 md:p-12">
          {/* 장식용 배경 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-10 -mr-10 -mt-10" />

          {/* 헤더 */}
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

          {/* 폼 영역 */}
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
    </div>
  );
}
