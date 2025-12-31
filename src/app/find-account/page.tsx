"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  Mail,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { form } from "framer-motion/client";
import { name } from "./../../../node_modules/estree-util-is-identifier-name/lib/index";

// --- 타입 정의 ---
type FindMode = "id" | "pw";

interface FindInputProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  id: string;
  onChange: (value: string) => void;
}

export default function Page() {
  const [mode, setMode] = useState<FindMode>("id");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    loginId: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      `${mode === "id" ? "아이디" : "비밀번호"} 찾기 요청:`,
      formData
    );
    setIsSubmitted(true);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 정규식을 사용하여 숫자가 아닌 문자는 제거 (빈 문자열로 치환)
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    setCode(onlyNumbers);
  };
  const [code, setCode] = useState("");
  const handleVerify = () => {
    if (code.length === 0) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/find-id`, {
        name: formData.name,
        email: formData.email,
        token: code,
      })
      .then((response) => {
        const responseData = response.data;
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if (
          typeof responseData === "string" &&
          koreanRegex.test(responseData)
        ) {
          console.warn(
            "응답이 한글로 왔습니다 (에러 메시지일 가능성):",
            responseData
          );
          alert("아이디 찾기 실패: " + responseData);
          return;
        }

        console.log("찾은 아이디:", responseData);
        alert(`찾은 아이디는: ${responseData} 입니다.`);
      })
      .catch((error) => {
        alert("인증번호 확인에 실패했습니다. 다시 시도해주세요.");
      });
  };
  const submitButtonClick = () => {
    if (mode === "id") {
      if (formData.name.length === 0) {
        alert("이름을 입력해주세요.");
        return;
      }
      if (formData.email.length === 0) {
        alert("이메일을 입력해주세요.");
        return;
      }
      axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/find-id/get-token?addr=${formData.email}`
        )
        .then((response) => {
          // alert("인증번호가 이메일로 발송되었습니다.");
        })
        .catch((error) => {
          alert("인증번호 발송에 실패했습니다. 다시 시도해주세요.");
        });
    }
    if (mode === "pw") {
      if (formData.loginId.length === 0) {
        alert("아이디를 입력해주세요.");
        return;
      }
      if (formData.email.length === 0) {
        alert("이메일을 입력해주세요.");
        return;
      }
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/getResetPw`, {
          loginId: formData.loginId,
          name: formData.name,
          email: formData.email,
        })
        .then((response) => {
          // alert("인증번호가 이메일로 발송되었습니다.");
        })
        .catch((error) => {
          alert("발송에 실패했습니다. 다시 시도해주세요.");
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
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
          {/* 장식용 배경 요소 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16" />

          {!isSubmitted ? (
            <>
              <div className="mb-10 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-100 mx-auto mb-6">
                  <Sparkles size={24} className="fill-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                  Find Account
                </h2>
                <p className="text-slate-400 text-sm font-bold tracking-tight">
                  계정 정보를 잊으셨나요?
                </p>
              </div>

              {/* 커스텀 탭 스위치 */}
              <div className="flex bg-slate-50 p-1.5 rounded-[1.8rem] mb-8 relative">
                <button
                  onClick={() => setMode("id")}
                  className={`flex-1 py-3.5 text-xs font-black rounded-3xl transition-all relative z-10 ${
                    mode === "id" ? "text-white" : "text-slate-400"
                  }`}
                >
                  아이디 찾기
                </button>
                <button
                  onClick={() => setMode("pw")}
                  className={`flex-1 py-3.5 text-xs font-black rounded-3xl transition-all relative z-10 ${
                    mode === "pw" ? "text-white" : "text-slate-400"
                  }`}
                >
                  비밀번호 재설정
                </button>
                {/* 배경 슬라이더 애니메이션 */}
                <div
                  className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-slate-900 rounded-3xl transition-transform duration-300 ease-out ${
                    mode === "pw" ? "translate-x-full" : "translate-x-0"
                  }`}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "id" ? (
                  <>
                    <FindInput
                      id="find-name"
                      label="이름"
                      icon={<User size={18} />}
                      placeholder="가입 시 등록한 이름"
                      value={formData.name}
                      onChange={(v) => setFormData({ ...formData, name: v })}
                    />
                    <FindInput
                      id="find-email"
                      label="이메일 주소"
                      icon={<Mail size={18} />}
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={(v) => setFormData({ ...formData, email: v })}
                    />
                  </>
                ) : (
                  <>
                    <FindInput
                      id="find-name"
                      label="이름"
                      icon={<User size={18} />}
                      placeholder="가입한 이름 입력"
                      value={formData.name}
                      onChange={(v) => setFormData({ ...formData, name: v })}
                    />
                    <FindInput
                      id="find-id"
                      label="아이디"
                      icon={<User size={18} />}
                      placeholder="가입한 아이디 입력"
                      value={formData.loginId}
                      onChange={(v) => setFormData({ ...formData, loginId: v })}
                    />
                    <FindInput
                      id="find-email-pw"
                      label="이메일 주소"
                      icon={<Mail size={18} />}
                      placeholder="ID에 등록된 이메일"
                      value={formData.email}
                      onChange={(v) => setFormData({ ...formData, email: v })}
                    />
                  </>
                )}

                <button
                  type="submit"
                  onClick={submitButtonClick}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-4xl shadow-2xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 group"
                >
                  {mode === "id" ? "아이디 확인하기" : "재설정 링크 발송"}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </form>
            </>
          ) : (
            /* 결과 완료 화면 */
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-500 mx-auto mb-8">
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                요청 완료!
              </h3>
              {mode === "id" ? (
                <>
                  <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 px-4">
                    입력하신 이메일로 인증번호를 발송해 드렸습니다. <br />
                    이메일을 확인하시고 인증번호를 입력해 주세요.
                  </p>
                  <input
                    type="text"
                    id="code"
                    placeholder="인증번호 입력"
                    value={code}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full mb-6 px-4 py-3 border border-slate-200 rounded-2xl text-center font-black text-slate-700 placeholder:text-slate-300 focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50 outline-none transition-all"
                  />
                  <button
                    onClick={handleVerify}
                    type="button"
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-4xl shadow-2xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 group"
                  >
                    인증번호 확인
                  </button>
                </>
              ) : (
                <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 px-4">
                  입력하신 이메일
                  <span className="text-slate-900">
                    {formData.email}
                  </span>로 <br />
                  재설정링크를 보냈습니다.
                </p>
              )}
              <Link
                href="/sign-in"
                className="block w-full bg-slate-50 text-slate-900 font-black py-5 rounded-4xl hover:bg-slate-100 transition-all"
              >
                로그인 화면으로 돌아가기
              </Link>
            </div>
          )}
        </div>

        {/* 하단 도움말 */}
        <div className="mt-10 text-center">
          <p className="text-xs font-bold text-slate-400">
            도움이 필요하신가요?{" "}
            <Link
              href="#"
              className="text-slate-900 underline underline-offset-4 ml-2"
            >
              고객센터 문의하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 서브 컴포넌트 ---
const FindInput = ({
  label,
  icon,
  placeholder,
  value,
  id,
  onChange,
}: FindInputProps) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em] cursor-pointer"
    >
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors">
        {icon}
      </div>
      <input
        id={id}
        name={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50"
      />
    </div>
  </div>
);
