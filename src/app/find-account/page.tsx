"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
// [추가] 모달 컴포넌트 임포트
import Modal from "@/components/common/Modal";

// useState: 화면 상태(입력값, 모드 등)를 관리하는 훅입니다.

// Link, useRouter: 페이지 이동을 위한 Next.js 도구들입니다.

// lucide-react: 예쁜 아이콘들을 가져옵니다.

// axios: 서버와 통신(데이터 주고받기)을 도와주는 도구입니다.

// Modal: 팝업창을 띄우기 위해 만든 커스텀 컴포넌트를 가져옵니다.

////////////////////////////////////////////////////////////////

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

// FindMode: "아이디 찾기(id)"와 "비밀번호 찾기(pw)" 두 가지 모드만 존재한다고 정의합니다.

// FindInputProps: 나중에 만들 입력창 컴포넌트가 받아야 할 재료들의 목록(타입)을 미리 정해둡니다.

/////////////////////////////////////////////////////////////////////////////////////////

export default function Page() {
  const router = useRouter();
  // 해석: Page 컴포넌트를 시작합니다. 페이지 이동을 시켜줄 router를 준비합니다.

  // 현재 모드 상태 ("id": 아이디 찾기, "pw": 비밀번호 찾기)
  const [mode, setMode] = useState<FindMode>("id");
  // 해석: 현재 화면이 "아이디 찾기"인지 "비밀번호 찾기"인지 기억하는 변수입니다. 기본값은 "id"입니다.

  // 입력 폼 데이터 상태
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    loginId: "",
  });
  // 해석: 사용자가 입력한 이름, 이메일, 아이디를 한꺼번에 묶어서 기억하는 변수입니다.

  ///////////////////////////////////////////////////////////////////////////////

  // 제출 완료 여부 (결과 화면 표시용)
  const [isSubmitted, setIsSubmitted] = useState(false);
  // 인증번호 입력값 상태
  const [code, setCode] = useState("");
  // 해석:isSubmitted: 사용자가 "확인하기" 버튼을 눌렀는지(그래서 결과 화면을 보여줘야 하는지) 기억합니다.
  //code: 사용자가 입력한 "인증번호"를 기억합니다.

  ///////////////////////////////////////////////////////////////////////

  // --- [추가] 모달 상태 관리 ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
    type: "success" as "success" | "error" | "warning" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
  });

  //해석: 모달을 띄우기 위한 모든 설정(열림 여부, 제목, 내용, 종류, 확인 버튼 동작)을 관리하는 상태 변수입니다.

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // 모달 열기 헬퍼 함수
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
  //해석: 모달을 쉽게 열기 위해 만든 함수입니다. 내용(content)과 타입(type)만 넣어주면 자동으로 모달 설정(modalConfig)을 업데이트해서 팝업을 띄웁니다.

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // 모달 닫기 함수
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };
  //해석: 모달의 닫기 버튼이나 배경을 눌렀을 때 실행될 함수입니다. isOpen만 false로 바꿔서 화면에서 안 보이게 합니다.

  ////////////////////////////////////////////////////////////////

  // 폼 제출 핸들러 (1단계: 정보 전송)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //해석: 폼 전송(버튼 클릭) 시 실행되는 함수입니다. e.preventDefault()로 새로고침을 막습니다.
    /////////////////////////////////////////////////////////////////////

    console.log(
      `${mode === "id" ? "아이디" : "비밀번호"} 찾기 요청:`,
      formData
    );

    // 1. 아이디 찾기 모드
    if (mode === "id") {
      if (formData.name.length === 0) {
        openModal("이름을 입력해주세요.", "warning");
        return;
      }
      if (formData.email.length === 0) {
        openModal("이메일을 입력해주세요.", "warning");
        return;
      }
      //해석: "아이디 찾기" 모드일 때, 이름과 이메일이 비어있으면 경고 모달을 띄우고 함수를 멈춥니다.

      /////////////////////////////////////////////////////////////////////////
      // 서버에 인증번호 발송 요청
      axios
        .post(
          `/api/v1/user/find-id/get-token?addr=${formData.email}`
        )
        .then((response) => {
          // 성공 시 별도 알림 없이 다음 단계(인증번호 입력 화면)로 진행
        })
        .catch((error) => {
          openModal(
            "인증번호 발송에 실패했습니다. 다시 시도해주세요.",
            "error"
          );
        });
    }
    //해석: 입력값이 다 있으면 서버에 "이 이메일로 인증번호 좀 보내줘"라고 요청(post)합니다. 실패하면 에러 모달을 띄웁니다.

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // 2. 비밀번호 찾기 모드
    if (mode === "pw") {
      if (formData.loginId.length === 0) {
        openModal("아이디를 입력해주세요.", "warning");
        return;
      }
      if (formData.email.length === 0) {
        openModal("이메일을 입력해주세요.", "warning");
        return;
      }
      if (formData.name.length === 0) {
        openModal("이름을 입력해주세요.", "warning");
        return;
      }

      // 서버에 비밀번호 재설정 링크 발송 요청
      axios
        .post(`/api/v1/user/getResetPw`, {
          loginId: formData.loginId,
          name: formData.name,
          email: formData.email,
        })
        .then((response) => {
          // 성공 시 다음 단계(안내 화면)로 진행
        })
        .catch((error) => {
          openModal("발송에 실패했습니다. 다시 시도해주세요.", "error");
        });
    }

    // 화면 전환 (입력 폼 -> 결과 화면)
    setIsSubmitted(true);
  };

  //해석: "비밀번호 찾기" 모드일 때도 비슷하게 검사하고 서버에 요청합니다. 마지막으로 setIsSubmitted(true)를 해서 화면을 **"결과 완료 화면"**으로 바꿉니다.

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // 인증번호 입력 핸들러 (숫자만 입력 가능)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    setCode(onlyNumbers);
  };

  //해석: 인증번호 입력칸의 내용이 바뀔 때 실행됩니다. 숫자가 아닌 글자는 모조리 지워버려서(replace), 오직 숫자만 입력되도록 강제합니다.

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // 인증번호 확인 핸들러 (아이디 찾기 최종 단계)
  const handleVerify = () => {
    if (code.length === 0) {
      openModal("인증번호를 입력해주세요.", "warning");
      return;
    }

    //해석: 인증번호 확인 버튼을 눌렀을 때 실행됩니다. 인증번호가 비어있으면 경고합니다.

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/find-id`, {
        name: formData.name,
        email: formData.email,
        token: code,
      })
      .then((response) => {
        const responseData = response.data;
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        // 해석: 서버에 "내가 입력한 인증번호가 맞니?"라고 물어봅니다.

        /////////////////////////////////////////////////////////////////////////////////////////////

        // 에러 메시지가 한글 문자열로 왔을 경우 처리
        if (
          typeof responseData === "string" &&
          koreanRegex.test(responseData)
        ) {
          console.warn(
            "응답이 한글로 왔습니다 (에러 메시지일 가능성):",
            responseData
          );
          openModal("아이디 찾기 실패: " + responseData, "error");
          return;
        }

        // 해석: 서버가 성공 데이터 대신 한글로 된 에러 메시지(예: "일치하는 정보 없음")를 문자열로 보냈을 경우를 대비해 예외 처리를 합니다.

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // 소셜 로그인 회원 처리
        if (responseData === "kakao" || responseData === "naver") {
          let serviceName = "";
          if (responseData === "naver") {
            serviceName = "네이버";
          } else if (responseData === "kakao") {
            serviceName = "카카오";
          }
          openModal(
            `소셜로 가입한 회원님은 해당 서비스에서 아이디를 확인해주세요. 가입한 소셜 : ${serviceName}`,
            "error"
          );
          return;
        }
        // 해석: 찾은 아이디가 "kakao"나 "naver"라면, 일반 로그인이 아니라 소셜 로그인이므로 해당 서비스에서 찾으라고 안내 모달을 띄웁니다.

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // [성공] 아이디 찾기 성공 시 모달 띄우고, 확인 누르면 로그인 페이지로 이동
        openModal(
          `회원님의 아이디는 [ ${responseData} ] 입니다.`,
          "success",
          "아이디 찾기 성공",
          () => router.push("/sign-in")
        );
      })
      // 해석 (성공): 진짜 아이디를 찾았으면 성공 모달을 띄워서 알려줍니다. 확인 버튼을 누르면 로그인 페이지(/sign-in)로 이동시킵니다.

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      .catch((error) => {
        openModal("인증번호 확인에 실패했습니다. 다시 시도해주세요.", "error");
      });
  };
  //-----------------------------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center p-4 md:p-8">
      {/* [추가] 모달 컴포넌트 렌더링 (평소엔 숨겨져 있음) */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />

      {/* 해석: 화면 그리기 시작입니다. 맨 위에 Modal 컴포넌트를 미리 배치해 둡니다 (평소엔 숨겨져 있음). */}

      {/*----------------------------------------------------------------------------------------------  */}

      <div className="max-w-md w-full">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-black tracking-tight">로그인</span>
        </Link>
        {/* 해석: 로그인 페이지로 돌아가는 "Back to Login" 링크를 만듭니다. */}

        {/* -------------------------------------------------------------------------------------------------------------------------------- */}
        {/* 메인 카드 박스 */}
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden relative p-8 md:p-12">
          {/* 장식용 배경 요소 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16" />

          {/* 해석: 하얀색 둥근 카드 박스를 만듭니다. 오른쪽 위에 흐릿한 초록색 빛을 넣어 예쁘게 꾸밉니다. */}
          {/* --------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}

          {!isSubmitted ? (
            // [상태 1] 입력 폼 화면
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

              {/* 해석: !isSubmitted (아직 제출 안 함) 상태라면, 입력 폼 화면을 보여줍니다. */}

              {/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}
              {/* 커스텀 탭 스위치 (아이디 / 비밀번호) */}
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

              {/* 해석: 상단의 탭 메뉴입니다. mode가 바뀔 때마다 검은색 배경(absolute div)이 좌우로 스르륵 이동하는 애니메이션 효과를 줍니다. */}

              {/* ------------------------------------------------------------------------------------------------------------ */}

              {/* 입력 폼 */}
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
                {/* 해석: mode에 따라 보여줄 입력창(FindInput)들을 다르게 배치합니다. */}

                {/* ------------------------------------------------------------------------------------------------------------------------ */}

                <button
                  type="submit"
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
            // [상태 2] 결과 완료 화면 (인증번호 입력 or 전송 완료 안내)
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
                    {" "}
                    {formData.email}{" "}
                  </span>로 <br />
                  재설정링크를 보냈습니다.
                </p>
              )}

              <Link
                href="/sign-in"
                className="block w-full bg-slate-50 text-slate-900 font-black py-5 rounded-4xl hover:bg-slate-100 transition-all mt-4"
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

// --- 서브 컴포넌트: 입력 필드 디자인 ---
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

// 페이지 진입: 깔끔한 하얀 배경에 "Find Account"라는 제목이 반깁니다. 기본적으로는 "아이디 찾기" 모드가 선택되어 있습니다.

// 모드 전환: 사용자가 "비밀번호 재설정" 탭을 누르면, 입력해야 할 항목들이 바뀝니다 (아이디 입력칸이 추가됨). 배경의 검은색 슬라이더도 부드럽게 이동합니다.

// 정보 입력:

// 아이디 찾기: 이름과 이메일을 입력합니다.

// 비밀번호 찾기: 아이디, 이름, 이메일을 입력합니다.

// 전송 버튼 클릭 (1차 시도):

// 검증: 입력칸이 비어있으면 "이름을 입력해주세요" 같은 경고 모달창이 뜹니다.

// 서버 요청: 정보가 다 있으면 서버에 "이 사람 맞나요?"라고 물어봅니다.

// 성공: 서버가 "맞습니다. 이메일로 인증번호 보냈습니다."라고 하면 화면이 "요청 완료!" 상태로 바뀝니다.

// 인증번호 입력 (아이디 찾기만 해당):

// 사용자는 이메일에서 확인한 6자리 숫자를 입력합니다.

// "인증번호 확인" 버튼을 누릅니다.

// 최종 결과:

// 성공: "회원님의 아이디는 [ user123 ] 입니다."라는 성공 모달이 뜹니다. 확인을 누르면 로그인 페이지로 이동합니다.

// 소셜 로그인: 만약 카카오나 네이버로 가입한 사람이라면 "카카오로 가입하셨네요. 거기서 찾으세요."라고 알려줍니다.
