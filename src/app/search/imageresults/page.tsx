// 1. "use client" 선언
"use client";

// --- [라이브러리 및 컴포넌트] ---
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script"; // 카카오맵 스크립트 로드
import SearchBar from "@/components/common/SearchBar"; // 기존 검색바 재사용
import {
  Sparkles,
  MapPin,
  Star,
  Tag,
  Navigation,
  ExternalLink,
} from "lucide-react"; // 아이콘 추가

// 지도 마커 이미지 (경로가 맞지 않으면 public 폴더 위치를 확인해주세요)
import makerImg from "../../../../public/images/mapMaker.png";

// --------------------------------------------------------
// 1. 하드코딩 데이터 정의
// --------------------------------------------------------

interface BakeryData {
  id: string;
  name: string;
  address: string;
  keyword: string;
  description: string;
  images: string[];
  probability?: string;
}

const BAKERY_DATA: Record<string, BakeryData> = {
  마들렌: {
    id: "mongsim",
    name: "몽심",
    address: "대전광역시 대덕구 오정동 175-45",
    keyword: "🏆 대전 빵축제 1위",
    description:
      "대전 빵지순례 필수 코스! 겉바속촉 마들렌의 정석을 맛볼 수 있는 곳입니다.",
    images: [
      "/images/imagesearch/몽심.jpg",
      "/images/imagesearch/몽심2.jpg",
      "/images/imagesearch/몽심3.jpg",
    ],
  },
  두쫀쿠: {
    id: "mimi",
    name: "미미제과점",
    address: "대전광역시 서구 갈마역로25번길 17-7",
    keyword: "🍪 두바이 디저트 맛집",
    description:
      "쫀득한 식감이 일품인 '두쫀쿠'와 다양한 수제 디저트가 가득한 감성 카페.",
    images: [
      "/images/imagesearch/미미제과점.jpg",
      "/images/imagesearch/미미제과점2.png",
      "/images/imagesearch/미미제과점3.png",
    ],
  },
  말차시루: {
    id: "sungsimdang",
    name: "성심당 케익부띠끄",
    address: "대한민국 대전광역시 중구 대종로 480",
    keyword: "🏰 대전의 상징",
    description:
      "대전의 자부심! 튀김소보로뿐만 아니라 케이크까지 섭렵한 전설적인 빵집.",
    images: [
      "/images/imagesearch/성심당.png",
      "/images/imagesearch/성심당2.jpg",
      "/images/imagesearch/성심당3.jpg",
    ],
  },
};

// --------------------------------------------------------
// 2. 메인 컨텐츠 컴포넌트
// --------------------------------------------------------
function ImageSearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 분석된 키워드 가져오기
  const keyword = searchParams.get("searchKeyword") || "";
  const probability = searchParams.get("probability") || "";

  // 키워드에 해당하는 데이터 찾기 (없으면 null)
  const resultData = BAKERY_DATA[keyword];

  const [loading, setLoading] = useState(true);

  // 🔥 [추가됨] 변환된 좌표(위도, 경도)를 저장할 상태
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(
    null
  );

  // 로딩 시늉 (UX용)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [keyword]);

  // --- [지도 초기화 및 좌표 변환 함수] ---
  const initMap = (address: string, name: string) => {
    const { kakao } = window as any;
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("map"); // 지도를 넣을 div
    if (!container) return;

    const options = {
      center: new kakao.maps.LatLng(36.3504, 127.3845), // 기본 중심 좌표 (대전 시청 부근)
      level: 3, // 확대 레벨
    };

    const map = new kakao.maps.Map(container, options);
    const geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표 검색
    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 🔥 [중요] 변환된 좌표를 State에 저장합니다. (길찾기 버튼에서 사용)
        setCoords({ lat: result[0].y, lng: result[0].x });

        var imageSrc = makerImg.src,
          imageSize = new kakao.maps.Size(32, 34),
          imageOption = { offset: new kakao.maps.Point(16, 34) };
        var markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imageOption
        );

        // 지도에 마커 표시
        new kakao.maps.Marker({ map, position: coords, image: markerImage });

        // 마커 위에 가게 이름 표시 (인포윈도우)
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;color:#334155;">${name}</div>`,
        });
        infowindow.open(
          map,
          new kakao.maps.Marker({ map, position: coords, image: markerImage })
        );

        map.setCenter(coords);
      }
    });
  };

  // --- [Effect] 지도 그리기 트리거 ---
  useEffect(() => {
    if (resultData && !loading) {
      // 0.3초 뒤에 실행 (화면 렌더링 후)
      const timer = setTimeout(
        () => initMap(resultData.address, resultData.name),
        300
      );
      return () => clearTimeout(timer);
    }
  }, [resultData, loading]);

  if (!keyword)
    return (
      <div className="p-20 text-center text-gray-500">
        분석된 키워드가 없습니다.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* 카카오맵 SDK 스크립트 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
        onLoad={() => {
          (window as any).kakao.maps.load(() => console.log("Kakao Map Ready"));
        }}
      />

      {/* 1. 최상단 검색바 */}
      <div className="top-0 z-50 bg-white/95 backdrop-blur-sm border-b pb-8 pt-8 mb-10">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl">
            <SearchBar
              idPrefix="img-results-top"
              initialValue={keyword}
              className="flex items-center w-full border border-green-300 rounded-full px-5 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-green-500 shadow-sm"
              inputClassName="bg-transparent text-gray-800 placeholder-gray-400 text-base"
              buttonClassName="text-green-600 hover:text-green-700"
              iconClassName="w-5 h-5"
            />
          </div>
        </div>
      </div>

      {/* 2. AI 분석 결과 헤더 */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4 animate-bounce">
          <Sparkles size={16} /> AI 이미지 분석 완료
          <span>　|　 정확도: {probability} </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          사진 속 음식은 <br className="md:hidden" />
          <span className="text-green-600 underline decoration-wavy decoration-green-300 underline-offset-8">
            '{keyword}'
          </span>{" "}
          입니다!
        </h1>
        <p className="text-gray-500 mt-6 text-lg">
          이 메뉴로 대전에서 가장 유명한 맛집을 찾았습니다.
        </p>
      </div>

      {/* 3. 결과 컨텐츠 */}
      <main>
        {loading ? (
          <div className="py-32 text-center text-gray-400 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            맛집 정보를 불러오는 중입니다...
          </div>
        ) : !resultData ? (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-xl font-bold text-gray-500 mb-2">
              정보를 찾을 수 없어요 😢
            </p>
            <p className="text-sm text-gray-400">
              아직 등록되지 않은 메뉴이거나, 분석 결과가 정확하지 않을 수
              있습니다.
            </p>
          </div>
        ) : (
          // 결과가 있을 경우 (맛집 카드)
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-shadow duration-500">
            {/* 상단 이미지 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 h-64 md:h-96">
              {resultData.images.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative w-full h-full overflow-hidden group"
                >
                  <img
                    src={imgSrc} // 문자열 경로 사용
                    alt={`${resultData.name} 이미지 ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
              ))}
            </div>

            {/* 하단 상세 정보 */}
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between gap-10 mb-8">
                {/* 텍스트 정보 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-1">
                      BEST CHOICE
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                    {resultData.name}
                  </h2>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8 lg:mb-14">
                    {resultData.description}
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-slate-700 ">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-500 shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">
                          Location
                        </p>
                        <p className="font-bold">{resultData.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-slate-700">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-500 shrink-0">
                        <Tag size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">
                          Keyword
                        </p>
                        <p className="font-bold text-purple-600">
                          #{resultData.keyword}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔥 [변경됨] 지도 및 길찾기 영역 (버튼 대체) */}
                <div className="w-full md:w-[320px] shrink-0 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Navigation size={16} className="text-blue-500" />
                      오시는 길
                    </h3>
                    <a
                      href={`https://map.kakao.com/link/search/${encodeURIComponent(
                        resultData.address
                      )}`}
                      target="_blank"
                      className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline"
                    >
                      큰 지도보기 <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* 카카오맵 컨테이너 */}
                  <div
                    id="map"
                    className="w-full h-[200px] rounded-[1.5rem] bg-slate-100 border border-slate-100 overflow-hidden shadow-inner"
                  ></div>

                  {/* 길찾기 버튼 */}
                  <a
                    href={
                      coords
                        ? `https://map.kakao.com/link/to/${encodeURIComponent(
                            resultData.name
                          )},${coords.lat},${coords.lng}`
                        : `https://map.kakao.com/link/search/${encodeURIComponent(
                            resultData.address
                          )}`
                    }
                    target="_blank"
                    className="w-full py-4 bg-[#FFEB00] text-[#3C1E1E] rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md"
                  >
                    <Navigation size={18} /> 카카오맵 길찾기
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- [최상위 페이지] ---
export default function ImageSearchResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImageSearchResultsContent />
    </Suspense>
  );
}
