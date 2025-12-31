"use client";

import { useEffect, useRef, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/api/services";
import Cookies from "js-cookie";
import { AuthLoadingView } from "@/components/auth/AuthLoadingView";

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const isRun = useRef(false);
  const [status, setStatus] = useState("Authenticating Kakao...");

  useEffect(() => {
    if (!code || isRun.current) return;
    isRun.current = true;

    authService
      .kakaoLogin(code)
      .then((res) => {
        const token = res.data.token;
        Cookies.set("token", token, { expires: 1, path: "/" });
        router.push("/");
      })
      .catch((err) => {
        setStatus("Login Failed");
        alert("카카오 로그인에 실패했습니다.");
        router.push("/sign-in");
      });
  }, [code, router]);

  return <AuthLoadingView status={status} />;
}

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingView status="Loading..." />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}
