"use client";

import {
  useKakaoLoader,
  Map,
  MapMarker,
  MarkerClusterer,
  Roadview,
} from "react-kakao-maps-sdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hospital, HospitalResponse } from "@/types/hospital";
import api from "@/api/axios";

// Lucid 아이콘으로 변경
import {
  X,
  Camera,
  MapPin,
  LayoutGrid,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";

export default function HospitalMap() {
  const router = useRouter();

  const [loading, error] = useKakaoLoader({
    appkey: "be76d4639aed306a8922278ef72751be",
    libraries: ["services", "clusterer"],
  });

  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [isRoadviewOpen, setIsRoadviewOpen] = useState(false);
  const [roadviewPos, setRoadviewPos] = useState({ lat: 0, lng: 0 });
  const [isDataFetching, setIsDataFetching] = useState(true);

  useEffect(() => {
    if (loading || error) return;
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services)
      return;

    const fetchAndGeocodeHospitals = async () => {
      try {
        setIsDataFetching(true);
        const response = await api.get("/hospital");
        const dbData: HospitalResponse[] = response.data;
        if (!dbData || dbData.length === 0) return;

        const geocoder = new window.kakao.maps.services.Geocoder();
        const processedData: Hospital[] = [];
        const categorySet = new Set<string>();

        const promises = dbData.map((item) => {
          return new Promise<void>((resolve) => {
            geocoder.addressSearch(item.address, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                processedData.push({
                  id: item.id,
                  name: item.name,
                  category: item.treatCategory,
                  address: item.address,
                  lat: Number(result[0].y),
                  lng: Number(result[0].x),
                });
                categorySet.add(item.treatCategory);
              }
              resolve();
            });
          });
        });

        await Promise.all(promises);
        setHospitals(processedData);
        setFilteredHospitals(processedData);
        setCategories(Array.from(categorySet));
      } catch (err) {
        console.error("데이터 로드 중 오류:", err);
      } finally {
        setIsDataFetching(false);
      }
    };
    fetchAndGeocodeHospitals();
  }, [loading, error]);

  if (loading || isDataFetching) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25"></div>

          <Loader2 className="animate-spin text-green-500 w-16 h-16 relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-slate-800 font-extrabold text-2xl tracking-tight">
            전문의 병원 정보를{" "}
            <span className="text-green-600">불러오는 중</span>
          </p>
          <p className="text-slate-500 font-medium">
            최적의 의료기관을 찾기 위해 지도를 구성하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-slate-800 font-bold text-lg">지도 로드 실패</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-green-600 font-bold"
        >
          새로고침
        </button>
      </div>
    );
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedMarkerId(null);
    let newFiltered =
      category === "전체"
        ? hospitals
        : hospitals.filter((h) => h.category === category);
    setFilteredHospitals(newFiltered);

    if (map && newFiltered.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      newFiltered.forEach((h) =>
        bounds.extend(new window.kakao.maps.LatLng(h.lat, h.lng))
      );
      map.setBounds(bounds);
    }
  };

  const handleOpenRoadview = (hospital: Hospital) => {
    setRoadviewPos({ lat: hospital.lat, lng: hospital.lng });
    setIsRoadviewOpen(true);
  };

  return (
    <div className="w-full bg-[#f8fafc] py-12 sm:px-6 lg:px-8 min-h-screen">
      <div className="w-full mx-auto px-4 md:max-w-7xl lg:px-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              REAL-TIME MAP
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              대전{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">
                전문의 병원
              </span>{" "}
              파인더
            </h2>
            <p className="text-slate-500 font-medium">
              내 위치에서 가장 가까운 최적의 의료기관을 찾아보세요.
            </p>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 w-full md:w-auto focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="병원 이름을 검색하세요..."
              className="bg-transparent outline-none text-sm font-medium w-full md:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          <div className="lg:col-span-4 flex flex-col h-[600px]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-green-500" />{" "}
                  {selectedCategory}
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                  총 {filteredHospitals.length}곳
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                <button
                  onClick={() => handleCategoryClick("전체")}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === "전체"
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  전체
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-green-600 text-white shadow-lg shadow-green-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-3 custom-scrollbar">
              {filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setSelectedMarkerId(h.id);
                    map?.panTo(new kakao.maps.LatLng(h.lat, h.lng));
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                    selectedMarkerId === h.id
                      ? "border-green-500 bg-green-50/50"
                      : "border-slate-50 bg-white hover:border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                      {h.category}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        selectedMarkerId === h.id
                          ? "rotate-90 text-green-600"
                          : "text-slate-300"
                      }`}
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                    {h.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium truncate">
                      {h.address}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 h-[600px] relative rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100">
            <Map
              center={{ lat: 36.3504, lng: 127.3845 }}
              className="w-full h-full"
              level={7}
              onCreate={setMap}
            >
              <MarkerClusterer averageCenter={true} minLevel={5}>
                {filteredHospitals.map((h) => (
                  <MapMarker
                    key={h.id}
                    position={{ lat: h.lat, lng: h.lng }}
                    onClick={() => setSelectedMarkerId(h.id)}
                    image={{
                      src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                      size: { width: 24, height: 35 },
                    }}
                  >
                    {selectedMarkerId === h.id && (
                      <div className="p-0 min-w-64 overflow-hidden rounded-2xl shadow-2xl bg-white border-none">
                        <div className="bg-slate-900 p-5 text-white">
                          <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase mb-1">
                            {h.category}
                          </p>
                          <h4 className="font-bold text-base">{h.name}</h4>
                        </div>
                        <div className="p-5 space-y-2">
                          <button
                            onClick={() => handleOpenRoadview(h)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                          >
                            <Camera className="w-4 h-4" /> 로드뷰 보기
                          </button>
                          <button
                            onClick={() => router.push(`/hospital/${h.id}`)}
                            className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-100 transition-all"
                          >
                            상세정보
                          </button>
                        </div>
                      </div>
                    )}
                  </MapMarker>
                ))}
              </MarkerClusterer>

              {isRoadviewOpen && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-3xl overflow-hidden relative shadow-2xl border border-white/20">
                    <div className="absolute top-6 right-6 z-60">
                      <button
                        onClick={() => setIsRoadviewOpen(false)}
                        className="p-3 bg-slate-900 text-white rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <Roadview
                      position={{ ...roadviewPos, radius: 50 }}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </Map>
          </div>
        </div>
      </div>
    </div>
  );
}
