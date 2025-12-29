import axios from "axios";
import Cookies from "js-cookie"; // 쿠키 관리를 위한 라이브러리 추가

const api = axios.create({
  // 백엔드 주소
  baseURL: "http://192.168.0.101:8080/api/v1",
  // 쿠키/세션 공유를 위해 필수 (백엔드와 쿠키를 주고받을 때 필요)
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- 인터셉터 로직: 요청 시마다 쿠키에서 토큰을 꺼내 헤더에 담음 ---
api.interceptors.request.use(
  (config) => {
    // 1. 쿠키에서 'token'이라는 이름의 값을 가져옵니다.
    const token = Cookies.get("token");

    // 2. 토큰이 존재하면 Authorization 헤더에 담습니다.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// --------------------------------------------------------

export default api;
