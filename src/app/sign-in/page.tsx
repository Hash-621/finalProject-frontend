"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import api from "@/api/axios";
import { UserData } from "@/types/user";
import Cookies from "js-cookie"; // [추가] 쿠키 라이브러리

export default function Page() {
  const router = useRouter();

  const [formData, setFormData] = useState<UserData>({
    loginId: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. 서버에 로그인 요청
      const response = await api.post("/user/login", formData);

      if (response.status === 200) {
        console.log("로그인 성공:", response.data);

        // 2. 서버 응답에서 토큰 추출
        const token = response.data.token || response.data.accessToken;

        if (token) {
          // 3. [수정] localStorage 대신 쿠키에 토큰 저장
          // expires: 7은 7일 동안 유지됨을 의미합니다. 필요에 따라 조절하세요.
          Cookies.set("token", token, { expires: 7, path: "/" });

          // 4. 메인 페이지로 이동
          window.location.href = "/";
        } else {
          alert("서버 응답에 인증 토큰이 포함되어 있지 않습니다.");
        }
      }
    } catch (error: any) {
      console.error("로그인 에러:", error);
      if (error.response) {
        alert(
          error.response.data?.message || "로그인 정보가 올바르지 않습니다."
        );
      } else {
        alert("서버와 통신할 수 없습니다. 서버 상태를 확인해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = () => {
    window.location.href =
      "http://192.168.0.101:8080/oauth2/authorization/naver";
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[700px]">
        {/* 왼쪽 브랜드 섹션 (변경 없음) */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />
          <div className="relative z-10">
            <Link
              href="/"
              className="flex items-center transition hover:opacity-80 mb-16"
            >
              <span className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
                다잇슈{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-emerald-400">
                  대전
                </span>
              </span>
            </Link>
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8">
              우리 동네의 <br />
              <span className="text-green-400 font-serif italic font-light">
                모든 순간을 연결합니다.
              </span>
            </h2>
            <div className="space-y-6">
              <FeatureItem text="검증된 동네 맛집 & 핫플레이스 탐색" />
              <FeatureItem text="실시간 지역 뉴스 및 커뮤니티 소통" />
              <FeatureItem text="내 주변 전문 병원 및 관광지 정보" />
            </div>
          </div>
        </div>

        {/* 오른쪽 로그인 폼 */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative bg-white">
          <div className="max-w-sm mx-auto w-full relative">
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Login
              </h3>
              <p className="text-slate-400 text-sm font-bold tracking-tight">
                계정 정보를 입력해 주세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <LoginInput
                label="아이디"
                icon={<Mail size={18} />}
                type="text"
                placeholder="ID 혹은 이메일"
                value={formData.loginId}
                onChange={(v: string) =>
                  setFormData({ ...formData, loginId: v })
                }
                disabled={isLoading}
              />
              <LoginInput
                label="비밀번호"
                icon={<Lock size={18} />}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(v: string) =>
                  setFormData({ ...formData, password: v })
                }
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-green-600 disabled:bg-slate-400 transition-all flex items-center justify-center gap-2 mt-4 group"
              >
                {isLoading ? "로그인 중..." : "시작하기"}
                {!isLoading && (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>

              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  Social Login
                </span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleNaverLogin}
                  className="w-full bg-[#03C755] text-white font-black py-4 rounded-3xl flex items-center justify-center gap-2"
                >
                  <span className="text-lg font-black">N</span>
                  <span className="text-xs">네이버</span>
                </button>
                <button
                  type="button"
                  onClick={() => console.log("Kakao")}
                  className="w-full bg-[#FEE500] text-[#191919] font-black py-4 rounded-3xl flex items-center justify-center gap-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.337 6.091l-.81 2.962c-.06.22.19.4.37.28l3.49-2.31c.52.06 1.06.09 1.61.09 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
                  </svg>
                  <span className="text-xs">카카오</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// 보조 컴포넌트 생략 방지
const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
      <CheckCircle2 size={14} strokeWidth={3} />
    </div>
    <span className="text-sm font-bold tracking-tight">{text}</span>
  </div>
);

const LoginInput = ({
  label,
  icon,
  type,
  placeholder,
  value,
  onChange,
  disabled,
}: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em]">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl outline-none transition-all font-black text-slate-700 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50 disabled:opacity-50"
      />
    </div>
  </div>
);
