"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ loginId: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(formData);
    setIsLoading(false);
  };

  const { socialLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[700px]">
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
              <Input
                label="아이디"
                icon={<Mail size={18} />}
                type="text"
                placeholder="ID 혹은 이메일"
                value={formData.loginId}
                onChange={(e) =>
                  setFormData({ ...formData, loginId: e.target.value })
                }
                disabled={isLoading}
              />
              <Input
                label="비밀번호"
                icon={<Lock size={18} />}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
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

              <div className="flex justify-center items-center gap-4 mt-6 text-xs font-bold">
                <Link
                  href="/find-account"
                  className="text-slate-400 hover:text-green-600 transition-colors"
                >
                  아이디/비밀번호 찾기
                </Link>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <Link
                  href="/sign-up"
                  className="text-slate-900 hover:text-green-600 transition-colors"
                >
                  회원가입
                </Link>
              </div>

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
                  onClick={socialLogin.naver}
                  className="w-full bg-[#03C755] text-white font-black py-4 rounded-3xl flex items-center justify-center gap-2"
                >
                  <span className="text-lg font-black">N</span>
                  <span className="text-xs">네이버</span>
                </button>
                <button
                  type="button"
                  onClick={socialLogin.kakao}
                  className="w-full bg-[#FEE500] text-[#191919] font-black py-4 rounded-3xl flex items-center justify-center gap-2"
                >
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

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
      <CheckCircle2 size={14} strokeWidth={3} />
    </div>
    <span className="text-sm font-bold tracking-tight">{text}</span>
  </div>
);
