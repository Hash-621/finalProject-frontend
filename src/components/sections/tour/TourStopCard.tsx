// 1. "use client": 이 파일은 브라우저에서 동작하는 클라이언트 컴포넌트입니다.
// (사용자의 클릭이나 마우스 호버 이벤트를 처리해야 하기 때문입니다.)
"use client";

// 2. [Imports] Next.js의 페이지 이동 기능(Link)을 가져옵니다.
import Link from "next/link";
// 3. [Imports] 지도 핀 아이콘(MapPin)을 아이콘 라이브러리에서 가져옵니다.
import { MapPin } from "lucide-react";

// ==================================================================
// [Main Component] 관광지 카드 컴포넌트 시작
// ==================================================================
export default function TourStopCard({ stop }: { stop: any }) {
  // stop: 부모에게서 받은 관광지 정보 객체입니다. (이미지, 이름, 위치 등 포함)

  return (
    // 4. [Link Wrapper] 카드 전체를 감싸는 링크입니다. 클릭하면 해당 코스 상세 페이지로 이동합니다.
    <Link
      href={`/tour/route/${stop.courseNumber}`} // 이동할 주소 (예: /tour/route/1)
      // 스타일 설명:
      // - relative: 내부 요소(이미지, 텍스트)들의 위치 기준점이 됩니다.
      // - block: 링크가 박스 형태를 갖도록 합니다.
      // - aspect-3/4: 가로 3 : 세로 4 비율 (세로로 긴 직사각형)을 유지합니다.
      // - group: 이 카드에 마우스를 올렸을 때(hover), 내부 자식들이 반응할 수 있게 그룹핑합니다.
      className="relative block aspect-3/4 group"
    >
      {/* 5. [Background Image] 배경 이미지 레이어 */}
      <div
        // 스타일 설명:
        // - absolute inset-0: 부모 박스(Link)에 꽉 차게 위치합니다.
        // - bg-cover bg-center: 이미지가 잘리지 않고 꽉 차게, 중앙을 기준으로 보여줍니다.
        // - transition...: 변형(확대)될 때 1초(1000ms) 동안 부드럽게 움직입니다.
        // - group-hover:scale-110: 카드(group)에 마우스를 올리면 이미지가 1.1배 커집니다.
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        // 실제 이미지 URL을 CSS 배경으로 설정합니다.
        style={{ backgroundImage: `url(${stop.src})` }}
      />

      {/* 6. [Gradient Overlay] 텍스트 가독성을 위한 검은 그라데이션 */}
      <div
        // 스타일 설명:
        // - absolute inset-0: 역시 박스 전체를 덮습니다.
        // - bg-linear-to-t...: 아래쪽(#020617, 아주 어두운 남색)에서 위쪽(투명)으로 그라데이션을 줍니다.
        // 이 덕분에 아래쪽에 있는 흰색 글씨가 사진이 밝아도 잘 보입니다.
        className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-black/20"
      />

      {/* 7. [Content Container] 하단 텍스트 정보 영역 */}
      <div className="absolute bottom-0 left-0 p-8 w-full space-y-3">
        {/* (1) 뱃지 영역 (예: 1일차) */}
        <div className="flex gap-2">
          <span className="bg-green-600 text-[10px] font-black px-2 py-0.5 rounded text-white italic">
            {stop.day} {/* 데이터에서 받은 날짜 정보 (예: "1Day") */}
          </span>
        </div>

        {/* (2) 장소 이름 (타이틀) */}
        {/* group-hover:text-green-400: 마우스 올리면 글씨가 연두색으로 변합니다. */}
        <h4 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
          {stop.name}
        </h4>

        {/* (3) 위치 정보 (아이콘 + 주소) */}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          {/* 지도 핀 아이콘 (연한 초록색) */}
          <MapPin className="w-3.5 h-3.5 text-green-500/70" />
          {/* 주소 텍스트 (정보가 없으면 기본값 "대전광역시" 출력) */}
          <span>{stop.location || "대전광역시"}</span>
        </div>
      </div>
    </Link>
  );
}

// 배치: 화면에 "성심당", "한밭수목원", "엑스포과학공원" 같은 장소들이 세로로 긴 직사각형 카드 형태로 쭉 나열되어 있습니다. 이 컴포넌트는 그중 카드 한 장입니다.

// 데이터 수신: 부모 컴포넌트로부터 **stop**이라는 데이터 뭉치를 받습니다. 여기엔 이미지 주소(src), 장소 이름(name), 몇 번째 코스인지(courseNumber), 위치(location) 등이 들어있습니다.

// 렌더링 (시각화):

// 배경: 장소 사진이 카드에 가득 차 있습니다.

// 가독성: 사진 아랫부분이 어둡게 그라데이션 처리되어 있어, 그 위에 있는 하얀 글씨가 선명하게 보입니다.

// 정보: 왼쪽 하단에 "1일차" 뱃지, 장소 이름("한밭수목원"), 위치("대전 서구...")가 표시됩니다.

// 인터랙션 (Hover):

// 사용자가 마우스를 카드 위에 올리면, 배경 사진이 **스르륵 확대(Scale Up)**되면서 생동감을 줍니다.

// 동시에 장소 이름이 초록색으로 변하며 "이걸 누르면 이동합니다"라는 신호를 줍니다.

// 클릭: 카드를 클릭하면 해당 코스의 상세 페이지(/tour/route/1)로 이동합니다.
