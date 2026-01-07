import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "@/utils/api";

interface UserData {
  userId?: number | string;
  id?: number | string;
  nickname: string;
  role: string;
  [key: string]: any;
}

export default function useAdminCheck() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchClient("/api/v1/user/auth");

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
