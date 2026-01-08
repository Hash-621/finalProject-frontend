// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (지도 로드, useEffect, useState 등을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 훅 임포트] ---
import { useEffect, useState } from "react"; // 리액트 훅 (상태, 효과)
import { useParams, useRouter } from "next/navigation"; // 라우팅 관련 훅
import Script from "next/script"; // 외부 스크립트(카카오맵) 로드용 컴포넌트
import api from "@/api/axios"; // API 호출 모듈
import { restaurantService, userService } from "@/api/services"; // 서비스 함수들
import { RestaurantData } from "@/types/restaurant"; // 데이터 타입 정의
// 아이콘 라이브러리
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
  ImageIcon,
} from "lucide-react";

// --- [타입 정의 및 유틸리티 함수] ---

// 블로그 리뷰 데이터 타입
interface BlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string;
  thumbnail?: string;
}

// HTML 태그 제거 함수 (블로그 제목/내용 정리용)
const cleanText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/(<([^>]+)>)/gi, "") // 태그 삭제
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
};

// 날짜 포맷팅 함수 (YYYYMMDD -> YYYY.MM.DD)
const formatDate = (dateString: string) => {
  if (!dateString || dateString.length !== 8) return dateString;
  return `${dateString.slice(0, 4)}.${dateString.slice(
    4,
    6
  )}.${dateString.slice(6)}`;
};

// --- [메인 상세 페이지 컴포넌트] ---
export default function RestaurantDetail() {
  const params = useParams(); // URL 파라미터 가져오기
  const id = params?.id as string; // 맛집 ID 추출
  const router = useRouter(); // 라우터 객체

  // --- [상태 관리] ---
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null); // 맛집 상세 데이터
  const [loading, setLoading] = useState(true); // 맛집 데이터 로딩 상태
  const [blogs, setBlogs] = useState<BlogItem[]>([]); // 블로그 리뷰 목록
  const [blogLoading, setBlogLoading] = useState(true); // 블로그 로딩 상태

  // --- [스크롤 제어] ---
  // 페이지 진입 시 전체 스크롤 허용 (Sticky 사이드바가 잘 동작하도록)
  useEffect(() => {
    const wrapElement = document.querySelector(".wrap") as HTMLElement;
    if (wrapElement) wrapElement.style.overflow = "visible";
    return () => {
      if (wrapElement) wrapElement.style.overflow = "hidden";
    };
  }, []);

  // --- [1. 맛집 정보 로드 (병렬 처리)] ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true); // 로딩 시작

        // 전체 맛집 목록과 내 즐겨찾기 목록을 동시에 호출
        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),
          userService.getFavorites(),
        ]);

        let allRestaurants: RestaurantData[] = [];
        const myFavoriteIds = new Set<number>();

        // 응답 데이터 정리
        if (restaurantsRes.status === "fulfilled") {
          allRestaurants = restaurantsRes.value.data;
        }
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        // 현재 ID에 해당하는 맛집 찾기
        const targetId = Number(id);
        const detail = allRestaurants.find(
          (item: RestaurantData) => item.id === targetId
        );

        if (detail) {
          // 데이터 병합 (기본 정보 + 즐겨찾기 여부)
          const mergedDetail = {
            ...detail,
            isFavorite: myFavoriteIds.has(targetId),
          };
          setRestaurant(mergedDetail);
        } else {
          // 못 찾으면 목록으로 이동
          router.push("/restaurant");
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };
    if (id) fetchDetail();
  }, [id, router]);

  // --- [2. 블로그 리뷰 로드] ---
  useEffect(() => {
    const fetchBlogs = async () => {
      if (!id) return;
      try {
        setBlogLoading(true);
        // 서버 API를 통해 관련 블로그 글 크롤링 데이터 요청
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

  // --- [지도 초기화 함수] ---
  const initMap = (address: string, name: string) => {
    const { kakao } = window as any;
    if (!kakao || !kakao.maps) return; // SDK 안 깔렸으면 중단

    kakao.maps.load(() => {
      const container = document.getElementById("map"); // 지도를 담을 div
      if (!container) return;

      const options = {
        center: new kakao.maps.LatLng(36.3504, 127.3845), // 초기 중심 좌표 (대전)
        level: 3, // 확대 레벨
      };
      const map = new kakao.maps.Map(container, options); // 지도 생성
      const geocoder = new kakao.maps.services.Geocoder(); // 주소 검색 객체

      // 주소로 좌표 검색
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

          // 마커 표시
          new kakao.maps.Marker({ map, position: coords });

          // 인포윈도우(말풍선) 표시
          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;color:#334155;">${name}</div>`,
          });
          infowindow.open(map);

          // 지도의 중심을 결과값으로 받은 위치로 이동
          map.setCenter(coords);
        }
      });
    });
  };

  // --- [지도 실행 트리거] ---
  // 맛집 데이터가 로드되면 지도를 초기화합니다.
  useEffect(() => {
    if (restaurant && restaurant.address && restaurant.name && !loading) {
      // DOM 렌더링 시간 벌어주기 위해 약간 지연
      const timer = setTimeout(
        () => initMap(restaurant.address as string, restaurant.name),
        300
      );
      return () => clearTimeout(timer);
    }
  }, [restaurant, loading]);

  // --- [즐겨찾기 토글 핸들러] ---
  const handleFavoriteClick = async () => {
    if (!restaurant) return;
    const previousState = { ...restaurant }; // 롤백용 백업

    // 낙관적 업데이트 (화면 먼저 갱신)
    setRestaurant({ ...restaurant, isFavorite: !restaurant.isFavorite });

    try {
      await restaurantService.toggleFavorite(restaurant.id); // 서버 요청
    } catch (error) {
      setRestaurant(previousState); // 실패 시 원복
      alert("로그인이 필요하거나 처리에 실패했습니다.");
    }
  };

  // --- [화면 렌더링 1: 로딩 중] ---
  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12 mb-4" />
        <p className="text-slate-500 font-bold tracking-tight">
          맛집 정보를 불러오는 중...
        </p>
      </div>
    );

  // --- [화면 렌더링 2: 데이터 없음] ---
  if (!restaurant) return null;

  const isPhoneAvailable = !!restaurant.phone && restaurant.phone.trim() !== "";

  // --- [화면 렌더링 3: 정상 출력] ---
  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24">
      {/* 카카오맵 SDK 스크립트 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
        onLoad={() => {}}
      />

      {/* 1. 히어로 섹션 (배경 이미지 + 제목) */}
      <div className="relative h-[400px] md:h-[550px] w-full">
        {/* 배경 이미지 */}
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

        {/* 뒤로가기 버튼 */}
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

        {/* 타이틀 정보 */}
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

      {/* 2. 메인 컨텐츠 (상세 정보 + 사이드바) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* 왼쪽 컬럼 (8칸) - 시그니처 메뉴, 블로그 리뷰 */}
          <div className="lg:col-span-8 space-y-10">
            {/* 시그니처 메뉴 섹션 */}
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
                {/* 배경 장식 텍스트 */}
                <div className="absolute -right-6 -bottom-8 text-slate-200/50 text-9xl font-black italic select-none group-hover:text-orange-100/50 transition-colors duration-500">
                  MENU
                </div>
              </div>
            </section>

            {/* 기본 정보 (카테고리, 연락처) */}
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
                  <h2 className="text-2xl font-black text-slate-900">
                    생생 블로그 리뷰
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    다녀온 사람들의 솔직한 후기를 확인하세요
                  </p>
                </div>
              </div>

              {blogLoading ? (
                // 로딩 중일 때 스켈레톤
                <div className="grid gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-50 h-32 rounded-3xl animate-pulse"
                    />
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                // 리뷰 없을 때
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p>등록된 리뷰가 없습니다.</p>
                </div>
              ) : (
                // 리뷰 목록 (최대 5개)
                <div className="grid gap-6">
                  {blogs.slice(0, 5).map((blog, idx) => (
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
              )}
            </section>
          </div>

          {/* 오른쪽 사이드바 (4칸) - 즐겨찾기, 지도 */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-25">
              <div className="flex flex-col gap-3 mb-8">
                {/* 즐겨찾기 버튼 */}
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
                {/* 전화걸기 버튼 */}
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

              {/* 지도 및 영업시간 섹션 */}
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
                {/* 지도 컨테이너 (initMap에 의해 채워짐) */}
                <div
                  id="map"
                  className="w-full h-[250px] rounded-4xl bg-slate-100 border border-slate-100 overflow-hidden shadow-inner"
                />
                {/* 영업시간 정보 */}
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
                {/* 카카오맵 길찾기 버튼 */}
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

      {/* 3. 하단 푸터 (목록 이동 버튼) */}
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

// 1. 초기 로드 및 데이터 수집 (Mount)

// 컴포넌트 실행과 동시에 로딩 스피너가 나타납니다.

// useEffect가 실행되어 두 가지 데이터를 동시에 가져옵니다.

// 맛집 상세 정보: 즐겨찾기 여부까지 확인하여 데이터를 완성합니다.

// 블로그 리뷰: "성심당 후기" 등으로 검색된 최신 블로그 글들을 긁어옵니다.

// 2. 지도 생성 (Map Init)

// 맛집 데이터(address, name)가 준비되면 initMap 함수가 실행됩니다.

// 카카오맵 SDK를 사용하여 해당 주소의 좌표를 찾고, 지도 위에 마커와 말풍선을 그립니다.

// 3. 화면 렌더링 (Rendering)

// 로딩이 끝나면 멋진 배경 이미지와 함께 맛집의 이름, 시그니처 메뉴, 블로그 리뷰들이 화면에 꽉 차게 나타납니다.

// 우측 사이드바에는 지도가 표시되어 위치를 바로 알 수 있습니다.

// 4. 상호작용 (Interaction)

// 즐겨찾기: 하트 버튼을 누르면 즉시 빨간색으로 바뀌며 '나의 맛집'에 저장됩니다.

// 리뷰 보기: 블로그 카드를 클릭하면 새 탭에서 해당 블로그 원문을 볼 수 있습니다.

// 길찾기: '카카오맵 길찾기' 버튼을 누르면 바로 길찾기 화면으로 연결됩니다.
