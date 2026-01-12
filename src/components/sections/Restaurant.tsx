// 1. "use client": 이 파일은 브라우저(클라이언트)에서 실행되는 컴포넌트입니다.
// (Swiper 슬라이더, useEffect 데이터 페칭, useState 상태 관리는 브라우저 API가 필요하기 때문입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useState, useMemo } from "react"; // React 필수 훅 (효과, 상태, 메모이제이션)
import Link from "next/link"; // 페이지 이동을 위한 링크 컴포넌트
import { Swiper, SwiperSlide } from "swiper/react"; // 터치 슬라이드를 구현하는 Swiper 라이브러리
import { Autoplay } from "swiper/modules"; // Swiper의 자동 재생 모듈
import { Loader2, Plus } from "lucide-react"; // 아이콘 (로딩 스피너, 더보기 플러스 버튼)
import { restaurantService } from "@/api/services"; // API 통신 함수 모음
import { RestaurantData } from "@/types/restaurant"; // 데이터 타입 정의
import RestaurantCard from "@/components/sections/restaurant/RestaurantCard"; // 개별 맛집 카드 컴포넌트

// Swiper의 기본 스타일 시트를 불러옵니다. (이게 없으면 슬라이더가 깨져 보입니다.)
import "swiper/css";

// ==================================================================
// [Main Component] 맛집 추천 섹션 컴포넌트 시작
// ==================================================================
export default function Restaurant() {
  // --- [State] 상태 관리 ---
  // 1. 서버에서 가져온 전체 맛집 리스트를 저장할 곳 (초기값은 빈 배열)
  const [allRestaurants, setAllRestaurants] = useState<RestaurantData[]>([]);
  // 2. 데이터를 불러오는 중인지 확인하는 상태 (초기값은 true -> 로딩 중)
  const [loading, setLoading] = useState(true);

  // --- [Effect] 데이터 가져오기 (페이지 로드 시 1회 실행) ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true); // 로딩 시작! (안전장치)

        // API 호출: 서버에게 맛집 리스트를 달라고 요청합니다.
        const response = await restaurantService.getRestaurants();

        // 받아온 데이터를 상태에 저장합니다. (데이터가 없으면 빈 배열 [] 저장)
        setAllRestaurants(response.data || []);
      } catch (error) {
        // 에러가 나면 콘솔에 로그를 남깁니다. (사용자는 빈 화면을 보게 됨)
        console.error("데이터 로드 실패:", error);
      } finally {
        // 성공하든 실패하든 무조건 로딩 상태를 끕니다. (그래야 스피너가 사라짐)
        setLoading(false);
      }
    };

    // 위에서 만든 함수를 실행합니다.
    fetchRestaurants();
  }, []); // 의존성 배열이 [] 비어있으므로 컴포넌트가 처음 켜질 때 딱 한 번만 실행됩니다.

  // --- [Memo] 랜덤 맛집 10개 추출 로직 ---
  // useMemo를 쓰는 이유: 컴포넌트가 리렌더링 될 때마다 매번 섞으면 깜빡거릴 수 있습니다.
  // allRestaurants 데이터가 변경되었을 때만 다시 계산(셔플)합니다.
  const randomList = useMemo(() => {
    // 데이터가 하나도 없으면 빈 배열 반환
    if (allRestaurants.length === 0) return [];

    // 1. [...allRestaurants]: 원본 데이터를 복사합니다. (원본 훼손 방지)
    // 2. .sort(...): 0.5 - Math.random() 공식을 써서 무작위로 섞습니다.
    // 3. .slice(0, 10): 섞인 것 중 앞에서 10개만 자릅니다.
    return [...allRestaurants].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [allRestaurants]);

  // --- [Loading View] 데이터가 아직 없을 때 보여줄 화면 ---
  if (loading) return <LoadingState />;

  // -----------------------------------------------------------
  // [Render] 화면 그리기 시작
  // -----------------------------------------------------------
  return (
    // section: 의미 있는 구역 나눔 (위아래 여백 py-12)
    <section className="py-12">
      {/* 중앙 정렬 및 최대 너비 제한 (반응형 컨테이너) */}
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-8 relative">
        {/* --- [Header] 타이틀 및 더보기 버튼 영역 --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          {/* 타이틀 텍스트 그룹 */}
          <div className="space-y-3">
            {/* 뱃지 컴포넌트 사용 (HOT PLACE) */}
            <Badge text="HOT PLACE" />

            {/* 메인 타이틀 */}
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              오늘의 {/* 글자색에 그라데이션 효과 (오렌지 -> 레드) */}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">
                대전 맛집
              </span>
            </h2>

            {/* 서브 설명 문구 */}
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              대전 전역의 인기 식당을 분석해 핵심 정보만 제공합니다.
            </p>
          </div>

          {/* 더보기(+) 버튼: 클릭 시 전체 맛집 리스트 페이지로 이동 */}
          <Link
            href="/restaurant"
            className="flex items-center justify-center w-12 h-12 text-orange-400 border border-slate-200 hover:text-white hover:bg-green-500 hover:border-green-500 transition-all rounded-full group shadow-sm"
          >
            {/* 마우스 올리면(hover) 아이콘이 90도 회전하는 애니메이션 */}
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          </Link>
        </div>

        {/* --- [Slider] 맛집 카드 슬라이더 --- */}
        <Swiper
          loop={true} // 무한 반복 슬라이드
          autoplay={{ delay: 3000, disableOnInteraction: false }} // 3초마다 자동 넘김
          spaceBetween={20} // 카드 사이 간격 20px
          slidesPerView={1.2} // 모바일 기본: 1.2개 보임 (옆에 살짝 걸치게)
          breakpoints={{
            640: { slidesPerView: 2.2 }, // 태블릿: 2.2개
            1024: { slidesPerView: 4 }, // PC: 4개
          }}
          modules={[Autoplay]} // 자동 재생 모듈 장착
          className="h-[380px] md:h-[450px] w-full" // 슬라이더 높이 지정
        >
          {/* 랜덤으로 뽑은 10개 맛집을 하나씩 카드로 만듭니다. */}
          {randomList.map((item) => (
            <SwiperSlide key={item.id}>
              {/* 개별 맛집 카드 컴포넌트 */}
              <RestaurantCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

// ==================================================================
// [Sub Component] 뱃지 컴포넌트 (HOT PLACE)
// ==================================================================
const Badge = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold tracking-tight">
    {/* 반짝이는 점 애니메이션 효과 */}
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
    </span>
    {text}
  </div>
);

// ==================================================================
// [Sub Component] 로딩 상태 컴포넌트
// 데이터 로딩 중에 보여줄 스피너와 문구
// ==================================================================
const LoadingState = () => (
  <div className="h-[500px] w-full flex flex-col items-center justify-center">
    {/* 빙글빙글 도는 스피너 아이콘 */}
    <Loader2 className="animate-spin text-green-500 w-12 h-12 mb-4" />
    <p className="text-gray-500 font-bold text-lg">
      오늘의 추천 맛집을 찾는 중...
    </p>
    <p className="text-gray-400 text-sm mt-2">잠시만 기다려 주세요!</p>
  </div>
);

// 로딩 시작: 컴포넌트가 화면에 나타나자마자(Mount), loading 상태가 true입니다. 사용자는 귀여운 초록색 스피너가 돌아가는 **로딩 화면(LoadingState)**을 봅니다.

// 데이터 요청: useEffect가 실행되면서 백엔드 서버에 "등록된 모든 맛집 리스트 줘!"라고 요청합니다.

// 데이터 가공 (랜덤 추천):

// 데이터가 도착하면 loading이 false로 바뀌고 화면이 전환됩니다.

// 이때 useMemo가 작동하여 전체 맛집 중 무작위로 10곳을 뽑아냅니다. (새로고침 할 때마다 추천 맛집이 바뀝니다!)

// 슬라이더 표시:

// **Swiper(슬라이더)**가 작동하며 카드들이 자동으로 옆으로 흐릅니다.

// 모바일에서는 카드 1.2개, 태블릿은 2.2개, PC에서는 4개씩 보이도록 반응형으로 조절됩니다.

// 이동:

// 카드를 클릭하면 상세 페이지로 이동하고, 우측 상단의 [+] 버튼을 누르면 전체 맛집 리스트 페이지(/restaurant)로 이동합니다.
