"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { tourService } from "@/api/services";
import { Tour } from "@/types/tour";
import { MapPin, Phone, X, ChevronLeft, Map as MapIcon } from "lucide-react";
import Pagination from "@/components/common/Pagination";

export default function TourPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("전체");

  // --- 페이지네이션 상태 추가 ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 한 페이지에 8개씩 노출

  // 1. 데이터 로드 (서비스 레이어 활용)
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await tourService.getTourCourses();
        setTours(response.data);
        setFilteredTours(response.data);
      } catch (error) {
        console.error("데이터 호출 실패:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchTours();
  }, []);

  const initMap = (address: string, name: string) => {
    const { kakao } = window as any;
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("map");
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
          content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;color:#1e293b;">${name}</div>`,
        });
        infowindow.open(map, new kakao.maps.Marker({ map, position: coords }));
        map.setCenter(coords);
      }
    });
  };

  useEffect(() => {
    if (selectedTour) {
      const timer = setTimeout(() => {
        initMap(selectedTour.address, selectedTour.name);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTour]);

  useEffect(() => {
    if (selectedTour) {
      const scrollY = window.scrollY;
      document.body.style.cssText = `position: fixed; top: -${scrollY}px; overflow-y: scroll; width: 100%;`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.cssText = "";
    };
  }, [selectedTour]);

  const cleanDescription = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === "전체") {
      setFilteredTours(tours);
    } else {
      setFilteredTours(tours.filter((tour) => tour.address.includes(category)));
    }
  };

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const currentItems = filteredTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = ["전체", "대덕구", "동구", "서구", "유성구", "중구"];

  if (loading && tours.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-24">
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
        onLoad={() => {
          (window as any).kakao.maps.load(() => console.log("Kakao Map Ready"));
        }}
      />

      <div className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-green-50 text-green-700 rounded-full text-xs font-bold tracking-tight w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            DAEJEON TOUR
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-10 tracking-tight">
            맞춤형 <span className="text-green-500">대전 명소</span> 큐레이션
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {currentItems.map((tour, index) => (
            <div
              key={`${tour.id}-${index}`}
              className="group cursor-pointer"
              onClick={() => setSelectedTour(tour)}
            >
              <div className="relative h-72 overflow-hidden rounded-4xl bg-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="mt-5">
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors truncate">
                  {tour.name}
                </h2>
                <div className="flex items-center text-slate-400 text-sm mt-1 font-medium">
                  <MapPin className="w-4 h-4 mr-1 text-green-500" />{" "}
                  {tour.address.split(" ").slice(0, 2).join(" ")}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          themeColor="green"
        />
      </div>

      {selectedTour && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-6"
          onClick={() => setSelectedTour(null)}
        >
          <div
            className="bg-white w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 flex justify-between items-center p-6 bg-white border-b border-slate-50">
              <button
                onClick={() => setSelectedTour(null)}
                className="flex items-center text-slate-500 hover:text-green-600 font-bold transition-all"
              >
                <ChevronLeft className="w-6 h-6 mr-1" /> 목록보기
              </button>
              <span className="font-bold text-slate-900 text-lg truncate px-4">
                {selectedTour.name}
              </span>
              <button
                onClick={() => setSelectedTour(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 md:p-12 space-y-10 border-r border-slate-50">
                  <div className="rounded-[2.5rem] overflow-hidden shadow-xl aspect-square lg:aspect-video">
                    <img
                      src={selectedTour.image}
                      className="w-full h-full object-cover"
                      alt={selectedTour.name}
                    />
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <span className="w-2 h-8 bg-green-500 rounded-full"></span>{" "}
                      상세 소개
                    </h4>
                    <p className="text-slate-600 leading-loose whitespace-pre-wrap text-lg font-medium">
                      {cleanDescription(selectedTour.description)}
                    </p>
                  </div>
                </div>
                <div className="p-6 md:p-12 bg-slate-50/50 space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <span className="w-2 h-8 bg-green-500 rounded-full"></span>{" "}
                      위치 정보
                    </h4>
                    <div
                      id="map"
                      className="w-full h-[350px] rounded-[2.5rem] bg-white border border-slate-200 shadow-md"
                    ></div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <MapPin className="text-green-500 shrink-0 mt-1" />
                      <span className="font-bold text-slate-700 leading-relaxed">
                        {selectedTour.address}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href={`https://map.kakao.com/link/search/${encodeURIComponent(
                        selectedTour.address
                      )}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 py-5 bg-[#FFEB00] text-[#3C1E1E] rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <MapIcon size={20} /> 카카오맵 길찾기
                    </a>
                    <div className="flex flex-col justify-center items-center py-4 bg-slate-900 text-white rounded-2xl shadow-lg">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                        Contact
                      </span>
                      <span className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Phone size={18} className="text-green-400" />{" "}
                        {selectedTour.phone || "정보 없음"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
