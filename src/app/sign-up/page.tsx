// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 입력, 상태 관리, 타이머, 모달 제어 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import React, { useState, useEffect } from "react"; // 리액트 훅 (상태, 효과)
import Link from "next/link"; // 페이지 이동 컴포넌트
import { useRouter } from "next/navigation"; // 라우팅 훅
// 아이콘 라이브러리
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
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/common/Input"; // 공통 입력 컴포넌트
import Image from "next/image"; // 이미지 최적화 컴포넌트
import { authService, userService } from "@/api/services"; // API 서비스 함수들
// [추가] 모달 컴포넌트 임포트 (알림창용)
import Modal from "@/components/common/Modal";

// --- [메인 페이지 컴포넌트] ---
export default function SignUpPage() {
  const router = useRouter(); // 라우터 객체 생성

  // --- [입력 폼 상태 관리] ---
  const [formData, setFormData] = useState({
    loginId: "", // 아이디
    name: "", // 이름
    nickname: "", // 닉네임
    email: "", // 이메일
    emailCode: "", // 인증번호 입력값
    password: "", // 비밀번호
    confirmPassword: "", // 비밀번호 확인
    gender: "M", // 성별 (기본값 남성)
    birthDate: "", // 생년월일
  });

  // --- [약관 모달 상태] ---
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false); // 약관 모달 열림 여부
  const [agreed, setAgreed] = useState(false); // 약관 동의 여부

  // --- [알림 팝업용 모달 상태] ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, // 알림 모달 열림 여부
    title: "", // 제목
    content: "", // 내용
    type: "success" as "success" | "error" | "warning" | "confirm", // 타입
    onConfirm: undefined as (() => void) | undefined, // 확인 버튼 콜백
  });

  // --- [모달 헬퍼 함수] ---
  // 모달을 쉽게 띄우기 위한 함수입니다.
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
      // 제목이 없으면 타입에 따라 자동 설정
      title:
        title ||
        (type === "error" ? "오류 발생" : type === "success" ? "알림" : "확인"),
      onConfirm,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // --- [검증 상태값들] ---
  const [isIdChecked, setIsIdChecked] = useState<boolean | null>(null); // 아이디 중복 확인 여부 (true: 사용 가능)
  // 이메일 인증 상태 (idle: 대기, sending: 전송중, sent: 전송됨, verified: 인증됨)
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "verified"
  >("idle");
  const [timeLeft, setTimeLeft] = useState(180); // 타이머 시간 (3분 = 180초)

  // --- [타이머 로직 (useEffect)] ---
  // 이메일이 발송된 상태(sent)이고 시간이 남아있으면 1초마다 줄어듭니다.
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailStatus === "sent" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 타이머 해제
  }, [emailStatus, timeLeft]);

  // 초 단위를 "분:초" 형식으로 변환하는 함수
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? `0${sec}` : sec}`;
  };

  // --- [핸들러 함수들] ---

  // 아이디 입력 변경 시 (중복 확인 상태 초기화)
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, loginId: e.target.value });
    setIsIdChecked(null); // 아이디를 고치면 다시 중복 확인을 받아야 함
  };

  // 아이디 중복 확인 요청
  const handleCheckId = async () => {
    if (!formData.loginId) {
      openModal("아이디를 입력해주세요.", "warning");
      return;
    }

    try {
      const response = await authService.checkIdDuplicate(formData.loginId);
      const isAvailable = response.data; // 백엔드에서 true/false 반환 가정

      setIsIdChecked(isAvailable);

      if (isAvailable) {
        openModal("사용 가능한 아이디입니다.", "success");
      } else {
        openModal("이미 사용 중인 아이디입니다.", "error");
      }
    } catch (error) {
      console.error(error);
      openModal("중복 확인 중 오류가 발생했습니다.", "error");
    }
  };

  // 이메일 인증번호 발송 요청
  const handleSendEmail = async () => {
    const emailToSubmit = formData.email.trim();

    if (!emailToSubmit) {
      openModal("이메일을 입력해주세요.", "warning");
      return;
    }
    // 이미 인증됐거나 전송 중이면 무시
    if (emailStatus === "verified" || emailStatus === "sending") return;

    try {
      setEmailStatus("sending"); // 전송 중 상태로 변경

      const response = await authService.sendEmailVerification(emailToSubmit);

      setEmailStatus("sent"); // 전송 완료 상태로 변경
      setTimeLeft(180); // 타이머 리셋
      openModal(response.data || "인증번호가 발송되었습니다.", "success");

      setFormData((prev) => ({ ...prev, email: emailToSubmit }));
    } catch (error: any) {
      console.error(error);
      setEmailStatus("idle"); // 실패 시 대기 상태로 복귀
      const errorMsg =
        error.response?.data || "이메일 발송 중 오류가 발생했습니다.";
      openModal(errorMsg, "error");
    }
  };

  // 인증번호 확인 요청
  const handleVerifyCode = async () => {
    if (!formData.emailCode) {
      openModal("인증번호를 입력해주세요.", "warning");
      return;
    }

    try {
      const checkEmailDto = {
        email: formData.email,
        token: formData.emailCode,
      };

      const response = await authService.verifyEmailCode(checkEmailDto);

      if (response.status === 200) {
        setEmailStatus("verified"); // 인증 완료 상태로 변경
        openModal(response.data || "이메일 인증이 완료되었습니다.", "success");
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data || "인증번호가 일치하지 않습니다.";
      openModal(errorMsg, "error");
    }
  };

  // 최종 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최종 유효성 검사
    if (!formData.name) return openModal("이름을 입력해주세요.", "warning");
    if (isIdChecked !== true)
      return openModal("아이디 중복 확인을 해주세요.", "warning");
    if (emailStatus !== "verified")
      return openModal("이메일 인증을 완료해주세요.", "warning");
    if (formData.password !== formData.confirmPassword)
      return openModal("비밀번호가 일치하지 않습니다.", "error");
    if (!agreed) return openModal("약관에 동의해 주세요.", "warning");

    try {
      // 서버로 보낼 데이터 정리 (생년월일이 비어있으면 null로 처리)
      const dataToSend = {
        ...formData,
        birthDate: formData.birthDate === "" ? null : formData.birthDate,
      };

      console.log("서버로 전송될 데이터:", dataToSend);

      // 회원가입 요청
      await authService.signUp(dataToSend);

      // 성공 시 모달 -> 확인 버튼 누르면 로그인 페이지 이동
      openModal(
        "회원가입이 성공적으로 완료되었습니다.\n로그인 페이지로 이동합니다.",
        "success",
        "가입 완료",
        () => router.push("/sign-in")
      );
    } catch (error: any) {
      console.error(error);
      const errData = error.response?.data;
      const errorMsg =
        errData?.message ||
        JSON.stringify(errData) ||
        "회원가입 처리에 실패했습니다.";

      openModal("오류 발생: " + errorMsg, "error");
    }
  };

  // --- [화면 렌더링] ---
  return (
    <div className="min-h-screen bg-[#fcfdfc] flex flex-col lg:items-center justify-center p-4 md:p-12">
      <Link
        href="/"
        className="inline-flex lg:hidden items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm font-black tracking-tight">HOME</span>
      </Link>
      {/* 1. 알림 팝업 모달 컴포넌트 */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden min-h-[850px]">
        {/* 2. 왼쪽 브랜드 섹션 (PC용) */}
        <div className="hidden lg:col-span-5 lg:flex flex-col justify-between p-12 md:p-16 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-green-500 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32" />
          <div className="relative z-10">
            <Link
              href="/"
              className="flex items-center transition hover:opacity-80 m-0 sm:mb-20"
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
            <div className="space-y-10 ">
              {/* 단계 표시용 아이템 */}
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

        {/* 3. 오른쪽 입력 폼 섹션 */}
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

            {/* (1) 아이디 입력 및 중복 확인 */}
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
                  className={`h-12 sm:h-14 px-6 rounded-[1.4rem] font-bold text-sm whitespace-nowrap transition-all ${
                    isIdChecked === true
                      ? "bg-green-100 text-green-600 cursor-default"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isIdChecked === true ? "확인완료" : "중복확인"}
                </button>
              </div>
              {/* 중복일 경우 빨간 에러 메시지 */}
              {isIdChecked === false && (
                <p className="text-xs text-red-500 font-bold ml-4">
                  * 이미 사용 중인 아이디입니다.
                </p>
              )}
            </div>

            {/* (2) 이름 & 닉네임 입력 (2열 그리드) */}
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

            {/* (3) 이메일 인증 섹션 */}
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
                    readOnly={emailStatus === "verified"} // 인증 완료 시 수정 불가
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={
                    emailStatus === "verified" || emailStatus === "sending"
                  }
                  className={`h-12 sm:h-14 px-6 rounded-[1.4rem] font-bold text-sm whitespace-nowrap transition-all ${
                    emailStatus === "verified"
                      ? "bg-green-100 text-green-600 border border-green-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {/* 상태에 따라 버튼 텍스트 변경 */}
                  {emailStatus === "sending"
                    ? "발송중.."
                    : emailStatus === "verified"
                    ? "인증완료"
                    : emailStatus === "sent"
                    ? "재발송"
                    : "인증요청"}
                </button>
              </div>

              {/* 인증번호 입력란 (이메일 발송 후 나타남) */}
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
                      {/* 타이머 표시 */}
                      {emailStatus === "sent" && (
                        <div className="absolute right-4 top-[50px] flex items-center gap-1 text-red-500 font-bold text-sm">
                          <Timer size={14} />
                          {formatTime(timeLeft)}
                        </div>
                      )}
                    </div>
                    {/* 인증 확인 버튼 */}
                    {emailStatus !== "verified" && (
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        className="h-12 sm:h-14 px-6 rounded-[1.4rem] bg-green-500 text-white font-bold text-sm whitespace-nowrap hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                      >
                        확인
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* (4) 생년월일 & 성별 */}
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
                <div className="flex gap-2 h-12 sm:h-14">
                  {["M", "F"].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender })}
                      className={`flex-1 rounded-[1.8rem] font-black text-sm transition-all border ${
                        formData.gender === gender
                          ? "bg-slate-900 text-white border-slate-900" // 선택된 성별
                          : "bg-slate-50/50 text-slate-400 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      {gender === "M" ? "남성" : "여성"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* (5) 비밀번호 입력 */}
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

            {/* (6) 약관 동의 및 제출 버튼 */}
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
                onClick={() => setIsTermsModalOpen(true)} // 약관 상세 모달 열기
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
                  ? "bg-slate-900 text-white hover:bg-green-600 shadow-slate-200" // 모든 조건 만족 시 활성화
                  : "bg-slate-200 text-slate-400 cursor-not-allowed" // 조건 불충족 시 비활성화 스타일
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

      {/* 4. 약관 상세 모달 */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
              <h4 className="text-xl font-black text-slate-800">
                서비스 이용약관
              </h4>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 약관 내용 영역 */}
            <div className="p-8 overflow-y-auto max-h-[400px] text-sm text-slate-500 leading-relaxed custom-scrollbar">
              <div className="space-y-6">
                <h5 className="text-base font-bold text-slate-800 text-center pb-2 border-b border-slate-100">
                  다잇슈대전 서비스 이용약관 (안)
                </h5>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제1조 (목적)
                  </h6>
                  <p>
                    이 약관은 다잇슈(이하 &quot;회사&quot;라 함)가 운영하는
                    다잇슈대전(이하 &quot;서비스&quot;라 함)에서 제공하는 인터넷
                    관련 서비스의 이용조건 및 절차, 회사와 회원의 권리, 의무 및
                    책임사항을 규정함을 목적으로 합니다.
                  </p>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제2조 (용어의 정의)
                  </h6>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      &quot;서비스&quot;라 함은 구현되는 단말기(PC, 휴대형
                      단말기 등 각종 유무선 장치를 포함)와 상관없이
                      &quot;회원&quot;이 이용할 수 있는 다잇슈대전 관련 제반
                      서비스를 의미합니다.
                    </li>
                    <li>
                      &quot;회원&quot;이라 함은 &quot;서비스&quot;에 접속하여 이
                      약관에 따라 &quot;회사&quot;와 이용계약을 체결하고
                      &quot;회사&quot;가 제공하는 &quot;서비스&quot;를 이용하는
                      고객을 말합니다.
                    </li>
                    <li>
                      &quot;아이디(ID)&quot;라 함은 &quot;회원&quot;의 식별과
                      &quot;서비스&quot; 이용을 위하여 &quot;회원&quot;이 정하고
                      &quot;회사&quot;가 승인하는 문자와 숫자의 조합을
                      의미합니다.
                    </li>
                  </ol>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제3조 (약관의 게시와 개정)
                  </h6>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      &quot;회사&quot;는 이 약관의 내용을 &quot;회원&quot;이
                      쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
                    </li>
                    <li>
                      &quot;회사&quot;는 「약관의 규제에 관한 법률」,
                      「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등
                      관련법을 위배하지 않는 범위에서 이 약관을 개정할 수
                      있습니다.
                    </li>
                  </ol>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제4조 (서비스의 제공 및 변경)
                  </h6>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      &quot;회사&quot;는 다음과 같은 업무를 수행합니다.
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-400">
                        <li>대전 지역 기반 정보 제공 (맛집, 축제, 병원 등)</li>
                        <li>지역 내 구인구직 정보 제공</li>
                        <li>
                          커뮤니티 서비스 및 기타 &quot;회사&quot;가 정하는 업무
                        </li>
                      </ul>
                    </li>
                    <li>
                      &quot;회사&quot;는 기술적 사양의 변경 등의 사유로 장차
                      체결되는 계약에 의해 제공할 재화 또는 용역의 내용을 변경할
                      수 있습니다.
                    </li>
                  </ol>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제5조 (서비스의 중단)
                  </h6>
                  <p>
                    &quot;회사&quot;는 컴퓨터 등 정보통신설비의 보수점검, 교체
                    및 고장, 통신두절 등의 사유가 발생한 경우에는
                    &quot;서비스&quot;의 제공을 일시적으로 중단할 수 있습니다.
                  </p>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제6조 (회원가입)
                  </h6>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      이용자는 &quot;회사&quot;가 정한 가입 양식에 따라
                      회원정보를 기입한 후 이 약관에 동의한다는 의사표시를
                      함으로서 회원가입을 신청합니다.
                    </li>
                    <li>
                      &quot;회사&quot;는 제1항과 같이 회원으로 가입할 것을
                      신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로
                      등록합니다.
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-400">
                        <li>
                          가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한
                          적이 있는 경우
                        </li>
                        <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제7조 (회원의 의무)
                  </h6>
                  <p className="mb-1">
                    &quot;회원&quot;는 다음 행위를 하여서는 안 됩니다.
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>신청 또는 변경 시 허위 내용의 등록</li>
                    <li>타인의 정보 도용</li>
                    <li>&quot;회사&quot;가 게시한 정보의 변경</li>
                    <li>
                      &quot;회사&quot; 및 기타 제3자의 저작권 등 지적재산권에
                      대한 침해
                    </li>
                    <li>
                      &quot;회사&quot; 및 기타 제3자의 명예를 손상시키거나
                      업무를 방해하는 행위
                    </li>
                  </ol>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제8조 (저작권의 귀속 및 이용제한)
                  </h6>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      &quot;회사&quot;가 작성한 저작물에 대한 저작권 및 기타
                      지적재산권은 &quot;회사&quot;에 귀속합니다.
                    </li>
                    <li>
                      &quot;회원&quot;이 &quot;서비스&quot; 내에 게시한 게시물의
                      저작권은 해당 게시물의 저작자에게 귀속됩니다.
                    </li>
                  </ol>
                </section>

                <section>
                  <h6 className="font-bold text-slate-700 mb-1">
                    제9조 (면책조항)
                  </h6>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      &quot;회사&quot;는 천재지변 또는 이에 준하는 불가항력으로
                      인하여 &quot;서비스&quot;를 제공할 수 없는 경우에는
                      &quot;서비스&quot; 제공에 관한 책임이 면제됩니다.
                    </li>
                    <li>
                      &quot;회사&quot;는 &quot;회원&quot;의 귀책사유로 인한
                      &quot;서비스&quot; 이용의 장애에 대하여는 책임을 지지
                      않습니다.
                    </li>
                  </ol>
                </section>

                <section className="pt-4 border-t border-slate-100">
                  <h6 className="font-bold text-slate-700 mb-1">부칙</h6>
                  <p>이 약관은 2025년 12월 30일부터 시행합니다.</p>
                </section>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="p-8 bg-slate-50 flex gap-4">
              <button
                onClick={() => {
                  setAgreed(true); // 동의 처리
                  setIsTermsModalOpen(false);
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

// --- [서브 컴포넌트: 단계 표시] ---
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

// 페이지 진입 및 아이디 입력 (Step 1):

// 사용자가 페이지에 들어와 아이디를 입력하고 [중복확인] 버튼을 누릅니다.

// handleCheckId가 실행되어 서버에 확인 요청을 보냅니다.

// "사용 가능한 아이디입니다" 모달이 뜨고, isIdChecked가 true가 됩니다. 버튼은 녹색으로 변해 완료됨을 알립니다.

// 이메일 인증 (Step 2):

// 이메일을 입력하고 [인증요청] 버튼을 누릅니다.

// handleSendEmail이 실행되어 인증 메일을 발송하고, **타이머(3분)**가 돌아가기 시작합니다. 화면엔 인증번호 입력칸이 나타납니다.

// 사용자가 메일함에서 번호를 확인해 입력하고 [확인] 버튼을 누릅니다.

// handleVerifyCode가 실행되어 번호가 맞는지 검증합니다. 맞으면 "인증 완료" 상태가 됩니다.

// 정보 입력 및 약관 동의 (Step 3):

// 이름, 닉네임, 생년월일, 비밀번호 등을 입력합니다.

// **[약관보기]**를 눌러 모달을 띄우고 내용을 확인한 뒤 **[동의하고 닫기]**를 누릅니다. 체크박스가 체크됩니다.

// 최종 제출 (Step 4):

// 모든 필수 항목이 채워지면 하단 [가입 완료하고 시작하기] 버튼이 활성화됩니다. (검은색으로 변함)

// 버튼을 누르면 handleSubmit이 실행되어 최종 데이터를 서버로 보냅니다.

// 성공 시 "가입 완료" 모달이 뜨고, 확인을 누르면 로그인 페이지로 이동합니다.
