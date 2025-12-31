"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  CircleCheckBig,
  X,
} from "lucide-react";

// --- 타입 정의 ---
interface SignUpInputProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

interface StepProps {
  item: {
    icon: React.ReactNode;
    title: string;
    desc: string;
  };
  active: boolean;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    loginId: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreed) {
      alert("약관에 동의해 주세요.");
      return;
    }
    console.log("가입 성공:", formData);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[750px]">
        {/* 왼쪽 섹션 */}
        <div className="lg:col-span-5 flex flex-col justify-between p-12 md:p-16 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-green-500 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32" />

          <div className="relative z-10">
            {/* 로고 섹션: 다잇슈 대전 스타일 적용 */}
            <Link
              href="/"
              className="flex items-center transition hover:opacity-80 mb-20"
            >
              <span className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
                다잇슈
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-emerald-400">
                  대전
                </span>
              </span>
            </Link>

            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-10">
              반가워요! <br />
              <span className="text-green-400 font-serif italic font-light">
                새로운 여정의 시작
              </span>
            </h2>

            <div className="space-y-10">
              <Step
                item={{
                  icon: <User size={24} />,
                  title: "계정 만들기",
                  desc: "단 1분이면 충분합니다.",
                }}
                active
              />
              <Step
                item={{
                  icon: <CircleCheckBig size={24} />,
                  title: "가입 완료",
                  desc: "커뮤니티를 즐겨보세요.",
                }}
                active={false}
              />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase">
            <ShieldCheck size={16} className="text-green-500" />
            <span>Encrypted & Secure Registration</span>
          </div>
        </div>

        {/* 오른쪽 폼 섹션 */}
        <div className="lg:col-span-7 p-8 md:p-20 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full relative">
            <div className="mb-12 text-center lg:text-left">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                Sign Up
              </h3>
              <p className="text-slate-400 text-sm font-bold tracking-tight">
                로컬 허브의 회원이 되어보세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SignUpInput
                  label="아이디"
                  icon={<User size={18} />}
                  placeholder="ID 입력"
                  value={formData.loginId}
                  onChange={(v: string) =>
                    setFormData({ ...formData, loginId: v })
                  }
                />
                <SignUpInput
                  label="닉네임"
                  icon={<Sparkles size={18} />}
                  placeholder="별명"
                  value={formData.nickname}
                  onChange={(v: string) =>
                    setFormData({ ...formData, nickname: v })
                  }
                />
              </div>
              <SignUpInput
                label="이메일 주소"
                icon={<Mail size={18} />}
                type="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(v: string) => setFormData({ ...formData, email: v })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SignUpInput
                  label="비밀번호"
                  icon={<Lock size={18} />}
                  type="password"
                  placeholder="8자 이상"
                  value={formData.password}
                  onChange={(v: string) =>
                    setFormData({ ...formData, password: v })
                  }
                />
                <SignUpInput
                  label="비밀번호 확인"
                  icon={<ShieldCheck size={18} />}
                  type="password"
                  placeholder="다시 입력"
                  value={formData.confirmPassword}
                  onChange={(v: string) =>
                    setFormData({ ...formData, confirmPassword: v })
                  }
                />
              </div>

              {/* 약관 동의 영역 */}
              <div className="bg-slate-50/50 p-6 rounded-[2.2rem] border border-slate-100 mt-4 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-xl checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer"
                    />
                    {/* SVG 위치 강제 조정: top-1/2에서 -translate-y-1/2 가 아니라 살짝 더 위로 올림 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-all pointer-events-none -translate-y-px">
                      <Check size={14} className="text-white" strokeWidth={4} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700">
                      전체 약관 동의 (필수)
                    </span>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-[10px] font-black text-slate-400 hover:text-green-600 underline underline-offset-4"
                >
                  약관보기
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-6 rounded-4xl shadow-2xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 group"
              >
                가입 완료하고 시작하기
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 약관 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-xl font-black text-slate-800 tracking-tight">
                서비스 이용약관
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[50vh] text-sm text-slate-500 leading-relaxed font-medium">
              <p className="mb-4 font-bold text-slate-800">제 1조 (목적)</p>
              <p className="mb-6">
                본 약관은 Local Hub가 제공하는 모든 서비스의 이용 조건 및 절차를
                규정함을 목적으로 합니다...
              </p>
              <p className="mb-4 font-bold text-slate-800">
                제 2조 (개인정보 보호)
              </p>
              <p>
                회사는 이용자의 개인정보를 소중히 관리하며, 법령에 의거하여
                보호합니다.
              </p>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => {
                  setAgreed(true);
                  setIsModalOpen(false);
                }}
                className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl hover:bg-green-600 transition-all"
              >
                동의하고 닫기
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white text-slate-400 font-black py-4 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 서브 컴포넌트 ---
const Step = ({ item, active }: StepProps) => (
  <div
    className={`flex gap-5 items-start transition-opacity ${
      active ? "opacity-100" : "opacity-30"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
        active
          ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
          : "bg-slate-800 text-slate-500"
      }`}
    >
      {item.icon}
    </div>
    <div>
      <h4 className="text-white font-black text-lg tracking-tight">
        {item.title}
      </h4>
      <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">
        {item.desc}
      </p>
    </div>
  </div>
);

const SignUpInput = ({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
}: SignUpInputProps) => (
  <div className="space-y-2.5">
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
        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50"
      />
    </div>
  </div>
);
