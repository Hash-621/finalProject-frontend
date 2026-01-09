"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import api from "@/api/axios";
import { restaurantService, userService } from "@/api/services";
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
  ArrowRight,
  MessageCircle,
  PlusCircle, // 더보기 아이콘
} from "lucide-react";

interface BlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string;
  thumbnail?: string;
}

const formatDate = (dateString: string) => {
  if (!dateString || dateString.length !== 8) return dateString;
  return `${dateString.slice(0, 4)}.${dateString.slice(
    4,
    6
  )}.${dateString.slice(6)}`;
};

export default function RestaurantDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);

  // [New] 블로그 더보기 상태 (초기값 6개)
  const [visibleBlogs, setVisibleBlogs] = useState(6);

  useEffect(() => {
    const wrapElement = document.querySelector(".wrap") as HTMLElement;
    if (wrapElement) wrapElement.style.overflow = "visible";
    return () => {
      if (wrapElement) wrapElement.style.overflow = "hidden";
    };
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),
          userService.getFavorites(),
        ]);

        let allRestaurants: RestaurantData[] = [];
        const myFavoriteIds = new Set<number>();

        if (restaurantsRes.status === "fulfilled") {
          allRestaurants = restaurantsRes.value.data;
        }
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        const targetId = Number(id);
        const detail = allRestaurants.find(
          (item: RestaurantData) => item.id === targetId
        );

        if (detail) {
          const mergedDetail = {
            ...detail,
            isFavorite: myFavoriteIds.has(targetId),
          };
          setRestaurant(mergedDetail);
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

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!id) return;
      try {
        setBlogLoading(true);
        const response = await api.get(`/restaurant/${id}/blogs`);
        const blogItems = response.data.items || response.data || [];

        if (Array.isArray(blogItems)) {
          setBlogs(blogItems);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        console.error("블로그 로드 실패:", error);
      } finally {
        setBlogLoading(false);
      }
    };
    fetchBlogs();
  }, [id]);

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
    const previousState = { ...restaurant };
    setRestaurant({ ...restaurant, isFavorite: !restaurant.isFavorite });

    try {
      await restaurantService.toggleFavorite(restaurant.id);
    } catch (error) {
      setRestaurant(previousState);
      alert("로그인이 필요하거나 처리에 실패했습니다.");
    }
  };

  // [New] 더보기 클릭 핸들러
  const handleLoadMoreBlogs = () => {
    setVisibleBlogs((prev) => prev + 6);
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
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500 text-white text-[11px] font-black rounded-lg uppercase tracking-widest">
                {restaurant.restCategory ?? "카테고리"}
              </div>
              {/* [New] DB 리뷰 건수 표시 */}
              {restaurant.reviewCount !== undefined &&
                restaurant.reviewCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold rounded-lg">
                    <MessageCircle size={12} className="text-yellow-400" />
                    <span>리뷰 {restaurant.reviewCount}개</span>
                  </div>
                )}
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
          <div className="lg:col-span-8 space-y-10">
            {/* 시그니처 메뉴 */}
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

            {/* 기본 정보 */}
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

            {/* 블로그 리뷰 섹션 */}
            <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                  <Info size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    생생 블로그 리뷰
                    {/* [New] 블로그 리뷰 건수 표시 */}
                    <span className="text-lg font-medium text-slate-400">
                      (Total {blogs.length})
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    다녀온 사람들의 솔직한 후기를 확인하세요
                  </p>
                </div>
              </div>

              {blogLoading ? (
                <div className="grid gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-50 h-32 rounded-3xl animate-pulse"
                    />
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p>등록된 리뷰가 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6">
                    {/* [New] visibleBlogs 개수만큼 슬라이싱 */}
                    {blogs.slice(0, visibleBlogs).map((blog, idx) => (
                      <a
                        key={idx}
                        href={blog.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col md:flex-row gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-green-200 transition-all duration-300"
                      >
                        <div className="flex-1 flex flex-col">
                          <h3
                            className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors"
                            dangerouslySetInnerHTML={{ __html: blog.title }}
                          />
                          <p
                            className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: blog.description,
                            }}
                          />
                          <div className="mt-auto flex items-center justify-between text-xs text-slate-400 font-medium pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-bold">
                                by {blog.bloggername}
                              </span>
                              <span className="w-px h-2.5 bg-slate-300"></span>
                              <span>{formatDate(blog.postdate)}</span>
                            </div>

                            <div className="flex items-center gap-1 group-hover:text-green-600 transition-colors">
                              리뷰 보러가기 <ArrowRight size={12} />
                            </div>
                          </div>
                        </div>

                        {blog.thumbnail && (
                          <div className="w-full md:w-32 h-48 md:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-200 relative order-first md:order-last">
                            <img
                              src={blog.thumbnail}
                              alt="blog thumbnail"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          </div>
                        )}
                      </a>
                    ))}
                  </div>

                  {/* [New] 더보기 버튼 (남은 리뷰가 있을 때만 표시) */}
                  {visibleBlogs < blogs.length && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={handleLoadMoreBlogs}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-green-600 transition-all duration-300 shadow-lg shadow-slate-200/50"
                      >
                        <PlusCircle size={18} />
                        <span>블로그 리뷰 더보기</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-25">
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
