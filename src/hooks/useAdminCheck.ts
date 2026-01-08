import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "@/utils/api";
import { userService } from "@/api/services";

const serverURL = process.env.NEXT_PUBLIC_API_URL;

export default function useAdminCheck() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. 백엔드에 "나 누구야?" 요청 (쿠키는 fetchClient가 알아서 보냄)
        const userInfo = await userService.getUserInfo();
        console.log("userInfo:", userInfo.data.loginId);
        const userData = await fetchClient("/api/v1/user/auth");
        const response = await fetch(`${serverURL}/api/v1/admin/isAdmin`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ loginId: userInfo.data.loginId }),
        });
        const userIsAdmin = await response.json();

        // 2. 권한 확인
        if (response.ok && userIsAdmin) {
          setIsAdmin(true);
          return;
        }
        if (userData && userData.role === "ROLE_ADMIN") {
          setIsAdmin(true);
        } else {
          alert("관리자 권한이 없습니다.");
          router.replace("/"); // 메인으로 쫓아냄
        }
      } catch (error) {
        console.error("인증 실패:", error);
        router.replace("/sign-in"); // 로그인 페이지로 보냄
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isAdmin, loading };
}
