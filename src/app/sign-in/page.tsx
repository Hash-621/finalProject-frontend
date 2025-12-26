"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Page() {
  const [formData, setFormData] = useState({ loginId: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login Attempt:", formData);
  };

  // 네이버 로그인 핸들러
  const handleNaverLogin = () => {
    // 여기에 네이버 인증 API 경로를 넣으세요
    // window.location.href = "http://localhost:8080/oauth2/authorization/naver";
    console.log("Naver Login Clicked");
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[700px]">
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />

          <div className="relative z-10">
            {/* 기존 LOCAL HUB를 지우고 아래 코드를 넣으세요 */}
            <Link
              href="/"
              className="flex items-center transition hover:opacity-80 mb-16"
            >
              <span className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
                다잇슈
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

          <div className="relative z-10 flex items-center gap-4 text-slate-400 text-xs font-bold tracking-widest uppercase">
            <span>Join Our Local Community</span>
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 섹션 */}
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
              />

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-slate-100 rounded-lg checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                    로그인 유지
                  </span>
                </label>
                <Link
                  href="/find-account"
                  className="text-xs font-black text-green-600"
                >
                  비밀번호 찾기
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 group"
              >
                시작하기{" "}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              {/* 구분선 */}
              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 shrink-0">
                  Or Social Login
                </span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              {/* 소셜 로그인 버튼 그룹 */}
              <div className="grid grid-cols-2 gap-3">
                {/* 네이버 로그인 버튼 */}
                <button
                  type="button"
                  onClick={handleNaverLogin}
                  className="w-full bg-[#03C755] text-white font-black py-4 rounded-3xl shadow-lg shadow-green-100 hover:brightness-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="text-lg font-black">N</span>
                  <span className="text-xs">네이버</span>
                </button>

                {/* 카카오 로그인 버튼 */}
                <button
                  type="button"
                  onClick={() => console.log("Kakao Login Clicked")}
                  className="w-full bg-[#FEE500] text-[#191919] font-black py-4 rounded-3xl shadow-lg shadow-yellow-100 hover:brightness-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {/* 카카오 말풍선 모양 아이콘 대용 */}
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

            <div className="mt-10 text-center">
              <p className="text-xs font-bold text-slate-400">
                아직 회원이 아니신가요?{" "}
                <Link
                  href="/sign-up"
                  className="text-green-600 font-black ml-2 underline underline-offset-4"
                >
                  회원가입 하기
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
      <CheckCircle2 size={14} strokeWidth={3} />
    </div>
    <span className="text-sm font-bold tracking-tight">{text}</span>
  </div>
);

interface LoginInputProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const LoginInput = ({
  label,
  icon,
  type,
  placeholder,
  value,
  onChange,
}: LoginInputProps) => (
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
        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50"
      />
    </div>
  </div>
);
