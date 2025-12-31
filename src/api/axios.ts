// src/api/axios.ts

import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true,
  // ❌ 아래 줄이 있다면 반드시 지우세요! application/json 이든 multipart/form-data 든 다 지워야 합니다.
  // headers: { "Content-Type": "multipart/form-data" },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ❌ 만약 인터셉터 안에서 Content-Type을 설정하는 코드가 있다면 그것도 지워주세요.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
