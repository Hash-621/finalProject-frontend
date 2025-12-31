"use client";

import { useEffect, useRef, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/api/services";
import Cookies from "js-cookie";
import { AuthLoadingView } from "@/components/auth/AuthLoadingView";

function NaverCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRequestSent = useRef(false);
  const [status, setStatus] = useState("Authenticating Naver...");

  useEffect(() => {
    if (isRequestSent.current) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      isRequestSent.current = true;
      authService
        .naverLogin({ code, state })
        .then((res) => {
          const token = res.data.accessToken || res.data.token;
          if (token) {
            Cookies.set("token", token, { expires: 7, path: "/" });
            router.push("/");
          } else {
            setStatus("Token missing");
          }
        })
        .catch((err) => {
          setStatus("Login Failed");
          alert("네이버 로그인에 실패했습니다.");
          router.push("/sign-in");
        });
    }
  }, [searchParams, router]);

  return <AuthLoadingView status={status} />;
}

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingView status="Loading..." />}>
      <NaverCallbackContent />
    </Suspense>
  );
}
