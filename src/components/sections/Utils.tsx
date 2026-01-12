// 1. "use client": 이 파일은 사용자의 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (로그인 상태 확인, 슬라이더 작동 등 브라우저 기능이 필수적이기 때문입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import { useState, useEffect } from "react"; // React 훅 (상태 관리, 부수 효과 처리)
import SearchBar from "@/components/common/SearchBar"; // 공통 검색창 컴포넌트
import UtilsLoginPanel from "@/components/sections/utils/UtilsLoginPanel"; // 로그인/비로그인 상태를 보여주는 패널 컴포넌트
import { adSlides } from "@/data/adData"; // 광고 배너에 들어갈 데이터 (이미지, 텍스트 등)
import { menuData } from "@/data/menuData"; // 퀵 메뉴에 들어갈 데이터 (아이콘, 링크 등)
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크
import Image from "next/image"; // 이미지 최적화 컴포넌트
import Cookies from "js-cookie"; // 브라우저 쿠키를 다루기 위한 라이브러리 (로그인 토큰 확인용)
import { userService } from "@/api/services"; // 유저 정보를 가져오는 API 함수 모음

// Swiper(슬라이더) 관련 라이브러리 임포트
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
// Swiper 스타일 시트 (깨짐 방지)
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// ==================================================================
// [Main Component] 유틸리티(대시보드) 섹션 컴포넌트 시작
// ==================================================================
export default function Utils() {
  // --- [State] 상태 관리 ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부 (기본값: false)
  const [userData, setUserData] = useState<any>(null); // 사용자 정보 (닉네임, 이메일 등)

  // --- [Effect] 로그인 상태 확인 로직 ---
  // 페이지가 처음 렌더링될 때 딱 한 번 실행됩니다.
  useEffect(() => {
    // 1. 쿠키에서 'token'이라는 이름의 값을 찾아봅니다.
    const token = Cookies.get("token");

    // 2. 토큰이 있다면 (로그인한 흔적이 있다면)
    if (token) {
      setIsLoggedIn(true); // 일단 로그인 상태로 간주 (UI 업데이트)

      // 3. 서버에 확실하게 유저 정보를 요청합니다.
      userService
        .getUserInfo()
        .then((res) => setUserData(res.data)) // 성공하면 받아온 데이터를 상태에 저장
        .catch(() => setIsLoggedIn(false)); // 실패하면(토큰 만료 등) 다시 비로그인 처리
    }
  }, []); // 의존성 배열 [], 마운트 시 1회 실행

  // -----------------------------------------------------------
  // [Render] 화면 그리기 시작
  // -----------------------------------------------------------
  return (
    // 전체 섹션: 위아래 여백(py-12), 배경은 아주 연한 회색(bg-gray-50/50)
    <section className="py-12 bg-gray-50/50">
      {/* [Grid Layout Container] 여기가 레이아웃의 핵심입니다! */}
      {/* - flex-col gap-6: 모바일에서는 세로로 6 간격으로 쌓임 */}
      {/* - md:grid...: 태블릿(md)부터는 그리드 레이아웃 적용 (2열) */}
      {/* - lg:grid-cols-4: PC(lg)에서는 4열로 확장 */}
      <div className="w-full mx-auto px-4 flex flex-col gap-6 md:grid md:grid-cols-2 md:grid-rows-[auto_1fr] md:max-w-7xl md:gap-5 lg:grid-cols-4 lg:px-5">
        {/* --- [Area 1] 검색창 영역 --- */}
        {/* lg:col-span-2: PC에서는 4칸 중 2칸을 차지 (절반 너비) */}
        <div className="lg:col-span-2 flex items-center">
          <SearchBar
            idPrefix="main" // 검색창 ID 접두사 (중복 방지)
            // 스타일: 둥근 모서리(rounded-4xl), 그림자 효과, 포커스 시 초록색 그림자
            className="w-full h-14 text-sm lg:text-lg lg:h-18 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-4xl px-6 flex items-center transition-all focus-within:shadow-[0_8px_30px_rgba(34,197,94,0.1)] md:h-16"
          />
        </div>

        {/* --- [Area 2] 광고 배너 슬라이더 영역 --- */}
        {/* md:row-span-2: 태블릿 이상에서는 세로로 2줄을 차지 (길게) */}
        {/* md:col-span-1: 가로는 1칸 차지 */}
        <div className="h-44 md:row-span-2 md:col-span-1 md:h-full rounded-3xl overflow-hidden shadow-lg shadow-gray-200 relative group">
          <Swiper
            modules={[Autoplay, Pagination]} // 자동재생, 페이지네이션(점) 모듈 사용
            autoplay={{ delay: 4000 }} // 4초마다 자동 넘김
            pagination={{ clickable: true }} // 하단 점 클릭 가능
            loop={true} // 무한 반복
            className="h-full w-full advertise" // 커스텀 CSS 클래스
          >
            {/* 광고 데이터(adSlides)를 순회하며 슬라이드 생성 */}
            {adSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <Link
                  href={slide.link} // 클릭 시 이동할 주소
                  // 배경색은 데이터에서 받아온 클래스(slide.bg) 사용
                  className={`w-full h-full ${slide.bg} flex flex-col items-start justify-center p-8 text-white relative overflow-hidden`}
                >
                  {/* 배경 장식용 흐릿한 원 */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                  {/* 태그 (예: NOTICE, EVENT) */}
                  <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full mb-4 uppercase tracking-widest backdrop-blur-sm">
                    {slide.tag}
                  </span>

                  {/* 제목과 아이콘 */}
                  <div className="flex items-center gap-2 mb-2">
                    {slide.icon}
                    <h3 className="text-xl font-bold leading-tight">
                      {slide.title}
                    </h3>
                  </div>

                  {/* 설명글 */}
                  <p className="text-sm font-medium text-white/90 whitespace-pre-line leading-relaxed">
                    {slide.desc}
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* --- [Area 3] 로그인 패널 영역 --- */}
        {/* 로그인 상태와 유저 정보를 props로 전달합니다. */}
        {/* 이 컴포넌트 내부에서 "로그인 전/후" 화면을 알아서 결정해 보여줍니다. */}
        <UtilsLoginPanel isLoggedIn={isLoggedIn} userData={userData} />

        {/* --- [Area 4] 퀵 메뉴(바로가기) 슬라이더 영역 --- */}
        {/* lg:col-span-2: PC에서는 하단 2칸을 차지 (넓게) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center">
          <Swiper
            // 반응형 설정: 화면 너비에 따라 보여줄 아이콘 개수 조절
            breakpoints={{
              0: { slidesPerView: 3, spaceBetween: 15 }, // 모바일: 3개
              360: { slidesPerView: 4, spaceBetween: 15 }, // 큰 모바일: 4개
              768: { slidesPerView: 5, spaceBetween: 20 }, // 태블릿: 5개
              1024: { slidesPerView: 5, spaceBetween: 25 }, // PC: 5개
            }}
            navigation={true} // 좌우 화살표 네비게이션 활성화
            modules={[Navigation]}
            className="quick-swiper w-full"
          >
            {/* 메뉴 데이터(menuData)를 순회하며 아이콘 생성 */}
            {menuData.pages.map((page) => (
              <SwiperSlide key={page.name}>
                <Link
                  href={page.href} // 이동 경로
                  className="flex flex-col items-center gap-3 group"
                >
                  {/* 아이콘 원형 배경 */}
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors duration-300">
                    <Image
                      src={page.src} // 아이콘 이미지 경로
                      alt={page.name}
                      width={32}
                      height={32}
                      // 마우스 올리면(hover) 아이콘이 살짝 커지는 효과
                      className="group-hover:scale-110 transition-transform"
                    />
                  </div>
                  {/* 메뉴 이름 */}
                  <p className="text-xs lg:text-sm font-semibold text-gray-600 group-hover:text-green-600 transition-colors">
                    {page.name}
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

// 초기화 (Mount & Auth Check):

// 컴포넌트가 로딩되자마자 useEffect가 실행됩니다.

// "이 사람 로그인했나?" 하고 브라우저 쿠키(token)를 살짝 열어봅니다.

// 토큰이 있다면 백엔드 서버에 "이 토큰 주인 정보(닉네임 등) 좀 줘"라고 요청(userService.getUserInfo)합니다.

// 정보를 받아오면 isLoggedIn을 true로 바꾸고, userData에 정보를 담습니다. (이 정보는 로그인 패널로 전달됩니다.)

// 화면 배치 (Responsive Grid):

// PC 화면: 4단 그리드로 구성됩니다.

// (1) 상단: 넓은 검색창

// (2) 좌측: 자동으로 넘어가는 광고 배너 슬라이드

// (3) 우측: 로그인 패널 (로그인 상태면 프로필, 아니면 로그인 버튼)

// (4) 하단: 아이콘 메뉴들이 가로로 나열된 퀵 메뉴 슬라이더

// 모바일 화면: 위에서부터 차곡차곡 세로로 쌓입니다. (검색창 -> 광고 -> 로그인 패널 -> 퀵 메뉴)

// 상호작용:

// 광고: 사용자가 가만히 있어도 4초마다 배너가 자동으로 넘어갑니다.

// 퀵 메뉴: 아이콘이 많으면 손가락으로 밀어서(Swiper) 더 볼 수 있습니다. 반응형 설정(breakpoints) 덕분에 화면 크기에 맞춰 아이콘 개수가 조절됩니다.
