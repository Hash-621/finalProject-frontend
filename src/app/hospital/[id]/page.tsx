// 1. "use client": 이 파일이 서버가 아닌 브라우저(클라이언트)에서 실행되는 컴포넌트임을 선언합니다.
// (useState, useEffect, 이벤트 핸들러 등을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useState } from "react"; // 리액트의 핵심 훅(상태 관리, 수명 주기)을 가져옵니다.

import { useParams, useRouter } from "next/navigation"; // URL 파라미터 읽기, 페이지 이동을 위한 Next.js 훅

// [수정] 서비스 추가 임포트
// hospitalService: 병원 데이터 조회, 즐겨찾기 토글
// userService: 내 즐겨찾기 목록 조회
import { hospitalService, userService } from "@/api/services";

// 화면을 예쁘게 꾸며줄 다양한 아이콘들을 가져옵니다.
import {
  Loader2, // 로딩 스피너
  MapPin, // 지도 핀 아이콘
  Stethoscope, // 청진기 아이콘
  Phone, // 전화기 아이콘
  Clock, // 시계 아이콘
  Info, // 정보 아이콘
  ChevronLeft, // 뒤로가기 화살표
  Calendar, // 달력 아이콘
  ShieldCheck, // 인증 마크 아이콘
  Building2, // 건물 아이콘
  Heart,
  ArrowLeft, // [추가] 하트(즐겨찾기) 아이콘
} from "lucide-react";

import Link from "next/link"; // 페이지 이동용 링크 컴포넌트

// --- [메인 컴포넌트 시작] ---
export default function HospitalDetail() {
  // 1. URL에서 병원 ID(예: '123')를 추출합니다.
  const { id } = useParams();

  // 2. 페이지 이동을 위한 라우터 객체를 생성합니다.
  const router = useRouter();

  // --- [상태 관리 (State)] ---
  // 병원 상세 정보를 저장할 상태입니다. (초기값 null)
  const [hospital, setHospital] = useState<any | null>(null);

  // 데이터 로딩 중인지 여부를 저장할 상태입니다. (초기값 true -> 로딩 화면 먼저 보임)
  const [loading, setLoading] = useState(true);

  // [수정] 데이터 로드 로직 (병원 상세 + 즐겨찾기 상태 병합)
  // --- [스크롤 제어 (useEffect)] ---
  // 이 페이지에 들어오면 전체 화면 스크롤 설정을 강제로 풉니다.
  useEffect(() => {
    const wrapElement = document.querySelector(".wrap") as HTMLElement;
    if (wrapElement) wrapElement.style.overflow = "visible"; // 스크롤 가능하게 변경
    return () => {
      // 페이지를 떠날 때(Unmount) 다시 원래대로 돌려놓습니다.
      if (wrapElement) wrapElement.style.overflow = "hidden";
    };
  }, []);

  // --- [데이터 로드 (useEffect)] ---
  // ID가 있거나 바뀔 때 실행되어 병원 정보를 가져옵니다.
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true); // 로딩 시작

        // 1. 전체 병원 목록과 내 즐겨찾기 목록 동시 호출

        // (단일 조회 API 대신 전체 목록에서 찾는 방식을 유지합니다)
        // Promise.allSettled를 써서 둘 중 하나가 실패해도 나머지는 처리할 수 있게 합니다.
        const [hospitalsRes, favoritesRes] = await Promise.allSettled([
          hospitalService.getHospitals(), // 모든 병원 데이터 요청

          userService.getFavorites(), // 내가 즐겨찾기한 병원 목록 요청
        ]);

        let allHospitals: any[] = [];

        const myFavoriteIds = new Set<number>(); // 즐겨찾기한 병원 ID만 모아둘 집합(Set)

        // 2. 전체 병원 데이터 확보 (성공했다면)

        if (hospitalsRes.status === "fulfilled") {
          allHospitals = hospitalsRes.value.data;
        }

        // 3. 내 즐겨찾기 ID 확보 (성공했다면)

        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;

          if (Array.isArray(favoriteList)) {
            // 배열을 순회하며 ID만 쏙쏙 뽑아 Set에 담습니다. (나중에 검색하기 편하게)
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        // 4. 현재 ID에 해당하는 병원 찾기

        const targetId = Number(id); // 문자열 ID를 숫자로 변환

        const detail = allHospitals.find((item: any) => item.id === targetId);

        if (detail) {
          // 즐겨찾기 상태 병합

          const mergedDetail = {
            ...detail, // 기존 병원 정보 다 넣고

            isFavorite: myFavoriteIds.has(targetId), // 내 즐겨찾기 목록에 이 병원 ID가 있는지 확인 (true/false)
          };

          setHospital(mergedDetail); // 최종 데이터 저장
        } else {
          // 병원을 못 찾았다면(잘못된 ID 등), 목록 페이지로 돌려보냅니다.
          router.push("/hospital");
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    if (id) fetchDetail(); // ID가 있을 때만 실행
  }, [id, router]);

  // [추가] 즐겨찾기 토글 핸들러

  const handleFavoriteClick = async () => {
    if (!hospital) return; // 데이터 없으면 무시

    // 낙관적 업데이트 (Optimistic Update):
    // 서버 응답을 기다리지 않고 화면부터 먼저 바꿉니다. (반응속도 향상)

    const previousState = { ...hospital }; // 만약을 대비해 이전 상태 백업

    // 현재 상태의 반대값으로 즉시 변경 (!hospital.isFavorite)
    setHospital({ ...hospital, isFavorite: !hospital.isFavorite });

    try {
      // 서버에 즐겨찾기 토글 요청 전송
      await hospitalService.toggleFavorite(hospital.id);
    } catch (error) {
      // 실패 시 롤백

      // 아까 백업해둔 이전 상태로 되돌립니다.
      setHospital(previousState);

      alert("로그인이 필요합니다."); // 에러 메시지 (주로 로그인 안 된 경우)
    }
  };

  // --- [화면 렌더링 1: 로딩 중] ---
  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-4" />

        <p className="text-slate-600 font-bold">병원 정보를 불러오는 중...</p>
      </div>
    );

  // --- [화면 렌더링 2: 데이터 없음] ---
  if (!hospital) return null; // (보통 리다이렉트 되므로 잠깐 빈 화면)

  // --- [화면 렌더링 3: 정상 출력] ---
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. 상단 비주얼 섹션 (배경 이미지 + 병원 이름) */}

      <section className="relative h-[50vh] md:h-[50vh] w-full overflow-hidden bg-slate-900">
        {/* 배경 이미지 (고정 효과 fixed) */}
        <div
          className="absolute inset-0 opacity-40 bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80')",

            backgroundAttachment: "fixed", // 스크롤해도 배경은 가만히 있는 효과
          }}
        />

        {/* 검은색 그라데이션 오버레이 (글씨 잘 보이게) */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent" />

        {/* 뒤로가기 버튼 */}
        <div className="absolute top-6 left-6 z-30">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/20 hover:bg-white hover:text-black transition-all"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            목록보기
          </button>
        </div>

        {/* 병원 타이틀 및 주요 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white z-10 max-w-7xl mx-auto w-full">
          {/* 진료 과목 뱃지 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-md mb-4 uppercase tracking-widest shadow-lg">
            {hospital.treatCategory || "전문의원"}
          </div>

          {/* 병원 이름 */}
          <h2 className="text-3xl md:text-6xl font-black mb-6 tracking-tighter">
            {hospital.name}
          </h2>

          {/* 주소 및 인증 마크 */}
          <div className="flex flex-wrap items-center gap-6 text-slate-300 font-bold">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-green-400" />

              <span className="text-white/90 font-medium">
                {hospital.address}
              </span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-white/20 pl-6">
              <ShieldCheck className="w-5 h-5 text-blue-400" />

              <span className="text-white/90 font-medium">
                보건복지부 인증 전문의
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 상세 컨텐츠 섹션 (흰색 박스) */}
      {/* 위쪽으로 살짝 겹치게(-mt-12) 해서 입체감을 줌 */}

      <div className="relative z-20 md:-mt-12 bg-white rounded-t-[48px] flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* 좌측 메인 정보 (8칸 차지) */}
            <div className="lg:col-span-8 space-y-16">
              {/* 진료 철학/소개 */}

              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Stethoscope className="w-6 h-6" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    진료 및 전문성 안내
                  </h3>
                </div>

                <div className="group relative overflow-hidden bg-slate-50 rounded-4xl p-10 border border-slate-100 transition-all hover:shadow-xl hover:shadow-green-50">
                  <div className="relative z-10">
                    <span className="text-green-600 font-black text-sm uppercase tracking-widest mb-2 block">
                      Medical Expert
                    </span>

                    <p className="text-slate-900 font-black text-3xl mb-4 leading-tight">
                      {hospital.treatCategory} 전문 진료 서비스
                    </p>

                    <p className="text-slate-500 leading-relaxed text-lg font-medium max-w-xl">
                      {hospital.name}은(는) 대전 지역 전문 의료기관으로서 최첨단
                      장비와 풍부한 임상 경험을 바탕으로 환자 맞춤형 치료를
                      제공합니다. 과잉 진료 없는 정직한 진료를 약속드립니다.
                    </p>
                  </div>

                  {/* 배경 장식 텍스트 */}
                  <div className="absolute -right-4 -bottom-4 text-green-100/50 font-black text-8xl pointer-events-none select-none italic">
                    DOC
                  </div>
                </div>
              </div>

              {/* 병원 기본 정보 표 */}

              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Info className="w-6 h-6" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    병원 상세 정보
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 font-medium">
                  {/* 구분 정보 */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-400" />

                      <span className="text-slate-400">의료기관 구분</span>
                    </div>

                    <span className="font-bold">의원 / 전문의</span>
                  </div>

                  {/* 예약 정보 */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400" />

                      <span className="text-slate-400">예약 여부</span>
                    </div>

                    <span className="font-bold text-green-600">
                      전화 예약 권장
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 사이드바 (4칸 차지) - 즐겨찾기, 연락처 */}

            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl">
                  {/* [추가] 즐겨찾기 버튼 (진료 시간 및 문의 위쪽) */}

                  <button
                    onClick={handleFavoriteClick}
                    className={`w-full py-4 mb-8 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      hospital.isFavorite
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30" // 즐겨찾기 됨 (빨간색)
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600" // 안 됨 (회색)
                    }`}
                  >
                    <Heart
                      size={20}
                      className={hospital.isFavorite ? "fill-white" : ""} // 하트 채우기
                    />

                    {hospital.isFavorite
                      ? "관심 병원 저장됨"
                      : "관심 병원 등록"}
                  </button>

                  <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-green-400" />
                    진료 시간 및 문의
                  </h4>

                  {/* 주소 및 진료시간 */}
                  <div className="space-y-8 mb-10">
                    <div className="space-y-2">
                      <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                        Address
                      </p>

                      <p className="text-sm font-medium leading-relaxed">
                        {hospital.address}
                      </p>
                    </div>

                    <div className="space-y-2 text-green-400">
                      <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                        Clinic Hours
                      </p>

                      <p className="text-sm font-black italic uppercase">
                        {hospital.openTime || "평일 09:00 - 18:30 (문의 요망)"}
                      </p>

                      <p className="text-[10px] text-white/30 font-medium">
                        * 토/일/공휴일은 매장마다 상이하므로 확인이 필요합니다.
                      </p>
                    </div>
                  </div>

                  {/* 전화번호 및 전화 걸기 버튼 */}
                  {hospital.tel ? (
                    <>
                      <div className="space-y-2 text-green-400">
                        <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                          TEL Number
                        </p>

                        <p className="text-sm font-black uppercase">
                          {hospital.tel}
                        </p>
                      </div>

                      <div className="mt-5">
                        <Link
                          href={`tel:${hospital.tel}`} // 클릭 시 전화 걸기
                          className="flex items-center justify-center w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-green-950/20"
                        >
                          전화 문의 및 예약
                        </Link>
                      </div>
                    </>
                  ) : (
                    // 전화번호 없을 때
                    <div className="w-full py-5 bg-slate-800 text-slate-400 rounded-2xl font-bold text-center text-sm border border-slate-700">
                      전화번호 정보 없음
                    </div>
                  )}
                </div>

                {/* 안내 문구 */}
                {hospital.tel && (
                  <p className="px-4 text-[11px] text-slate-400 text-center leading-tight font-medium">
                    진료 중일 경우 전화 연결이 어려울 수 있습니다.
                    <br />
                    방문 전 주소지를 다시 한 번 확인해주세요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 1. 페이지 진입 및 초기화 (Mount)

// 컴포넌트가 실행되고 loading = true이므로 화면에는 로딩 스피너가 빙글빙글 돕니다.

// 동시에 useEffect가 실행되어 스크롤 바 설정을 초기화합니다. (스크롤 가능하게 만듦)

// 2. 병렬 데이터 요청 (Fetching)

// 또 다른 useEffect가 실행되어 두 가지 데이터를 동시에 서버에 요청합니다.

// "모든 병원 리스트 줘." (getHospitals)

// "내가 즐겨찾기한 병원 목록 줘." (getFavorites)

// 두 요청이 모두 끝나면(Promise.allSettled), "성모안과" 데이터를 찾고, 내 즐겨찾기 목록에 포함되어 있는지 확인하여 isFavorite 값을 결정합니다.

// setHospital로 데이터를 저장하고 로딩을 끕니다.

// 3. 화면 렌더링 (Rendering)

// 로딩이 끝나면 멋진 배경 이미지와 함께 병원 정보가 나타납니다.

// 만약 내가 즐겨찾기 해둔 병원이라면, 우측 사이드바의 [관심 병원] 버튼이 빨간색으로 표시됩니다.

// 4. 사용자 인터랙션 (Interaction)

// 즐겨찾기 클릭: 사용자가 [관심 병원] 버튼을 누릅니다. handleFavoriteClick이 실행되어 버튼 색을 즉시 바꿉니다(낙관적 업데이트). 그 후 서버에 요청을 보냅니다. 만약 로그인이 안 되어 있다면 "로그인이 필요합니다"라고 알리고 버튼 색을 되돌립니다.

// 전화 걸기: [전화 문의 및 예약] 버튼을 누르면 스마트폰의 전화 앱이 실행됩니다(href="tel:...").

// 뒤로 가기: 상단의 [뒤로가기] 버튼을 누르면 이전 목록 페이지로 돌아갑니다.
