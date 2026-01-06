"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 라우터 추가 (가입 후 이동)
import {
  User,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CircleCheckBig,
  Calendar,
  X,
  Timer,
  IdCard,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import Image from "next/image";
import { userService } from "@/api/services";

export default function SignUpPage() {
  const router = useRouter(); // 가입 완료 후 페이지 이동용

  const [formData, setFormData] = useState({
    loginId: "",
    name: "",
    nickname: "",
    email: "",
    emailCode: "",
    password: "",
    confirmPassword: "",
    gender: "M",
    birthDate: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // --- 상태값들 ---
  const [isIdChecked, setIsIdChecked] = useState<boolean | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "verified"
  >("idle");
  const [timeLeft, setTimeLeft] = useState(180);

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailStatus === "sent" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailStatus, timeLeft]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? `0${sec}` : sec}`;
  };

  // 핸들러들
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, loginId: e.target.value });
    setIsIdChecked(null);
  };

  const handleCheckId = async () => {
    if (!formData.loginId) return alert("아이디를 입력해주세요.");

    try {
      const response = await userService.checkIdDuplicate(formData.loginId);
      const isAvailable = response.data; // 백엔드 리턴값 확인 필요 (Boolean 가정)

      setIsIdChecked(isAvailable);

      if (isAvailable) {
        alert("사용 가능한 아이디입니다.");
      } else {
        alert("이미 사용 중인 아이디입니다.");
      }
    } catch (error) {
      console.error(error);
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSendEmail = async () => {
    // 1. 공백 제거 (Trim)
    const emailToSubmit = formData.email.trim();

    if (!emailToSubmit) return alert("이메일을 입력해주세요.");
    if (emailStatus === "verified" || emailStatus === "sending") return;

    try {
      setEmailStatus("sending");

      // 2. 공백 제거된 이메일로 요청 전송
      // (주의: formData.email 대신 emailToSubmit 변수 사용)
      const response = await userService.sendEmailVerification(emailToSubmit);

      setEmailStatus("sent");
      setTimeLeft(180);
      alert(response.data || "인증번호가 발송되었습니다.");

      // (선택) 입력창에도 공백 제거된 값으로 업데이트 해주면 깔끔함
      setFormData((prev) => ({ ...prev, email: emailToSubmit }));
    } catch (error: any) {
      console.error(error);
      setEmailStatus("idle");
      const errorMsg =
        error.response?.data || "이메일 발송 중 오류가 발생했습니다.";
      alert(errorMsg);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.emailCode) return alert("인증번호를 입력해주세요.");

    try {
      // DTO 구조 생성 (백엔드 CheckEmailDto와 필드명 일치: email, token)
      const checkEmailDto = {
        email: formData.email,
        token: formData.emailCode,
      };

      const response = await userService.verifyEmailCode(checkEmailDto);

      // 성공 시 (200 OK)
      if (response.status === 200) {
        setEmailStatus("verified");
        alert(response.data || "이메일 인증이 완료되었습니다.");
      }
    } catch (error: any) {
      console.error(error);
      // 실패 시 에러 메시지
      const errorMsg = error.response?.data || "인증번호가 일치하지 않습니다.";
      alert(errorMsg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) return alert("이름을 입력해주세요.");
    if (isIdChecked !== true) return alert("아이디 중복 확인을 해주세요.");
    if (emailStatus !== "verified") return alert("이메일 인증을 완료해주세요.");
    if (formData.password !== formData.confirmPassword)
      return alert("비밀번호가 일치하지 않습니다.");
    if (!agreed) return alert("약관에 동의해 주세요.");

    try {
      // 🚨 중요: 빈 문자열("")을 null로 변환해서 전송해야 함!
      const dataToSend = {
        ...formData,
        birthDate: formData.birthDate === "" ? null : formData.birthDate,
      };

      console.log("서버로 전송될 데이터:", dataToSend);

      // 변환된 데이터(dataToSend)로 요청
      await userService.signUp(dataToSend);

      alert("회원가입이 성공적으로 완료되었습니다!");
      router.push("/sign-in");
    } catch (error: any) {
      console.error(error);

      // 에러 메시지 처리 강화
      const errData = error.response?.data;
      // 만약 백엔드가 { message: "..." } 형태로 보냈다면 message만, 아니면 전체 출력
      const errorMsg =
        errData?.message ||
        JSON.stringify(errData) ||
        "회원가입 처리에 실패했습니다.";

      alert("오류 발생: " + errorMsg);
    }
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
              <Image
                src="/images/f_logo.svg"
                alt="로고"
                width={150}
                height={40}
                className="object-fill"
              />
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

            {/* 1. 아이디 섹션 */}
            <div className="space-y-2">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label="아이디"
                    icon={<User size={18} />}
                    placeholder="ID 입력"
                    value={formData.loginId}
                    onChange={handleIdChange}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheckId}
                  disabled={isIdChecked === true}
                  className={`h-14 px-6 rounded-[1.4rem] font-bold text-sm whitespace-nowrap transition-all ${
                    isIdChecked === true
                      ? "bg-green-100 text-green-600 cursor-default"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isIdChecked === true ? "확인완료" : "중복확인"}
                </button>
              </div>
              {isIdChecked === false && (
                <p className="text-xs text-red-500 font-bold ml-4">
                  * 이미 사용 중인 아이디입니다.
                </p>
              )}
            </div>

            {/* 2. 이름 & 닉네임 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="이름"
                icon={<IdCard size={18} />}
                placeholder="실명 입력"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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

            {/* 3. 이메일 인증 섹션 */}
            <div className="space-y-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label="이메일 주소"
                    icon={<Mail size={18} />}
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    readOnly={emailStatus === "verified"}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={
                    emailStatus === "verified" || emailStatus === "sending"
                  }
                  className={`h-14 px-6 rounded-[1.4rem] font-bold text-sm whitespace-nowrap transition-all ${
                    emailStatus === "verified"
                      ? "bg-green-100 text-green-600 border border-green-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {emailStatus === "sending"
                    ? "발송중.."
                    : emailStatus === "verified"
                    ? "인증완료"
                    : emailStatus === "sent"
                    ? "재발송"
                    : "인증요청"}
                </button>
              </div>

              {(emailStatus === "sent" || emailStatus === "verified") && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <Input
                        label="인증번호"
                        icon={<ShieldCheck size={18} />}
                        placeholder="6자리 숫자"
                        value={formData.emailCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emailCode: e.target.value,
                          })
                        }
                        readOnly={emailStatus === "verified"}
                      />
                      {emailStatus === "sent" && (
                        <div className="absolute right-4 top-[50px] flex items-center gap-1 text-red-500 font-bold text-sm">
                          <Timer size={14} />
                          {formatTime(timeLeft)}
                        </div>
                      )}
                    </div>
                    {emailStatus !== "verified" && (
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        className="h-14 px-6 rounded-[1.4rem] bg-green-500 text-white font-bold text-sm whitespace-nowrap hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                      >
                        확인
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. 생년월일 & 성별 */}
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
                  {["M", "F"].map((gender) => (
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
                      {gender === "M" ? "남성" : "여성"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. 비밀번호 섹션 */}
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

            {/* 약관 및 제출 버튼 */}
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
              className={`w-full py-6 rounded-4xl shadow-2xl transition-all flex items-center justify-center gap-3 group font-black ${
                isIdChecked &&
                emailStatus === "verified" &&
                agreed &&
                formData.name
                  ? "bg-slate-900 text-white hover:bg-green-600 shadow-slate-200"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
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

      {/* 약관 모달 (기존 동일) */}
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
              <p>약관 내용...</p>
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
