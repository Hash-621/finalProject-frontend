"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/axios";
import {
  Edit3,
  MapPin,
  Heart,
  MessageSquare,
  Clock,
  Camera,
  Loader2,
} from "lucide-react";

// 백엔드 URL 설정 (이미지 표시용)
const BACKEND_URL = "http://192.168.0.101:8080";

interface ReviewPost {
  id: number;
  title: string;
  content: string;
  userNickname: string;
  createdAt: string;
  filePath: string | null;
  commentCount: number;
}

export default function TourReviewList() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/community/posts?category=TOUR_REVIEW");
        setReviews(res.data);
      } catch (err) {
        console.error("로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `${BACKEND_URL}/images/${path.split(/[/\\]/).pop()}`;
  };

  const getSnippet = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return (temp.textContent || "").substring(0, 100) + "...";
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Camera className="text-indigo-600" />
            <span>생생 방문 인증</span>
          </h1>
          <button
            onClick={() => router.push("/tour/review/write")}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2"
          >
            <Edit3 size={16} />
            인증샷 올리기
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <article
            key={review.id}
            onClick={() => router.push(`/tour/review/${review.id}`)}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-slate-100 flex flex-col h-full"
          >
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
              {review.filePath ? (
                <img
                  src={getImageUrl(review.filePath)!}
                  alt={review.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Camera size={48} />
                </div>
              )}
              <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 shadow-sm">
                VISIT REVIEW
              </span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <span className="text-indigo-500 font-bold">
                  {review.userNickname}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {review.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                {getSnippet(review.content)}
              </p>
              <div className="pt-4 border-t border-slate-50 flex justify-between text-slate-400 text-xs font-bold">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <Heart size={14} className="text-rose-400" /> 0
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} /> {review.commentCount}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> 관광지 인증
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
