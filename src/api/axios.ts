// src/api/axios.ts

import axios from "axios";
import Cookies from "js-cookie";

// src/api/axios.ts

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true, // ✅ 이 설정이 있어야 브라우저가 쿠키를 자동으로 주고받습니다.
});

api.interceptors.request.use(
  (config) => {
    // ❌ 백엔드가 쿠키에서 토큰을 읽는다면, 굳이 헤더에 넣을 필요가 없으므로 삭제해도 됩니다.
    // const token = Cookies.get("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
