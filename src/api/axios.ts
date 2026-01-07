// src/api/axios.ts

import axios from "axios";
import Cookies from "js-cookie";

<<<<<<< HEAD
 const api = axios.create({
   baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
-  withCredentials: true,
-  // ❌ 아래 줄이 있다면 반드시 지우세요! application/json 이든 multipart/form-data 든 다 지워야 합니다.
-  // headers: { "Content-Type": "multipart/form-data" },
+  withCredentials: true, // ✅ 이 설정이 있어야 브라우저가 쿠키를 자동으로 주고받습니다.
 });
 
 api.interceptors.request.use(
   (config) => {
-    const token = Cookies.get("token");
-    if (token) {
-      config.headers.Authorization = `Bearer ${token}`;
-    }
-    // ❌ 만약 인터셉터 안에서 Content-Type을 설정하는 코드가 있다면 그것도 지워주세요.
+    // ❌ 백엔드가 쿠키에서 토큰을 읽는다면, 굳이 헤더에 넣을 필요가 없으므로 삭제해도 됩니다.
+    // const token = Cookies.get("token");
+    // if (token) {
+    //   config.headers.Authorization = `Bearer ${token}`;
+    // }
     return config;
   },
   (error) => {

=======
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
>>>>>>> f1fff284662489c5164e4a4f2050d0d67fc3db7c
    return Promise.reject(error);
  }
);

export default api;
