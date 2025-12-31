"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, X, Loader2 } from "lucide-react";
import api from "@/api/axios";
import Cookies from "js-cookie";

export default function TourReviewWritePage() {
  const router = useRouter();

  // 상태 관리
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<{
    userId: string;
    nickname: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("token");
      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        router.push("/sign-in");
        return;
      }

      try {
        const res = await api.get("/mypage/info");
        const fetchedId = res.data.userId || res.data.id || res.data.loginId;
        const fetchedNickname = res.data.userNickname || res.data.nickname;

        if (fetchedId) {
          setUserData({
            userId: fetchedId,
            nickname: fetchedNickname || "익명",
          });
        }
      } catch (err) {
        console.error("유저 정보 로드 실패:", err);
      }
    };

    fetchUserInfo();
  }, [router]);

  // 2. 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = images.length + newFiles.length;

    if (totalImages > 5) {
      alert("이미지는 최대 5장까지 업로드 가능합니다.");
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  // 3. 이미지 삭제 핸들러
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ▼▼▼▼▼ [수정된 부분] handleSubmit ▼▼▼▼▼
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!userData?.userId) {
      alert("유저 정보를 확인 중입니다. 잠시만 기다려주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. DTO 생성
      const payload = {
        userId: userData.userId,
        userNickname: userData.nickname,
        title: title,
        content: content,
        category: "TOUR_REVIEW", // 리뷰 카테고리
        viewCount: 0,
        commentCount: 0,
      };

      const formData = new FormData();

      // 2. [핵심 1] JSON 데이터 키 이름을 'data'로 설정 (서버 로그: Required part 'data'...)
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("data", jsonBlob);

      // 3. [핵심 2] 파일 추가 (키 이름: 'file')
      // 현재 백엔드 savePost는 단일 파일(MultipartFile file)을 받는 것으로 보입니다.
      // 여러 장을 올리더라도, 백엔드 호환성을 위해 우선 첫 번째 파일만 'file' 키로 보냅니다.
      // (백엔드에서 List<MultipartFile>을 받도록 수정되었다면 forEach로 append 해도 됨)
      if (images.length > 0) {
        formData.append("file", images[0]);
      }

      console.log("🚀 리뷰 등록 요청 시작...");

      // 4. [핵심 3] 엔드포인트를 '/community/posts' (복수형)으로 설정
      // (서버 로그: /post 는 404 Not Found 였음)
      await api.post("/community/posts", formData);

      alert("리뷰가 성공적으로 등록되었습니다!");
      router.back();
    } catch (error: any) {
      console.error("리뷰 등록 실패:", error);
      const msg = error.response?.data?.message || "서버 오류가 발생했습니다.";
      alert(`등록 실패: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // ▲▲▲▲▲ [수정 완료] ▲▲▲▲▲

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">여행 리뷰 작성</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="리뷰 제목을 입력해주세요"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="여행은 어떠셨나요? 솔직한 후기를 들려주세요."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all h-48 resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                사진 첨부{" "}
                <span className="text-slate-400 font-normal">
                  (현재 1장만 등록됩니다)
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-green-500 hover:text-green-500 transition-all"
                  disabled={isSubmitting}
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">추가</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />

                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100"
                  >
                    <img
                      src={url}
                      alt={`preview-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  등록 중...
                </>
              ) : (
                "리뷰 등록하기"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
