// 1. [Imports] React의 핵심 기능들을 가져옵니다.
// useEffect: 페이지가 로드될 때 검사를 시작하기 위해 필요합니다.
// useState: 관리자 여부, 유저 정보, 로딩 상태를 저장하기 위해 필요합니다.
import { useEffect, useState } from "react";

// 2. [Import] Next.js의 라우터(페이지 이동 도구)를 가져옵니다.
// (현재 코드 내에서는 직접 쓰이진 않지만, 검사 후 리다이렉트 등을 위해 습관적으로 가져오는 경우가 많습니다.)
import { useRouter } from "next/navigation";

// 3. [Import] API 통신을 도와주는 유틸리티 함수들을 가져옵니다.
// fetchClient: 일반적인 API 요청을 쉽게 보내는 함수
// userService: 유저 관련 정보(내 정보 등)를 가져오는 함수 모음
import { fetchClient } from "@/utils/api";
import { userService } from "@/api/services";

// 4. [Interface Definition] 유저 데이터가 어떻게 생겼는지 '모양(Type)'을 정의합니다.
// TypeScript에게 "유저 데이터는 이렇게 생겼어"라고 알려주는 설명서입니다.
interface UserData {
  userId?: number | string; // 유저 고유 번호 (숫자일 수도 문자일 수도 있음, 있을 수도 없을 수도 있음 ?)
  id?: number | string; // id라는 이름으로 올 수도 있어서 추가
  nickname: string; // 닉네임 (필수)
  role: string; // 역할 (예: "ROLE_USER", "ROLE_ADMIN") - 가장 중요!
  [key: string]: any; // 그 외에 이메일, 주소 등 뭐가 더 들어올지 모르니 유연하게 허용함
}

// 5. [Config] 백엔드 서버 주소를 환경 변수에서 가져옵니다.
// 보안상 코드에 주소를 직접 적지 않고 .env 파일에서 불러옵니다.
const serverURL = process.env.NEXT_PUBLIC_API_URL;

// ==================================================================
// [Main Hook] 관리자 권한 체크 훅 정의 시작
// ==================================================================
export default function useAdminCheck() {
  // 6. 라우터 객체 생성 (페이지 이동이 필요할 때 사용)
  const router = useRouter();

  // --- [State] 상태 관리 변수들 ---
  // 7. 유저 정보를 저장할 공간 (아직 확인 안 됐으니 초기값 null)
  const [userData, setUserData] = useState<UserData | null>(null);

  // 8. 관리자인지 아닌지 저장 (기본값 false: 일단은 관리자 아니라고 가정하고 의심함)
  const [isAdmin, setIsAdmin] = useState(false);

  // 9. 검사가 진행 중인지 확인 (기본값 true: 페이지 열리자마자 검사 시작하니까)
  const [loading, setLoading] = useState(true);

  // --- [Effect] 페이지 로드 시 검사 로직 실행 ---
  useEffect(() => {
    // 10. [Async Function] 비동기 검사 함수 정의
    const checkAuth = async () => {
      try {
        // 11. [Step 1] 현재 로그인한 유저의 정보를 가져옵니다. (아이디를 알기 위해)
        const userInfo = await userService.getUserInfo();

        // 12. [Step 2] 유저의 인증 상태나 역할을 포함한 상세 데이터를 가져옵니다.
        const data = await fetchClient("/api/v1/user/auth");

        // 13. [Step 3] ★ 핵심 로직: 서버에 "이 사람 진짜 관리자예요?"라고 물어보는 API 호출
        // fetch를 사용하여 직접 POST 요청을 보냅니다.
        const response = await fetch("/api/v1/admin/isAdmin", {
          method: "post", // 데이터를 보내서 확인받으므로 POST 방식 사용
          headers: {
            "Content-Type": "application/json", // "나 JSON 데이터 보낼게"라고 알림
          },
          // 내 아이디(loginId)를 담아서 보냅니다.
          body: JSON.stringify({ loginId: userInfo.data.loginId }),
        });

        // 14. 서버의 대답(true/false)을 JSON으로 해석합니다.
        const userIsAdmin = await response.json();

        // 15. [Decision 1] 서버 요청이 성공했고(ok), 결과가 true(관리자 맞음)라면?
        if (response.ok && userIsAdmin) {
          setIsAdmin(true); // "너 관리자 합격!"
          return; // 여기서 함수를 끝냅니다. (더 이상 볼 필요 없음)
        }

        // 16. [Decision 2] 위에서 바로 판별이 안 났을 경우, 가져온 상세 데이터(data)로 2차 확인
        if (data) {
          setUserData(data); // 유저 정보를 상태에 저장해둡니다 (화면에 닉네임 띄우기 용도 등)

          // 역할(role)이 "ROLE_ADMIN"이라고 적혀 있는지 확인합니다.
          if (data.role === "ROLE_ADMIN") {
            setIsAdmin(true); // "너도 관리자 맞네"
          } else {
            setIsAdmin(false); // "어 넌 그냥 유저네"
          }
        } else {
          // 17. 데이터가 아예 없으면 (로그인 안 된 상태 등)
          setUserData(null);
          setIsAdmin(false); // 관리자 아님
        }
      } catch (error) {
        // 18. [Error Handling] 통신 중 에러가 발생하면 (인터넷 끊김, 서버 다운 등)
        console.error("인증 확인 실패:", error); // 개발자 보라고 콘솔에 에러 출력
        setUserData(null); // 정보 초기화
        setIsAdmin(false); // 안전하게 관리자 권한 박탈
      } finally {
        // 19. [Loading End] 성공했든 실패했든 검사는 끝났습니다.
        // 로딩 상태를 false로 바꿔서 화면의 스피너를 없애고 결과를 보여줍니다.
        setLoading(false);
      }
    };

    // 20. [Execute] 위에서 만든 검사 함수를 실행합니다.
    checkAuth();
  }, [router]); // 라우터 정보가 바뀌면(페이지 이동 등) 다시 실행될 수 있게 의존성 배열에 추가

  // 21. [Return] 컴포넌트에게 검사 결과를 보고합니다.
  // isAdmin: 관리자니? / userData: 누구니? / loading: 아직 검사 중이니?
  return { isAdmin, userData, loading };
}

// 검문 검색 시작 (Mount):

// 관리자 페이지에 진입하자마자 이 훅이 실행됩니다.

// "일단 멈춰! 확인 중이야." (loading: true) 깃발을 듭니다. 보통 이때 화면엔 로딩 스피너가 돕니다.

// 신원 조회 (API Request):

// 1단계: "너 누구야?" (getUserInfo) -> 로그인한 유저의 아이디를 알아냅니다.

// 2단계: "이 아이디, 관리자 맞아?" (/admin/isAdmin) -> 서버에 직접 물어봅니다.

// 판결 (Decision):

// 서버: "어, 걔 관리자 맞아." -> isAdmin을 true로 설정합니다.

// 서버: "아니, 일반 유저인데?" -> isAdmin을 false로 설정합니다.

// 검문 종료 (Finally):

// 결과가 어떻든 확인 작업은 끝났으므로 "로딩 끝!" (loading: false) 깃발을 내립니다.

// 컴포넌트는 이 결과(isAdmin)를 보고 페이지를 보여줄지, 아니면 "접근 권한이 없습니다"라며 쫓아낼지 결정합니다.
