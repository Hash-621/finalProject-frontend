import { Megaphone, Star, Lightbulb } from "lucide-react";
import React from "react";

export const adSlides = [
  {
    id: 1,
    bg: "bg-gradient-to-br from-green-400 to-emerald-600",
    icon: React.createElement(Megaphone, { className: "w-6 h-6 text-white" }),
    title: "다잇슈 2.0 오픈!",
    desc: "더 편리해진 우리 동네 소통,\n지금 바로 시작해보세요.",
    tag: "NOTICE",
  },
  {
    id: 2,
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    icon: React.createElement(Star, {
      className: "w-6 h-6 text-yellow-300 fill-yellow-300",
    }),
    title: "이번 주 핫플레이스",
    desc: "대전 시민들이 직접 뽑은\n숨은 맛집 리스트 공개!",
    tag: "HOT",
  },
  {
    id: 3,
    bg: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    icon: React.createElement(Lightbulb, {
      className: "w-6 h-6 text-yellow-200 fill-yellow-200",
    }),
    title: "슬기로운 동네 생활",
    desc: "이웃과 더 가까워지는\n소통 꿀팁을 확인해보세요.",
    tag: "TIP",
  },
];
