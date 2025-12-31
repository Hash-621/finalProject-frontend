"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CircleCheckBig,
  Calendar,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    loginId: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "MALE",
    birthDate: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return alert("비밀번호가 일치하지 않습니다.");
    if (!agreed) return alert("약관에 동의해 주세요.");
    console.log("서버로 전송될 데이터:", formData);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[850px]">
        {/* 왼쪽 브랜드 섹션 */}
        <div className="lg:col-span-5 flex flex-col justify-between p-12 md:p-16 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-green-500 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32" />
          <div className="relative z-10">
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
                icon={<User size={24} />}
                title="계정 만들기"
                desc="단 1분이면 충분합니다."
                active
              />
              <Step
                icon={<CircleCheckBig size={24} />}
                title="가입 완료"
                desc="커뮤니티를 즐겨보세요."
                active={false}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 md:p-20 flex flex-col justify-center bg-white">
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto w-full space-y-6"
          >
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                Sign Up
              </h3>
              <p className="text-slate-400 text-sm font-bold">
                로컬 허브의 회원이 되어보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="아이디"
                icon={<User size={18} />}
                placeholder="ID 입력"
                value={formData.loginId}
                onChange={(e) =>
                  setFormData({ ...formData, loginId: e.target.value })
                }
              />
              <Input
                label="닉네임"
                icon={<Sparkles size={18} />}
                placeholder="별명"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
              />
            </div>

            <Input
              label="이메일 주소"
              icon={<Mail size={18} />}
              type="email"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="생년월일"
                icon={<Calendar size={18} />}
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em]">
                  성별
                </label>
                <div className="flex gap-2 h-[62px]">
                  {["MALE", "FEMALE"].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender })}
                      className={`flex-1 rounded-[1.8rem] font-black text-sm transition-all border ${
                        formData.gender === gender
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50/50 text-slate-400 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      {gender === "MALE" ? "남성" : "여성"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="비밀번호"
                icon={<Lock size={18} />}
                type="password"
                placeholder="8자 이상"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <Input
                label="비밀번호 확인"
                icon={<ShieldCheck size={18} />}
                type="password"
                placeholder="다시 입력"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2.2rem] border border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-6 h-6 rounded-xl accent-green-500 cursor-pointer"
                />
                <span className="text-xs font-black text-slate-700">
                  전체 약관 동의 (필수)
                </span>
              </label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-black text-slate-400 underline"
              >
                약관보기
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-6 rounded-4xl hover:bg-green-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 group"
            >
              가입 완료하고 시작하기{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
              <h4 className="text-xl font-black text-slate-800">
                서비스 이용약관
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[400px] text-sm text-slate-500 leading-relaxed">
              <p>
                제 1조 (목적) 본 약관은 다잇슈 대전이 제공하는 서비스의 이용
                조건 및 절차를 규정함을 목적으로 합니다...
              </p>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button
                onClick={() => {
                  setAgreed(true);
                  setIsModalOpen(false);
                }}
                className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl hover:bg-green-600 transition-all"
              >
                동의하고 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Step = ({ icon, title, desc, active }: any) => (
  <div
    className={`flex gap-5 items-start ${
      active ? "opacity-100" : "opacity-30"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
        active
          ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
          : "bg-slate-800 text-slate-500"
      }`}
    >
      {icon}
    </div>
    <div>
      <h4 className="text-white font-black text-lg tracking-tight">{title}</h4>
      <p className="text-slate-500 text-sm font-medium mt-1">{desc}</p>
    </div>
  </div>
);
