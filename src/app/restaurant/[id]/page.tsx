"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import api from "@/api/axios";
import { RestaurantData } from "@/types/restaurant";
import {
  Loader2,
  MapPin,
  Utensils,
  Phone,
  Clock,
  ChevronLeft,
  Heart,
  Navigation,
  ExternalLink,
  Info,
  PhoneOff,
} from "lucide-react";

export default function RestaurantDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get("/restaurant");
        const allData: RestaurantData[] = response.data;
        const detail = allData.find(
          (item: RestaurantData) => String(item.id) === id
        );

        if (detail) {
          setRestaurant(detail);
        } else {
          router.push("/restaurant");
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router]);

  const initMap = (address: string, name: string) => {
    const { kakao } = window as any;
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      const container = document.getElementById("map");
      if (!container) return;

      const options = {
        center: new kakao.maps.LatLng(36.3504, 127.3845),
        level: 3,
      };
      const map = new kakao.maps.Map(container, options);
      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          new kakao.maps.Marker({ map, position: coords });

          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;color:#334155;">${name}</div>`,
          });
          infowindow.open(map);
          map.setCenter(coords);
        }
      });
    });
  };

  useEffect(() => {
    if (restaurant && restaurant.address && restaurant.name && !loading) {
      const timer = setTimeout(
        () => initMap(restaurant.address as string, restaurant.name),
        300
      );
      return () => clearTimeout(timer);
    }
  }, [restaurant, loading]);

  const handleFavoriteClick = async () => {
    if (!restaurant) return;
    try {
      await api.post(`/restaurant/${restaurant.id}/favorite`);
      setRestaurant({ ...restaurant, isFavorite: !restaurant.isFavorite });
    } catch (error) {
      alert("로그인이 필요합니다.");
    }
  };

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12 mb-4" />
        <p className="text-slate-500 font-bold tracking-tight">
          맛집 정보를 불러오는 중...
        </p>
      </div>
    );

  if (!restaurant) return null;

  // 전화번호 유효성 체크
  const isPhoneAvailable = !!restaurant.phone && restaurant.phone.trim() !== "";

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24">
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
        onLoad={() => {}}
      />

      {/* 1. 히어로 섹션 */}
      <div className="relative h-[400px] md:h-[550px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: restaurant.imagePath
              ? `url(/images/restaurantImages/${restaurant.imagePath})`
              : "none",
            backgroundColor: "#1e293b",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
        </div>

        <div className="absolute top-8 left-6 md:left-12 z-20">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/20 hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft
              size={20}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span className="font-bold text-sm">목록으로</span>
          </button>
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500 text-white text-[11px] font-black rounded-lg mb-4 uppercase tracking-widest">
              {restaurant.restCategory ?? "카테고리"}
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 text-white/80 font-semibold text-lg">
              <MapPin size={22} className="text-orange-400 shrink-0" />
              <span>{restaurant.address ?? "주소 정보 없음"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* 왼쪽 컬럼 */}
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                  <Utensils size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    대표 시그니처
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    이곳에서 꼭 먹어봐야 할 메뉴
                  </p>
                </div>
              </div>

              <div className="relative p-8 md:p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden group">
                <div className="relative z-10">
                  <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-3 block">
                    Signature Menu
                  </span>
                  <p className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    {restaurant.bestMenu ?? "정보가 없습니다."}
                  </p>
                  <p className="text-slate-500 text-lg leading-relaxed max-w-2xl font-medium">
                    {restaurant.name}의 장인정신이 담긴 최고의 맛을
                    경험해보세요.
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-8 text-slate-200/50 text-9xl font-black italic select-none group-hover:text-orange-100/50 transition-colors duration-500">
                  MENU
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Info size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Category
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {restaurant.restCategory ?? "정보 없음"}
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    isPhoneAvailable
                      ? "bg-green-50 text-green-500"
                      : "bg-slate-50 text-slate-300"
                  }`}
                >
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Contact
                  </p>
                  <p
                    className={`text-xl font-black ${
                      isPhoneAvailable ? "text-slate-800" : "text-slate-300"
                    }`}
                  >
                    {restaurant.phone || "연락처 비공개"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-10">
              <div className="flex flex-col gap-3 mb-8">
                <button
                  onClick={handleFavoriteClick}
                  className={`w-full py-4.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    restaurant.isFavorite
                      ? "bg-red-500 text-white shadow-lg shadow-red-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <Heart
                    size={20}
                    className={restaurant.isFavorite ? "fill-white" : ""}
                  />
                  {restaurant.isFavorite
                    ? "나의 맛집 저장됨"
                    : "맛집 리스트 추가"}
                </button>

                {/* 지금 바로 전화하기 버튼 (조건부 렌더링/비활성화) */}
                <a
                  href={isPhoneAvailable ? `tel:${restaurant.phone}` : "#"}
                  onClick={(e) => !isPhoneAvailable && e.preventDefault()}
                  className={`w-full py-4.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    isPhoneAvailable
                      ? "bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600"
                      : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed opacity-70 grayscale"
                  }`}
                >
                  {isPhoneAvailable ? (
                    <Phone size={20} />
                  ) : (
                    <PhoneOff size={20} />
                  )}
                  {isPhoneAvailable ? "지금 바로 전화하기" : "전화 연결 불가"}
                </a>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <Navigation size={20} className="text-blue-500" />
                    오시는 길
                  </h3>
                  <a
                    href={`https://map.kakao.com/link/search/${encodeURIComponent(
                      restaurant.address ?? ""
                    )}`}
                    target="_blank"
                    className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline"
                  >
                    큰 지도보기 <ExternalLink size={12} />
                  </a>
                </div>

                <div
                  id="map"
                  className="w-full h-[250px] rounded-4xl bg-slate-100 border border-slate-100 overflow-hidden shadow-inner"
                />

                <div className="p-6 bg-slate-900 rounded-4xl text-white">
                  <div className="flex items-center gap-2 text-orange-400 mb-3">
                    <Clock size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Business Hours
                    </span>
                  </div>
                  <p className="text-white font-bold text-base leading-relaxed">
                    {restaurant.openTime ?? "매장 운영 정보를 준비 중입니다."}
                  </p>
                </div>

                <a
                  href={`https://map.kakao.com/link/to/${encodeURIComponent(
                    restaurant.name ?? ""
                  )},36.3504,127.3845`}
                  target="_blank"
                  className="w-full py-5 bg-[#FFEB00] text-[#3C1E1E] rounded-3xl font-black text-sm flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md"
                >
                  <Navigation size={18} /> 카카오맵 길찾기 시작
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-20 border-t border-slate-100 pt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <button
            onClick={() => router.push("/restaurant")}
            className="group inline-flex items-center gap-3 text-slate-300 hover:text-orange-500 transition-colors"
          >
            <span className="w-12 h-px bg-slate-200 group-hover:bg-orange-200"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em]">
              Explore More Restaurants
            </span>
            <span className="w-12 h-px bg-slate-200 group-hover:bg-orange-200"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
