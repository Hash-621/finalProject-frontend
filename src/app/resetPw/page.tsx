"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import router from "next/router";

export default function resetPwPage() {
  const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL;
  const [isVerified, setIsVerified] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      alert("잘못된 접근입니다.");
      router.replace("/"); // 뒤로가기 방지를 위해 replace 사용 권장
      return;
    }
    const pageLoad = async () => {
      try {
        const response = await axios.get(
          `${proxyUrl}${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/resetPw?token=${token}&email=${email}`
        );
        console.log("비밀번호 재설정 요청 성공:", response.data);
        setIsVerified(true);
      } catch (error: any) {
        console.error("토큰 검증 실패:", error);

        // 404: 토큰이 없거나 만료됨 (백엔드 응답 코드에 맞춰 수정 가능)
        if (error.response && error.response.status === 404) {
          alert("유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.");
        } else {
          alert("서버 통신 중 오류가 발생했습니다.");
        }

        // 실패 시 로그인 페이지나 홈으로 강제 이동
        router.replace("/sign-in");
      }
    };
    pageLoad();
  }, []);

  const [password, setPassword] = useState("");
  const resetPw = async () => {
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post(
        `${proxyUrl}${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/resetPw`,
        {
          email: email,
          password: password,
        }
      );
      console.log("비밀번호 재설정 성공:", response.data);
      alert("비밀번호가 성공적으로 재설정되었습니다.");
    } catch (error) {
      console.error("비밀번호 재설정 실패:", error);
      alert("비밀번호 재설정에 실패했습니다. 다시 시도해주세요.");
    }
  };
  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500">유효성 검사 중입니다...</p>
      </div>
    );
  }
  return (
    <div>
      <input
        type="password"
        id="newPw"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-300 p-2 rounded"
      />
      <button
        onClick={resetPw}
        className="ml-2 bg-blue-500 text-white p-2 rounded"
      >
        비밀번호 재설정
      </button>
    </div>
  );
}
