"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  User,
  FileText,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Home,
  ArrowRight,
  MapPin,
  UtensilsCrossed,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/userPost";
import { userService } from "@/api/services";
import Cookies from "js-cookie";

import "swiper/css";
import "swiper/css/pagination";

export default function MyPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("info");
  const [info, setInfo] = useState<any>({});
  const [tempNickname, setTempNickname] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [isInfoLoading, setIsInfoLoading] = useState(true);
  const { listData, isLoading: isListLoading, fetchPosts } = usePosts();

  const fetchUserInfo = useCallback(async () => {
    try {
      setIsInfoLoading(true);
      const res = await userService.getUserInfo();
      const data = res.data;
      setInfo(data);
      setTempNickname(data.nickname || "");
      setTempEmail(data.email || "");
    } catch (err: any) {
      if (err.response?.status === 401) {
        Cookies.remove("token");
        window.location.href = "/sign-in";
      }
    } finally {
      setIsInfoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!Cookies.get("token")) {
      window.location.href = "/sign-in";
      return;
    }
    if (activeTab === "info") {
      fetchUserInfo();
    } else {
      fetchPosts(activeTab, 1);
    }
  }, [activeTab, fetchUserInfo, fetchPosts]);

  const handleUpdateInfo = async () => {
    try {
      const updateData = { ...info, nickname: tempNickname, email: tempEmail };
      await userService.updateUserInfo(updateData);
      setInfo(updateData);
      alert("성공적으로 변경되었습니다.");
    } catch (err) {
      alert("변경에 실패했습니다.");
    }
  };

  // 🔹 글자 수 제한 함수
  const truncateText = (text: string) => {
    if (!text) return "";
    if (typeof window === "undefined") return text;

    const width = window.innerWidth;
    let limit = 40; // 기본(데스크톱)

    if (width <= 320) {
      limit = 12; // 초소형 모바일 (iPhone SE 등)
    } else if (width < 768) {
      limit = 18; // 일반 모바일
    }

    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  if (isInfoLoading && activeTab === "info") {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-slate-400 text-sm tracking-[0.2em]">
        LOADING DASHBOARD...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc] py-10 md:py-16 px-3 md:px-4 lg:px-0">
      <div className="max-w-6xl mx-auto">
        {/* 상단 헤더 */}
        <div className="mb-8 md:mb-12 px-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black mb-4 tracking-[0.2em]">
            <Settings
              size={12}
              className="animate-spin"
              style={{ animationDuration: "4s" }}
            />
            USER DASHBOARD
          </div>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl xs:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              MY{" "}
              <span className="text-green-500 italic font-serif leading-none">
                PAGE
              </span>
            </h2>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-[10px] md:text-xs transition-colors mb-2"
            >
              <LogOut size={14} /> LOGOUT
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          {/* 사이드바 영역 */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="bg-white rounded-4xl md:rounded-[2.5rem] shadow-sm border border-slate-100 p-5 md:p-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110" />
              <div className="mb-8 md:mb-10 px-2 relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-100">
                    <User className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
                  </div>
                  <Link
                    href="/"
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <Home size={18} />
                  </Link>
                </div>
                <p className="text-[11px] md:text-xs font-bold text-slate-400 mb-1">
                  반갑습니다,
                </p>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">
                  {info.nickname || "사용자"}님
                </h3>
              </div>
              <div className="space-y-1 relative">
                <TabBtn
                  id="info"
                  label="내 정보 관리"
                  icon={<User size={18} />}
                  active={activeTab}
                  onClick={setActiveTab}
                />
                <TabBtn
                  id="posts"
                  label="작성한 게시글"
                  icon={<FileText size={18} />}
                  active={activeTab}
                  onClick={setActiveTab}
                />
                <TabBtn
                  id="comments"
                  label="작성한 댓글"
                  icon={<MessageSquare size={18} />}
                  active={activeTab}
                  onClick={setActiveTab}
                />
                <TabBtn
                  id="favorites"
                  label="즐겨찾기 목록"
                  icon={
                    <Star
                      size={18}
                      className={activeTab === "favorites" ? "fill-white" : ""}
                    />
                  }
                  active={activeTab}
                  onClick={setActiveTab}
                />
              </div>
            </div>
          </div>

          {/* 메인 영역 */}
          <div className="flex-1 bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-50 p-5 md:p-14 min-h-[500px] flex flex-col relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-50/30 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <div className="relative h-full flex flex-col">
              <div className="flex justify-between items-center mb-8 md:mb-14">
                <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 md:h-10 bg-green-500 rounded-full" />
                  {activeTab === "info" ? "Settings" : "History"}
                </h2>
              </div>

              {activeTab === "info" ? (
                <div className="flex flex-col xl:flex-row items-start gap-10 xl:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="w-full xl:max-w-md space-y-6 md:space-y-10">
                    <Input label="Login ID" value={info.loginId} disabled />
                    <Input
                      label="Nickname"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                    />
                    <Input
                      label="Email Address"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                    />
                    <button
                      onClick={handleUpdateInfo}
                      className="w-full mt-6 bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-green-600 transition-all flex items-center justify-center gap-3 group"
                    >
                      저장하기{" "}
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>

                  {/* 🔹 Swiper 배너 복구 */}
                  <div className="w-full xl:w-80 flex flex-col gap-6">
                    <div className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100 border border-slate-50 relative">
                      <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        autoplay={{ delay: 4500 }}
                        pagination={{ clickable: true }}
                        className="mySwiper h-[280px] md:h-[340px]"
                      >
                        <SwiperSlide>
                          <Link
                            href="/community/recommend"
                            className="block h-full"
                          >
                            <div className="bg-green-50 h-full p-6 md:p-8 flex flex-col justify-between">
                              <div>
                                <p className="text-[10px] font-black text-green-700 uppercase mb-4 flex items-center gap-2">
                                  <MapPin size={12} /> Local Hotplace
                                </p>
                                <h4 className="text-lg md:text-xl font-black text-slate-800 leading-tight mb-2">
                                  우리 동네 <br /> 숨은 맛집{" "}
                                  <span className="text-green-600 italic">
                                    찾기!
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  이웃들이 검증한 진짜 맛집 후기.
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 self-end">
                                <UtensilsCrossed size={18} />
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                        <SwiperSlide>
                          <Link href="/news" className="block h-full">
                            <div className="bg-slate-900 h-full p-6 md:p-8 flex flex-col justify-between text-white">
                              <div>
                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Newspaper size={12} /> News
                                </p>
                                <h4 className="text-lg md:text-xl font-black leading-tight mb-2">
                                  가장 빠른 <br /> 우리 지역{" "}
                                  <span className="text-green-400 italic">
                                    뉴스
                                  </span>
                                </h4>
                                <p className="text-[11px] opacity-50">
                                  생활 정보부터 공공 소식까지.
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-green-400 self-end">
                                <Sparkles size={18} />
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                        {/* 슬라이드 3 */}
                        <SwiperSlide>
                          <Link href="/community/free" className="block h-full">
                            <div className="bg-orange-50 h-full p-6 md:p-8 flex flex-col justify-between">
                              <div>
                                <p className="text-[10px] font-black text-orange-700 uppercase mb-4 flex items-center gap-2">
                                  <Star size={12} /> Community
                                </p>
                                <h4 className="text-lg md:text-xl font-black text-slate-800 leading-tight mb-2">
                                  이웃과 함께하는 <br /> 따뜻한{" "}
                                  <span className="text-orange-500 italic">
                                    공간
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  지금 바로 소통을 시작해보세요.
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 self-end">
                                <MessageSquare size={18} />
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                      </Swiper>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                  {listData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-20 text-center">
                      <p className="font-black text-lg text-slate-400">
                        활동 내역이 없습니다.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listData.map((item: any) => {
                        const category = (
                          item.category || "free"
                        ).toLowerCase();
                        const postId = item.POST_ID || item.id;
                        const detailPath = `/community/${category}/${postId}`;
                        const rawText =
                          activeTab === "posts" ? item.title : item.content;

                        return (
                          <Link
                            key={item.id}
                            href={detailPath}
                            className="block group"
                          >
                            <div className="p-4 md:p-7 bg-slate-50/50 rounded-[1.8rem] md:rounded-[2.5rem] border border-transparent hover:border-green-200 hover:bg-white transition-all">
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-md shrink-0">
                                      {activeTab === "posts"
                                        ? "POST"
                                        : "COMMENT"}
                                    </span>
                                  </div>
                                  {/* 🔹 동적 글자수 제한 적용 */}
                                  <h3 className="text-sm md:text-xl font-black text-slate-800 group-hover:text-green-600 transition-colors">
                                    {truncateText(rawText)}
                                  </h3>
                                </div>
                                <ArrowRight
                                  size={16}
                                  className="text-slate-200 group-hover:text-green-500 shrink-0"
                                />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TabBtn = ({ id, label, icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-[1.2rem] md:rounded-3xl font-black transition-all mb-1 md:mb-2 ${
      active === id
        ? "bg-green-500 text-white shadow-lg"
        : "text-slate-400 hover:bg-slate-50"
    }`}
  >
    <span className={active === id ? "scale-110" : ""}>{icon}</span>
    <span className="text-[11px] md:text-[13px] tracking-tight">{label}</span>
  </button>
);
