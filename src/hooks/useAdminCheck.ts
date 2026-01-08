import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "@/utils/api";
import { userService } from "@/api/services";

interface UserData {
  userId?: number | string;
  id?: number | string;
  nickname: string;
  role: string;
  [key: string]: any;
}

const serverURL = process.env.NEXT_PUBLIC_API_URL;

export default function useAdminCheck() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfo = await userService.getUserInfo();
        const data = await fetchClient("/api/v1/user/auth");
        const response = await fetch(`${serverURL}/api/v1/admin/isAdmin`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ loginId: userInfo.data.loginId }),
        });
        const userIsAdmin = await response.json();
        if (response.ok && userIsAdmin) {
          setIsAdmin(true);
          return;
        }

        if (data) {
          setUserData(data);
          if (data.role === "ROLE_ADMIN") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setUserData(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("인증 확인 실패:", error);
        setUserData(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isAdmin, userData, loading };
}
