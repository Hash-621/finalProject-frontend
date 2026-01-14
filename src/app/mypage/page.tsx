// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (사용자 인터랙션, 상태 관리, 훅 사용 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import React, { useEffect, useState, useCallback, useMemo } from "react"; // 리액트 기본 훅 (useMemo 추가)
import Link from "next/link"; // 페이지 이동 컴포넌트
// 각종 아이콘 임포트
import {
  User, // 유저 아이콘
  FileText, // 문서(게시글) 아이콘
  MessageSquare, // 댓글 아이콘
  Star, // 즐겨찾기(별) 아이콘
  Settings, // 설정(톱니바퀴) 아이콘
  LogOut, // 로그아웃 아이콘
  Home, // 홈 아이콘
  ArrowRight, // 화살표 아이콘
  MapPin, // 지도 핀 아이콘
  UtensilsCrossed, // 포크/나이프(식당) 아이콘
  Newspaper, // 신문(뉴스) 아이콘
  Sparkles,
  Clock, // 반짝임 아이콘
} from "lucide-react";
// Swiper(슬라이더) 관련 임포트
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Input } from "@/components/common/Input"; // 공통 인풋 컴포넌트
import { useAuth } from "@/hooks/useAuth"; // 인증(로그인/로그아웃) 관련 훅
import { usePosts } from "@/hooks/userPost"; // 유저 게시글/댓글 데이터 훅
import { userService } from "@/api/services"; // 유저 정보 API 서비스
import Cookies from "js-cookie"; // 쿠키 관리 라이브러리

// Swiper 스타일 시트
import "swiper/css";
import "swiper/css/pagination";

// --- [메인 컴포넌트 시작] ---
export default function MyPage() {
  const { logout } = useAuth(); // 로그아웃 함수 가져오기

  // --- [상태 관리 (State)] ---
  const [activeTab, setActiveTab] = useState<string>("info"); // 현재 활성화된 탭 (기본값: 'info')
  const [info, setInfo] = useState<any>({}); // 유저 정보 원본 데이터
  const [tempNickname, setTempNickname] = useState(""); // 닉네임 수정용 임시 상태
  const [tempEmail, setTempEmail] = useState(""); // 이메일 수정용 임시 상태
  const [isInfoLoading, setIsInfoLoading] = useState(true); // 정보 로딩 상태

  // 🔥 [추가됨] 즐겨찾기 탭 전용 필터 상태 (ALL, RESTOURANTS, HOSPITALS, TOURS)
  const [favoriteFilter, setFavoriteFilter] = useState("ALL");

  // 게시글/댓글/즐겨찾기 목록 데이터 가져오기 (커스텀 훅 사용)
  const { listData, isLoading: isListLoading, fetchPosts } = usePosts();

  // --- [유저 정보 가져오는 함수 (useCallback으로 메모이제이션)] ---
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsInfoLoading(true); // 로딩 시작
      const res = await userService.getUserInfo(); // 서버에 내 정보 요청
      const data = res.data;
      setInfo(data); // 원본 데이터 저장
      setTempNickname(data.nickname || ""); // 수정 폼에 닉네임 채우기
      setTempEmail(data.email || ""); // 수정 폼에 이메일 채우기
    } catch (err: any) {
      // 401 에러(인증 실패) 시 로그아웃 처리 후 로그인 페이지로 튕겨내기
      if (err.response?.status === 401) {
        Cookies.remove("token");
        window.location.href = "/sign-in";
      }
    } finally {
      setIsInfoLoading(false); // 로딩 종료
    }
  }, []);

  // --- [초기 실행 및 탭 변경 감지 (useEffect)] ---
  useEffect(() => {
    // 토큰이 없으면(로그인 안 했으면) 로그인 페이지로 강제 이동
    if (!Cookies.get("token")) {
      window.location.href = "/sign-in";
      return;
    }

    // 현재 탭에 따라 다른 데이터를 가져옵니다.
    if (activeTab === "info") {
      fetchUserInfo(); // '내 정보' 탭이면 유저 정보 갱신
    } else {
      fetchPosts(activeTab, 1); // 그 외 탭(글, 댓글, 즐겨찾기)이면 해당 목록 데이터 갱신
    }

    // 탭이 바뀔 때 필터 상태 초기화
    if (activeTab === "favorites") {
      setFavoriteFilter("ALL");
    }
  }, [activeTab, fetchUserInfo, fetchPosts]);

  // --- [🔥 필터링된 리스트 계산 (useMemo)] ---
  // 즐겨찾기 탭일 때 필터 상태에 따라 보여줄 데이터를 거릅니다.
  const filteredListData = useMemo(() => {
    // 즐겨찾기 탭이 아니거나, 필터가 '전체'면 원본 그대로 반환
    if (activeTab !== "favorites" || favoriteFilter === "ALL") {
      return listData;
    }
    // 선택된 카테고리와 일치하는 아이템만 반환
    return listData.filter((item: any) => item.category === favoriteFilter);
  }, [activeTab, favoriteFilter, listData]);

  // --- [정보 수정 핸들러] ---
  const handleUpdateInfo = async () => {
    try {
      // 수정된 닉네임과 이메일을 포함한 데이터 생성
      const updateData = { ...info, nickname: tempNickname, email: tempEmail };
      // 서버에 수정 요청 전송
      await userService.updateUserInfo(updateData);
      setInfo(updateData); // 성공 시 화면 데이터도 업데이트
      alert("성공적으로 변경되었습니다."); // 성공 알림
    } catch (err) {
      alert("변경에 실패했습니다."); // 실패 알림
    }
  };

  // 🔹 [글자 수 제한 함수] ---
  // 모바일 화면 크기에 따라 텍스트를 적절히 잘라서 보여주는 유틸리티 함수
  const truncateText = (text: string) => {
    if (!text) return "";
    if (typeof window === "undefined") return text; // 서버 사이드 렌더링 시에는 원본 반환

    const width = window.innerWidth;
    let limit = 40; // 기본(데스크톱) 글자 수 제한

    if (width <= 320) {
      limit = 12; // 초소형 모바일 (iPhone SE 등)
    } else if (width < 768) {
      limit = 18; // 일반 모바일
    }

    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  // --- [로딩 중 화면] ---
  if (isInfoLoading && activeTab === "info") {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-slate-400 text-sm tracking-[0.2em]">
        LOADING DASHBOARD...
      </div>
    );
  }

  // --- [메인 화면 렌더링] ---
  return (
    <div className="min-h-screen bg-[#fcfdfc] py-10 md:py-16 px-3 md:px-4 lg:px-0">
      <div className="max-w-6xl mx-auto">
        {/* 1. 상단 헤더 영역 */}
        <div className="mb-8 md:mb-12 px-1">
          {/* 대시보드 뱃지 (톱니바퀴 회전 애니메이션) */}
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
            {/* 로그아웃 버튼 */}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-[10px] md:text-xs transition-colors mb-2"
            >
              <LogOut size={14} /> LOGOUT
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          {/* 2. 좌측 사이드바 (프로필 및 탭 메뉴) */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="bg-white rounded-4xl md:rounded-[2.5rem] shadow-sm border border-slate-100 p-5 md:p-6 overflow-hidden relative group">
              {/* 배경 장식 원 (호버 시 커짐) */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110" />

              <div className="mb-8 md:mb-10 px-2 relative">
                <div className="flex items-center gap-3 mb-5">
                  {/* 프로필 아이콘 박스 */}
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-100">
                    <User className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
                  </div>
                  {/* 홈으로 가기 버튼 */}
                  <Link
                    href="/"
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <Home size={18} />
                  </Link>
                </div>
                {/* 닉네임 표시 */}
                <p className="text-[11px] md:text-xs font-bold text-slate-400 mb-1">
                  반갑습니다,
                </p>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">
                  {info.nickname || "사용자"}님
                </h3>
              </div>

              {/* 탭 버튼 목록 */}
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

          {/* 3. 메인 콘텐츠 영역 (탭 선택에 따라 바뀜) */}
          <div className="flex-1 bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-50 p-5 md:p-14 min-h-[500px] flex flex-col relative">
            {/* 배경 흐림 효과 */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-50/30 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <div className="relative h-full flex flex-col">
              {/* 콘텐츠 헤더 (제목) */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
                <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 md:h-10 bg-green-500 rounded-full" />
                  {activeTab === "info"
                    ? "Settings"
                    : activeTab === "favorites"
                    ? "Favorites"
                    : "History"}
                </h2>

                {/* 🔥 [추가됨] 즐겨찾기 탭일 때만 보이는 카테고리 필터 버튼 */}
                {activeTab === "favorites" && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                    {[
                      { id: "ALL", label: "전체" },
                      { id: "RESTOURANTS", label: "맛집" }, // 오타 주의: 백엔드 데이터에 맞춤
                      { id: "HOSPITALS", label: "병원" },
                      { id: "TOURS", label: "관광지" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setFavoriteFilter(filter.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition-all border ${
                          favoriteFilter === filter.id
                            ? "bg-green-600 text-white border-green-600 shadow-md"
                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* (A) 내 정보 관리 탭 */}
              {activeTab === "info" ? (
                <div className="flex flex-col xl:flex-row items-start gap-10 xl:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  {/* 정보 수정 폼 */}
                  <div className="w-full xl:max-w-md space-y-6 md:space-y-10">
                    <Input label="Login ID" value={info.loginId} disabled />{" "}
                    {/* 아이디는 수정 불가 */}
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

                  {/* 🔹 우측 배너 영역 (Swiper 슬라이더) */}
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
                        {/* 슬라이드 1: 맛집 추천 */}
                        <SwiperSlide>
                          <Link
                            href="/community/review"
                            className="block h-full"
                          >
                            <div className="bg-green-50 h-full p-6 md:p-8 flex flex-col justify-between">
                              <div>
                                <p className="text-[10px] font-black text-green-700 uppercase mb-4 flex items-center gap-2">
                                  <MapPin size={12} /> Local Hotplace
                                </p>
                                <h4 className="text-lg md:text-xl font-black text-slate-800 leading-tight mb-2">
                                  우리 동네 <br /> 숨은 여행지{" "}
                                  <span className="text-green-600 italic">
                                    찾기!
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  이웃들이 검증한 진짜 여행지 후기.
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 self-end">
                                <UtensilsCrossed size={18} />
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                        {/* 슬라이드 2: 뉴스 */}
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
                        {/* 슬라이드 3: 커뮤니티 */}
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
              ) : activeTab === "favorites" ? (
                // (B) 즐겨찾기 목록 탭 (필터링 적용됨)
                <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                  {/* 🔥 filteredListData 사용 */}
                  {filteredListData.length === 0 ? (
                    // 데이터 없음 표시
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-20 text-center">
                      <p className="font-black text-lg text-slate-400">
                        {favoriteFilter === "ALL"
                          ? "즐겨찾기 내역이 없습니다."
                          : "해당 카테고리의 즐겨찾기가 없습니다."}
                      </p>
                    </div>
                  ) : (
                    // 즐겨찾기 리스트
                    <div className="grid gap-4">
                      {filteredListData.map((item: any) => {
                        const category = item.category;
                        const itemId = item.id;
                        const title = item.title;
                        // 카테고리별 이동 경로 설정
                        const detailPath =
                          category === "TOURS"
                            ? `tour/attraction?keyword=${title}`
                            : category === "RESTOURANTS"
                            ? `restaurant/${itemId}`
                            : category === "HOSPITALS"
                            ? `hospital/${itemId}`
                            : "";

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
                                      {category}
                                    </span>
                                  </div>
                                  {/* 🔹 동적 글자수 제한 적용 */}
                                  <h3 className="text-sm md:text-xl font-black text-slate-800 group-hover:text-green-600 transition-colors">
                                    {title}
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
              ) : (
                // (C) 게시글/댓글 목록 탭 (History)
                <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                  {listData.length === 0 ? (
                    // 데이터 없음 표시
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-20 text-center">
                      <p className="font-black text-lg text-slate-400">
                        활동 내역이 없습니다.
                      </p>
                    </div>
                  ) : (
                    // 활동 리스트
                    <div className="grid gap-4">
                      {listData.map((item: any) => {
                        const category = (
                          item.category || "free"
                        ).toLowerCase();
                        const postId = item.POST_ID || item.id;
                        const detailPath = `/community/${category}/${postId}`; // 상세 페이지 경로
                        const rawText =
                          activeTab === "posts" ? item.title : item.content; // 글이면 제목, 댓글이면 내용 표시

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
                                    <Clock
                                      size={15}
                                      className="ml-1 text-slate-500"
                                    />
                                    <span className=" text-slate-500 text-[12px] md:text-[14px]">
                                      {" "}
                                      {item.createdAt}
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

// --- [서브 컴포넌트: 탭 버튼] ---
const TabBtn = ({ id, label, icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-[1.2rem] md:rounded-3xl font-black transition-all mb-1 md:mb-2 ${
      active === id
        ? "bg-green-500 text-white shadow-lg" // 활성 상태 스타일
        : "text-slate-400 hover:bg-slate-50" // 비활성 상태 스타일
    }`}
  >
    {/* 활성 상태일 때 아이콘 살짝 커지는 효과 */}
    <span className={active === id ? "scale-110" : ""}>{icon}</span>
    <span className="text-[11px] md:text-[13px] tracking-tight">{label}</span>
  </button>
);

// 1. 페이지 진입 및 보안 검사 (Access Control)

// 사용자가 /mypage로 접속합니다.

// useEffect가 가장 먼저 실행되어 쿠키에 token이 있는지 확인합니다.

// 토큰이 없다면 즉시 로그인 페이지(/sign-in)로 쫓아냅니다. (보안)

// 2. 초기 데이터 로드 (Initial Data Fetching)

// 토큰이 확인되면, 기본 탭인 activeTab: "info"에 따라 fetchUserInfo()가 실행됩니다.

// 서버에서 내 닉네임, 이메일, 아이디 정보를 받아와 info 상태에 저장하고, 화면에 뿌려줍니다.

// 3. 정보 수정 (Update Info)

// 사용자가 닉네임 입력칸을 지우고 "새로운닉네임"이라고 입력합니다. tempNickname 상태가 변합니다.

// [저장하기] 버튼을 누르면 handleUpdateInfo 함수가 실행되어 변경된 내용을 서버로 보냅니다. 성공하면 알림창이 뜹니다.

// 4. 탭 전환 및 목록 조회 (Tab Switching)

// 좌측 사이드바에서 [작성한 게시글] 버튼을 클릭합니다.

// activeTab이 "posts"로 바뀝니다.

// useEffect가 탭 변경을 감지하고, 이번엔 fetchPosts("posts", 1)을 호출합니다.

// 서버에서 내가 쓴 글 목록을 가져와 우측 화면에 리스트 형태로 보여줍니다.

// 5. 즐겨찾기 확인 (Check Favorites)

// 이번엔 [즐겨찾기 목록] 탭을 누릅니다.

// activeTab이 "favorites"가 되고, 즐겨찾기한 맛집/병원 리스트를 불러옵니다.

// 리스트의 항목을 클릭하면 해당 상세 페이지(예: /restaurant/123)로 이동합니다.
