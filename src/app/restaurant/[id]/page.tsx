"use client"; // 이 파일은 브라우저(클라이언트)에서 동작하는 컴포넌트임을 선언합니다. (React Hooks 사용 가능)

// --- [Imports] 필요한 도구들을 불러옵니다 ---
import { useEffect, useState } from "react"; // 상태 관리(useState)와 사이드 이펙트 처리(useEffect) 훅 불러오기
import { useParams, useRouter } from "next/navigation"; // URL의 파라미터(id)를 읽고, 페이지 이동을 하기 위한 훅
import Script from "next/script"; // 카카오맵 같은 외부 스크립트를 로드하기 위한 Next.js 전용 태그
import api from "@/api/axios"; // 서버 통신을 위해 미리 설정해둔 axios 인스턴스
import { restaurantService, userService } from "@/api/services"; // 맛집 및 유저 관련 API 함수 모음
import { RestaurantData } from "@/types/restaurant"; // 맛집 데이터의 타입 정의 (TypeScript용)
// 화면을 꾸며줄 예쁜 아이콘들을 lucide-react 라이브러리에서 가져옵니다.
import {
  Loader2, // 로딩 스피너
  MapPin, // 지도 핀
  Utensils, // 포크와 나이프 (메뉴 아이콘)
  Phone, // 전화기
  Clock, // 시계
  ChevronLeft, // 뒤로가기 화살표
  Heart, // 하트 (찜하기)
  Navigation, // 길찾기 아이콘
  ExternalLink, // 외부 링크 아이콘
  Info, // 정보(i) 아이콘
  PhoneOff, // 전화 금지 아이콘
  ArrowRight, // 오른쪽 화살표
  MessageCircle, // 말풍선 (리뷰)
  PlusCircle,
  ArrowLeft, // 더보기 (+) 아이콘
} from "lucide-react";

import makerImg from "../../../../public/images/mapMaker.png"; // 커스텀 마커 이미지

// --- [Interface] 블로그 리뷰 데이터의 모양을 정의합니다 ---
interface BlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string;
  thumbnail?: string; // 썸네일은 없을 수도 있으니 선택 사항(?)으로 정의
}

// --- [Helper Function] 날짜 포맷팅 함수 ---
// "20231025" 같은 문자열을 받아서 "2023.10.25" 형태로 예쁘게 바꿔줍니다.
const formatDate = (dateString: string) => {
  // 날짜 데이터가 없거나 8자리가 아니면 그대로 반환 (에러 방지)
  if (!dateString || dateString.length !== 8) return dateString;
  // 연.월.일 형식으로 잘라서 반환
  return `${dateString.slice(0, 4)}.${dateString.slice(
    4,
    6
  )}.${dateString.slice(6)}`;
};

// ==================================================================
// [Main Component] 맛집 상세 페이지 컴포넌트 시작!
// ==================================================================
export default function RestaurantDetail() {
  // 1. URL에서 맛집 ID 가져오기 (예: /restaurant/10 -> id는 10)
  const params = useParams();
  const id = params?.id as string;

  // 2. 페이지 이동을 위한 라우터 객체 가져오기
  const router = useRouter();

  // --- [State] 화면의 상태를 관리하는 변수들 ---
  // 맛집 상세 정보 (처음엔 데이터가 없으니 null)
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  // 화면 로딩 중인지 여부 (처음엔 true로 시작해서 로딩바를 보여줌)
  const [loading, setLoading] = useState(true);
  // 블로그 리뷰 목록
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  // 블로그 로딩 중인지 여부
  const [blogLoading, setBlogLoading] = useState(true);

  // [New] 블로그 리스트 더보기 기능 상태 (처음에는 6개만 보여줌)
  const [visibleBlogs, setVisibleBlogs] = useState(6);

  // 🔥 [추가됨] 변환된 좌표(위도, 경도)를 저장할 상태
  // 길찾기 버튼에 정확한 도착지를 넣어주기 위해 사용합니다.
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(
    null
  );

  // --- [Effect 1] 레이아웃 스타일 조정 ---
  // 컴포넌트가 마운트될 때(켜질 때) .wrap 클래스를 가진 요소의 스크롤 설정을 변경합니다.
  useEffect(() => {
    const wrapElement = document.querySelector(".wrap") as HTMLElement;
    // .wrap 요소가 있다면 overflow를 visible로 바꿔서 스크롤이 잘 되게 함
    if (wrapElement) wrapElement.style.overflow = "visible";

    // cleanup 함수: 컴포넌트가 꺼질 때 원래대로(hidden) 돌려놓음
    return () => {
      if (wrapElement) wrapElement.style.overflow = "hidden";
    };
  }, []);

  // --- [Effect 2] 맛집 상세 정보 불러오기 ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true); // 로딩 시작!

        // [중요] Promise.allSettled를 사용해 두 개의 API 요청을 동시에 보냅니다.
        // 1. 전체 맛집 리스트 가져오기
        // 2. 내가 찜한(즐겨찾기) 목록 가져오기
        const [restaurantsRes, favoritesRes] = await Promise.allSettled([
          restaurantService.getRestaurants(),
          userService.getFavorites(),
        ]);

        let allRestaurants: RestaurantData[] = [];
        const myFavoriteIds = new Set<number>(); // 찜한 ID들을 빠르게 찾기 위해 Set 자료구조 사용

        // 맛집 리스트 가져오기 성공했으면 변수에 저장
        if (restaurantsRes.status === "fulfilled") {
          allRestaurants = restaurantsRes.value.data;
        }
        // 찜 목록 가져오기 성공했으면 Set에 ID만 쏙쏙 뽑아서 저장
        if (favoritesRes.status === "fulfilled") {
          const favoriteList = favoritesRes.value.data;
          if (Array.isArray(favoriteList)) {
            favoriteList.forEach((item: any) => myFavoriteIds.add(item.id));
          }
        }

        // 현재 URL의 id와 일치하는 맛집을 찾습니다.
        const targetId = Number(id);
        const detail = allRestaurants.find(
          (item: RestaurantData) => item.id === targetId
        );

        if (detail) {
          // 찾은 맛집 정보에 '내가 찜했는지 여부(isFavorite)'를 합칩니다.
          const mergedDetail = {
            ...detail,
            isFavorite: myFavoriteIds.has(targetId), // Set에 id가 있으면 true, 없으면 false
          };
          setRestaurant(mergedDetail); // 상태 업데이트 -> 화면에 맛집 정보 표시됨
        } else {
          // 만약 해당하는 맛집이 없으면 목록 페이지로 쫓아냅니다.
          router.push("/restaurant");
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false); // 성공하든 실패하든 로딩 끝!
      }
    };

    // id가 있을 때만 데이터 요청 실행
    if (id) fetchDetail();
  }, [id, router]); // id나 router가 바뀌면 다시 실행

  // --- [Effect 3] 블로그 리뷰 불러오기 ---
  useEffect(() => {
    const fetchBlogs = async () => {
      if (!id) return; // id 없으면 중단
      try {
        setBlogLoading(true); // 블로그 로딩 시작
        // 백엔드 API 호출: /restaurant/{id}/blogs
        const response = await api.get(`/restaurant/${id}/blogs`);
        // 응답 데이터 구조에 따라 배열을 추출 (items 안에 있거나, 바로 data이거나)
        const blogItems = response.data.items || response.data || [];

        if (Array.isArray(blogItems)) {
          setBlogs(blogItems); // 상태 업데이트
        } else {
          setBlogs([]); // 배열 아니면 빈 배열로 초기화
        }
      } catch (error) {
        console.error("블로그 로드 실패:", error);
      } finally {
        setBlogLoading(false); // 로딩 끝
      }
    };
    fetchBlogs();
  }, [id]); // id가 바뀔 때마다 실행

  // --- [Function] 카카오맵 초기화 함수 ---
  const initMap = (address: string, name: string) => {
    // window 객체에서 kakao를 꺼내옵니다. (스크립트로 로드됨)
    const { kakao } = window as any;
    if (!kakao || !kakao.maps) return; // 아직 로드 안 됐으면 중단

    // 카카오맵 라이브러리가 로드되면 실행
    kakao.maps.load(() => {
      const container = document.getElementById("map"); // 지도를 그릴 HTML 요소 찾기
      if (!container) return;

      const options = {
        center: new kakao.maps.LatLng(36.3504, 127.3845), // 기본 중심 좌표 (대전 시청 부근)
        level: 3, // 확대 레벨
      };
      // 지도 생성
      const map = new kakao.maps.Map(container, options);
      // 주소-좌표 변환 객체 생성
      const geocoder = new kakao.maps.services.Geocoder();

      // 주소로 좌표를 검색합니다.
      geocoder.addressSearch(address, (result: any, status: any) => {
        // 검색 성공 시
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

          // 🔥 [중요] 변환된 좌표를 State에 저장합니다. (길찾기 버튼에서 사용)
          setCoords({ lat: result[0].y, lng: result[0].x });

          var imageSrc = makerImg.src, // 마커이미지의 주소입니다
            imageSize = new kakao.maps.Size(32, 34), // 마커이미지의 크기입니다
            imageOption = { offset: new kakao.maps.Point(16, 34) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
          var markerImage = new kakao.maps.MarkerImage(
            imageSrc,
            imageSize,
            imageOption
          );

          // 지도에 마커(핀)를 표시합니다.
          new kakao.maps.Marker({
            map,
            position: coords,
            image: markerImage,
          });

          // 마커 위에 가게 이름을 띄워줍니다 (인포윈도우).
          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;color:#334155;">${name}</div>`,
          });
          infowindow.open(map);

          // 지도의 중심을 해당 좌표로 이동시킵니다.
          map.setCenter(coords);
        }
      });
    });
  };

  // --- [Effect 4] 지도 그리기 트리거 ---
  useEffect(() => {
    // 맛집 정보(주소, 이름)가 있고 로딩이 끝났으면 지도를 그립니다.
    if (restaurant && restaurant.address && restaurant.name && !loading) {
      // 0.3초 뒤에 실행 (화면 렌더링이 확실히 끝난 뒤 실행하기 위해)
      const timer = setTimeout(
        () => initMap(restaurant.address as string, restaurant.name),
        300
      );
      return () => clearTimeout(timer); // 정리 함수
    }
  }, [restaurant, loading]);

  // --- [Handler] 찜하기(하트) 버튼 클릭 핸들러 ---
  const handleFavoriteClick = async () => {
    if (!restaurant) return;

    // [낙관적 업데이트] 서버 응답을 기다리지 않고 UI부터 바꿈 (사용자 경험 향상)
    const previousState = { ...restaurant }; // 실패할 경우를 대비해 현재 상태 백업
    setRestaurant({ ...restaurant, isFavorite: !restaurant.isFavorite }); // 하트 토글

    try {
      // 서버에 찜하기 토글 요청 전송
      await restaurantService.toggleFavorite(restaurant.id);
    } catch (error) {
      // 실패하면 아까 백업해둔 상태로 원상복구
      setRestaurant(previousState);
      alert("로그인이 필요하거나 처리에 실패했습니다.");
    }
  };

  // --- [Handler] 블로그 더보기 버튼 핸들러 ---
  const handleLoadMoreBlogs = () => {
    // 현재 보이는 개수에 6을 더함
    setVisibleBlogs((prev) => prev + 6);
  };

  // -----------------------------------------------------------
  // [Render] 화면 그리기 시작!
  // -----------------------------------------------------------

  // 1. 로딩 중일 때 보여줄 화면
  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12 mb-4" />
        <p className="text-slate-500 font-bold tracking-tight">
          맛집 정보를 불러오는 중...
        </p>
      </div>
    );

  // 맛집 데이터가 없으면 아무것도 안 그림 (리다이렉트 되기 전 찰나)
  if (!restaurant) return null;

  // 전화번호가 유효한지 체크 (빈 문자열이 아닌지)
  const isPhoneAvailable = !!restaurant.phone && restaurant.phone.trim() !== "";

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24">
      {/* 카카오맵 SDK 스크립트 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
        onLoad={() => {}}
      />
      {/* === [Section 1] 히어로 섹션 (배경 이미지 & 타이틀) === */}
      <div className="relative h-[400px] md:h-[550px] w-full">
        {/* 배경 이미지 설정 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            // 이미지가 있으면 해당 이미지, 없으면 기본색
            backgroundImage: restaurant.imagePath
              ? `url(/images/restaurantImages/${restaurant.imagePath})`
              : "none",
            backgroundColor: "#1e293b",
          }}
        >
          {/* 어두운 그라데이션 오버레이 (글씨 잘 보이게) */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="absolute top-8 left-6 md:left-12 z-20">
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

        {/* 하단 타이틀 정보 영역 */}
        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="flex items-start sm:items-center gap-3 mb-4">
              {/* 카테고리 뱃지 */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500 text-white text-[11px] font-black rounded-lg uppercase tracking-widest">
                {restaurant.restCategory ?? "카테고리"}
              </div>
              {/* [New] DB 리뷰 건수 표시 (0보다 클 때만) */}
              {restaurant.reviewCount !== undefined &&
                restaurant.reviewCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold rounded-lg">
                    <MessageCircle size={12} className="text-yellow-400" />
                    <span>리뷰 {restaurant.reviewCount}개</span>
                  </div>
                )}
            </div>

            {/* 가게 이름 */}
            <h2 className="text-3xl md:text-7xl font-black text-white mb-6 tracking-tight">
              {restaurant.name}
            </h2>
            {/* 가게 주소 */}
            <div className="flex items-center gap-2 text-white/80 font-semibold text-lg">
              <MapPin size={22} className="text-orange-400 shrink-0" />
              <span>{restaurant.address ?? "주소 정보 없음"}</span>
            </div>
          </div>
        </div>
      </div>
      {/* === [Section 2] 메인 컨텐츠 (상세 정보) === */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* 왼쪽 컬럼 (8/12) */}
          <div className="space-y-5 lg:col-span-8 md:space-y-10">
            {/* (1) 시그니처 메뉴 카드 */}
            <div className="bg-white p-5 sm:p-10 rounded-[2.5rem]  shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-start sm:items-center gap-3 mb-10">
                <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                  <Utensils className="w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    대표 시그니처
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    이곳에서 꼭 먹어봐야 할 메뉴
                  </p>
                </div>
              </div>
              <div className="relative bg-slate-50 p-5 sm:p-10 rounded-[2.5rem] border border-slate-100 overflow-hidden group">
                <div className="relative z-10">
                  <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-3 block">
                    Signature Menu
                  </span>
                  <p className="text-2xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    {restaurant.bestMenu ?? "정보가 없습니다."}
                  </p>
                  <p className="text-slate-500 sm:text-lg leading-relaxed max-w-2xl font-medium">
                    {restaurant.name}의 장인정신이 담긴 최고의 맛을
                    경험해보세요.
                  </p>
                </div>
                {/* 배경 장식 텍스트 */}
                <div className="absolute -right-6 -bottom-8 text-slate-200/50 text-9xl font-black italic select-none group-hover:text-orange-100/50 transition-colors duration-500">
                  MENU
                </div>
              </div>
            </div>

            {/* (2) 기본 정보 카드 (카테고리 & 연락처) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 카테고리 정보 */}
              <div className="bg-white p-5 sm:p-10 rounded-[2.5rem]  border border-slate-100 shadow-sm flex items-center gap-5">
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
              {/* 연락처 정보 */}
              <div className="bg-white p-5 sm:p-10 rounded-[2.5rem]  border border-slate-100 shadow-sm flex items-center gap-5">
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

            {/* (3) 블로그 리뷰 섹션 */}
            <div className="bg-white p-5 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col h-auto overflow-hidden relative">
              <div className="flex items-start sm:items-center gap-3 mb-10">
                <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                  <Info size={28} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-900 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    생생 블로그 리뷰
                    {/* [New] 블로그 총 개수 표시 */}
                    <span className="text-lg font-medium text-slate-400">
                      (Total {blogs.length >= 100 ? "100+" : blogs.length})
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    다녀온 사람들의 솔직한 후기를 확인하세요
                  </p>
                </div>
              </div>

              {/* 블로그 데이터 로딩 중... */}
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
                // 리뷰가 없을 때
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p>등록된 리뷰가 없습니다.</p>
                </div>
              ) : (
                // 리뷰가 있을 때
                <>
                  <div className="grid gap-6 overflow-hidden">
                    {/* [New] visibleBlogs 개수만큼 잘라서 보여줌 */}
                    {blogs.slice(0, visibleBlogs).map((blog, idx) => (
                      <a
                        key={idx}
                        href={blog.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" group flex flex-col md:flex-row gap-2 sm:gap-6 sm:p-6 sm:bg-slate-50 sm:rounded-3xl sm:border sm:border-slate-100 hover:bg-white hover:shadow-lg hover:border-green-200 transition-all duration-300"
                      >
                        <div className="flex-1 flex flex-col">
                          {/* 블로그 제목 (HTML 태그가 포함되어 있어서 dangerouslySetInnerHTML 사용) */}
                          <h3
                            className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors"
                            dangerouslySetInnerHTML={{
                              __html: blog.title,
                            }}
                          />
                          {/* 블로그 요약 내용 */}
                          <p
                            className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: blog.description,
                            }}
                          />
                          {/* 하단 정보 (작성자, 날짜, 링크) */}
                          <div className="hidden mt-auto sm:flex items-center justify-between text-xs text-slate-400 font-medium pt-2">
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

                        {/* 블로그 썸네일 이미지 (있을 경우만) */}
                        {blog.thumbnail && (
                          <div className="w-full md:w-32 h-48 md:h-32 rounded-2xl overflow-hidden bg-slate-200 relative order-first md:order-last">
                            <img
                              src={blog.thumbnail}
                              alt="blog thumbnail"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                              onError={
                                (e) => (e.currentTarget.style.display = "none") // 이미지 깨지면 숨김
                              }
                            />
                          </div>
                        )}
                      </a>
                    ))}
                  </div>

                  {/* [New] 더보기 버튼 (아직 안 보여준 리뷰가 남았을 때만 표시) */}
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
            </div>
          </div>

          {/* 오른쪽 컬럼 (사이드바) (4/12) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 sm:p-10 rounded-[2.5rem]  shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-25">
              {/* 버튼 그룹 (찜하기 / 전화걸기) */}
              <div className="flex flex-col gap-3 mb-8">
                {/* 찜하기 버튼 */}
                <button
                  onClick={handleFavoriteClick}
                  className={`w-full py-4.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    restaurant.isFavorite
                      ? "bg-red-500 text-white shadow-lg shadow-red-200" // 찜 했을 때
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200" // 찜 안 했을 때
                  }`}
                >
                  <Heart
                    size={20}
                    className={restaurant.isFavorite ? "fill-white" : ""} // 채워진 하트
                  />
                  {restaurant.isFavorite
                    ? "나의 맛집 저장됨"
                    : "맛집 리스트 추가"}
                </button>

                {/* 전화걸기 버튼 */}
                <a
                  href={isPhoneAvailable ? `tel:${restaurant.phone}` : "#"}
                  onClick={(e) => !isPhoneAvailable && e.preventDefault()} // 번호 없으면 클릭 방지
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

              {/* 지도 및 영업시간 영역 */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <Navigation size={20} className="text-blue-500" />
                    오시는 길
                  </h3>
                  {/* 카카오맵 크게보기 링크 */}
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

                {/* 카카오맵이 그려질 컨테이너 */}
                <div
                  id="map"
                  className="w-full h-[250px] rounded-[2.5rem]  bg-slate-100 border border-slate-100 overflow-hidden shadow-inner"
                />

                {/* 영업시간 정보 */}
                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white">
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

                {/* 🔥 [수정됨] 카카오맵 길찾기 버튼 */}
                {/* coords가 있으면 link/to(정확한 좌표), 없으면 link/search(검색) */}
                <a
                  href={
                    coords
                      ? `https://map.kakao.com/link/to/${encodeURIComponent(
                          restaurant.name ?? ""
                        )},${coords.lat},${coords.lng}`
                      : `https://map.kakao.com/link/search/${encodeURIComponent(
                          restaurant.address || restaurant.name || ""
                        )}`
                  }
                  target="_blank"
                  className="w-full py-5 bg-[#FFEB00] text-[#3C1E1E] rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md"
                >
                  <Navigation size={18} />{" "}
                  {coords ? "카카오맵 길찾기" : "카카오맵 길찾기"}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// 1. 현실적인 흐름 (Context Flow)
// 이 페이지에 접속했을 때 벌어지는 일을 순서대로 상상해 보세요.

// 페이지 진입 & 로딩: 사용자가 주소창에 /restaurant/10을 입력하거나 목록에서 클릭해서 들어옵니다. 데이터가 준비될 때까지 화면 중앙에 뺑글뺑글 도는 로딩 스피너가 나타납니다.

// 데이터 병렬 호출 (Promise.all):

// 동시에 서버에게 두 가지를 물어봅니다. "이 맛집 정보 줘!" & "내가 찜한 목록 줘!"

// 그리고 블로그 리뷰 데이터도 따로 요청합니다.

// 화면 렌더링 (Hero Section):

// 데이터가 도착하면 로딩이 사라지고, 멋진 배경 이미지와 함께 가게 이름, 주소, 카테고리가 대문짝만하게 뜹니다.

// 지도 생성 (Kakao Map):

// 가게 주소(예: "서울시 강남구...")를 위도/경도 좌표로 변환(Geocoding)합니다.
// 변환된 좌표를 이용해 오른쪽 아래에 카카오맵을 띄우고 핀(마커)을 꽂아줍니다.
// 동시에 길찾기 버튼의 링크도 정확한 도착지 좌표로 업데이트합니다.

// 상호작용:

// 찜하기: 하트 버튼을 누르면 즉시 빨간 하트로 바뀌고(낙관적 업데이트), 서버에 저장을 요청합니다.

// 블로그 더보기: 처음엔 블로그 리뷰가 6개만 보이다가, "더보기" 버튼을 누르면 6개씩 밑으로 쫘르륵 더 펼쳐집니다.

// 전화 걸기: 모바일에서 전화 버튼을 누르면 바로 통화 화면으로 넘어갑니다.
