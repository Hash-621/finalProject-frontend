// 1. 환경 변수에서 공통 기본 주소를 가져옵니다. (.env.local 파일)
// 예: http://localhost:8080/api/v1/admin
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchClient = async (path: string, options?: RequestInit) => {
  // 기본 주소 뒤에 path를 붙여서 전체 URL 완성
  const url = `${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json", // 기본적으로 JSON 통신
      ...options?.headers,
    },
    // ★ [핵심] 이 옵션이 있어야 "HttpOnly 쿠키(JWT)"가 백엔드로 날아갑니다.
    credentials: "include",
  });

  // 401(비로그인), 403(권한없음) 처리
  if (response.status === 401 || response.status === 403) {
    // 필요하다면 여기서 로그인 페이지로 리다이렉트 로직 추가 가능
    // window.location.href = '/login';
    return null;
  }

  // 에러 처리
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  // 응답 바디가 비어있는 경우를 대비한 안전한 파싱
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
