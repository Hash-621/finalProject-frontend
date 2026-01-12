// 1. "use client": 이 컴포넌트는 브라우저에서 실행되는 클라이언트 컴포넌트입니다.
// (Link를 통한 페이지 이동이나, 호버 효과 등 사용자 상호작용이 있기 때문입니다.)
"use client";

// 2. [Imports] 필요한 도구들을 불러옵니다.
import Link from "next/link"; // 페이지 이동을 위한 Next.js 링크 컴포넌트
import { MapPin, MessageCircle, Clock } from "lucide-react"; // 지도 핀, 말풍선, 시계 아이콘
import { RestaurantData } from "@/types/restaurant"; // 맛집 데이터의 타입 정의 (TypeScript용)

// 3. [Interface Definition] Props 타입 정의
// 부모 컴포넌트에게 "나는 'item'이라는 이름으로 'RestaurantData' 모양의 데이터를 받을 거야!"라고 선언합니다.
interface Props {
  item: RestaurantData;
}

// ==================================================================
// [Main Component] 맛집 카드 컴포넌트 시작
// ==================================================================
export default function RestaurantCard({ item }: Props) {
  // item: 부모가 내려준 맛집 정보 객체 (이름, 주소, 이미지 경로 등 포함)

  return (
    // [Card Container] 카드 전체를 감싸는 박스
    // - relative: 내부 절대 위치 요소들의 기준점이 됩니다.
    // - overflow-hidden: 배경 이미지가 확대될 때 박스 밖으로 삐져나가지 않게 잘라냅니다.
    // - rounded-4xl: 모서리를 아주 둥글게 깎습니다.
    // - group: 이 박스에 마우스를 올렸을 때(hover), 자식 요소들이 반응할 수 있게 그룹핑합니다.
    <div className="relative h-full overflow-hidden rounded-4xl group">
      {/* [Layer 1] 배경 이미지 영역 */}
      <div
        // - absolute inset-0: 부모 박스에 꽉 차게 위치합니다.
        // - transition...: 변형이 일어날 때 0.7초 동안 부드럽게 움직입니다.
        // - group-hover:scale-110: 카드(group)에 마우스를 올리면 이미지가 1.1배 커집니다. (줌인 효과)
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{
          // 동적 스타일링: 이미지가 있으면 그라데이션과 함께 보여주고, 없으면 투명하게 처리
          backgroundImage: item.imagePath
            ? // linear-gradient: 아래쪽은 검게(0.9), 위쪽은 투명하게 하여 텍스트 가독성을 높입니다.
              `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url(/images/restaurantImages/${item.imagePath})`
            : "none",
          backgroundColor: item.imagePath ? "transparent" : "#111", // 이미지 없으면 검은색 배경
        }}
      />

      {/* [Layer 2] 정보 텍스트 영역 (이미지 위에 겹쳐짐) */}
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        {/* 애니메이션 효과: 내용물이 서서히 나타나는 효과 (CSS 클래스 필요) */}
        <div className="animate-fadeIn">
          {/* 상단 뱃지 영역 (카테고리, 리뷰 수) */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {/* (1) 카테고리 뱃지 (예: 한식, 카페) */}
              <div className="inline-block px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-md tracking-tighter shadow-sm uppercase">
                {item.restCategory}
              </div>

              {/* (2) [New] 리뷰 개수 뱃지 (리뷰가 있을 때만 표시) */}
              {/* 조건부 렌더링: reviewCount가 존재하고 0보다 클 때만 보입니다. */}
              {item.reviewCount !== undefined && item.reviewCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-bold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-white/90 border border-white/10">
                  {/* 노란색 말풍선 아이콘 */}
                  <MessageCircle
                    size={10}
                    className="text-yellow-400 fill-yellow-400"
                  />
                  <span>{item.reviewCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* 가게 이름 */}
          {/* line-clamp-1: 이름이 길면 한 줄로 자르고 '...' 처리 */}
          <h2 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
            {item.name}
          </h2>

          {/* 상세 정보 (대표 메뉴, 주소) */}
          <div className="space-y-1 mb-6 opacity-90">
            {/* 대표 메뉴: 오렌지색 이탤릭체로 강조 */}
            <p className="text-sm font-light line-clamp-1 italic text-orange-200">
              {/* 베스트 메뉴가 있으면 보여주고, 없으면 기본 문구 출력 */}
              {item.bestMenu ? `"${item.bestMenu}"` : "대전의 숨은 맛집"}
            </p>

            {/* 주소: 지도 핀 아이콘과 함께 표시 */}
            <p className="text-[11px] font-light text-gray-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-400" />
              <span className="line-clamp-1">{item.address}</span>
            </p>
          </div>

          {/* 상세페이지 이동 버튼 */}
          <Link
            href={`/restaurant/${item.id}`} // 클릭 시 이동할 경로 (동적 라우팅)
            className="inline-block w-full text-center py-2.5 border border-white/30 backdrop-blur-sm rounded-xl text-xs font-bold hover:bg-green-600 hover:border-green-600 transition-all duration-300"
          >
            상세정보 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

// 배치: 화면에 여러 개의 직사각형 카드들이 격자무늬(Grid)로 나열되어 있습니다. 이 컴포넌트는 그중 하나의 카드입니다.

// 데이터 수신: 부모 컴포넌트로부터 "성심당, 빵 사진, 대전 중구..." 같은 데이터(item)를 넘겨받습니다.

// 렌더링 (시각화):

// 배경: 가게 사진을 카드 전체에 꽉 채웁니다. 단, 글씨가 잘 보이도록 사진 위에 검은색 그라데이션 필터를 한 겹 씌웁니다.

// 정보: 왼쪽 상단엔 '베이커리' 뱃지와 '리뷰 150개' 뱃지를 달고, 하단에는 가게 이름과 대표 메뉴를 하얀 글씨로 보여줍니다.

// 인터랙션 (Hover):

// 사용자가 마우스를 카드 위에 올리면(Hover), 배경 이미지가 **살짝 확대(Scale Up)**되면서 생동감을 줍니다.

// 가게 이름 색상이 오렌지색으로 변하며 "나를 클릭해!"라는 신호를 보냅니다.

// 클릭: 하단의 [상세정보 보기] 버튼이나 카드를 클릭하면, 해당 식당의 상세 페이지(/restaurant/10)로 이동합니다.
