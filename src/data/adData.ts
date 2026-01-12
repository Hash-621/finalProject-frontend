import { Megaphone, Star, TrendingUp } from "lucide-react";
import React from "react";

export const adSlides = [
  {
    id: 1,
    bg: "bg-gradient-to-br from-green-400 to-emerald-600",
    icon: React.createElement(Megaphone, { className: "w-6 h-6 text-white" }),
    title: "다잇슈 2.0 오픈!",
    desc: "더 편리해진 우리 동네 소통,\n지금 바로 시작해보세요.",
    tag: "NOTICE",
    link: "community/free", // 공지사항 페이지
  },
  {
    id: 2,
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    icon: React.createElement(Star, {
      className: "w-6 h-6 text-yellow-300 fill-yellow-300",
    }),
    title: "대전의 맛집들!",
    desc: "대전 시민들의 리뷰가 담긴\n숨은 맛집 리스트 공개!",
    tag: "HOT",
    link: "/restaurant", // 맛집 페이지
  },
  {
    id: 3,
    bg: "bg-gradient-to-br from-orange-500 to-rose-600",
    icon: React.createElement(TrendingUp, {
      className: "w-6 h-6 text-white",
    }),
    title: "대전 2030 미래 지도",
    desc: "내 세금, 어디에 쓰일까?\n데이터로 변화를 미리 보세요.",
    tag: "DATA",
    link: "/budget", // 아까 만든 예산 데이터 페이지로 연결
  },
];
