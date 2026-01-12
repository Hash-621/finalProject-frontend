// 1. [Icon Import] 광고 배너에 사용할 아이콘들을 가져옵니다.
// Megaphone(확성기), Star(별), TrendingUp(상승 그래프) 아이콘을 사용합니다.
import { Megaphone, Star, TrendingUp } from "lucide-react";

// 2. [React Import] 리액트 기능을 사용하기 위해 가져옵니다.
// 여기서는 아이콘을 컴포넌트 형태로 만들기 위해(React.createElement) 필요합니다.
import React from "react";

// 3. [Data Export] 광고 슬라이드 데이터 배열을 만들어서 내보냅니다.
// 'export const'를 붙여야 다른 파일에서 "import { adSlides } from ..."로 가져다 쓸 수 있습니다.
export const adSlides = [
  // --- [첫 번째 슬라이드: 공지사항] ---
  {
    id: 1, // 슬라이드의 고유 번호 (리액트가 구별할 때 씀)

    // 배경색 스타일 (Tailwind CSS)
    // bg-gradient-to-br: 왼쪽 위에서 오른쪽 아래 방향으로 그라데이션
    // from-green-400 to-emerald-600: 연두색에서 진한 에메랄드색으로 변함
    bg: "bg-gradient-to-br from-green-400 to-emerald-600",

    // 아이콘 생성
    // React.createElement: <Megaphone /> 태그를 자바스크립트 코드로 만드는 방식입니다.
    // text-white: 아이콘 색상을 흰색으로 설정
    icon: React.createElement(Megaphone, { className: "w-6 h-6 text-white" }),

    // 배너에 들어갈 큰 제목
    title: "다잇슈 2.0 오픈!",

    // 배너에 들어갈 설명글 (\n은 줄바꿈 문자입니다)
    desc: "더 편리해진 우리 동네 소통,\n지금 바로 시작해보세요.",

    // 왼쪽 위에 붙을 작은 태그 (예: NOTICE, EVENT)
    tag: "NOTICE",

    // 배너를 클릭했을 때 이동할 페이지 주소
    link: "community/free", // 공지사항 페이지
  },

  // --- [두 번째 슬라이드: 맛집 추천] ---
  {
    id: 2, // 고유 번호 2번

    // 배경색: 파란색 계열 그라데이션 (Blue -> Indigo)
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",

    // 아이콘: 별 모양 (Star)
    // text-yellow-300: 테두리는 노란색
    // fill-yellow-300: 별 안쪽도 노란색으로 꽉 채움 (반짝이는 느낌)
    icon: React.createElement(Star, {
      className: "w-6 h-6 text-yellow-300 fill-yellow-300",
    }),

    title: "대전의 맛집들!", // 제목

    // 설명글 (줄바꿈 포함)
    desc: "대전 시민들의 리뷰가 담긴\n숨은 맛집 리스트 공개!",

    tag: "HOT", // 태그: 핫플레이스

    link: "/restaurant", // 맛집 리스트 페이지로 이동
  },

  // --- [세 번째 슬라이드: 데이터 시각화] ---
  {
    id: 3, // 고유 번호 3번

    // 배경색: 주황색/붉은색 계열 그라데이션 (Orange -> Rose)
    bg: "bg-gradient-to-br from-orange-500 to-rose-600",

    // 아이콘: 상승하는 그래프 모양 (TrendingUp)
    icon: React.createElement(TrendingUp, {
      className: "w-6 h-6 text-white", // 흰색 아이콘
    }),

    title: "대전 2030 미래 지도", // 제목

    // 설명글
    desc: "내 세금, 어디에 쓰일까?\n데이터로 변화를 미리 보세요.",

    tag: "DATA", // 태그: 데이터

    link: "/budget", // 예산/데이터 시각화 페이지로 이동
  },
];

// 데이터 정의 (메뉴판 만들기):

// 개발자가 이 파일에 "광고 1번은 초록색, 2번은 파란색, 3번은 주황색이야"라고 적어둡니다.

// 마치 식당 주방에 붙어있는 **'오늘의 추천 메뉴판'**과 같습니다.

// 공급 (Import):

// 메인 페이지의 배너 슬라이더(Utils.tsx 등)가 이 파일을 불러옵니다.

// "야, 오늘 띄울 광고 리스트 줘봐!" (import { adSlides } ...)

// 렌더링 (화면 표시):

// 슬라이더는 이 배열(adSlides)을 한 바퀴 돌면서(map), 여기에 적힌 대로 화면을 그립니다.

// 1번 데이터를 읽어서 초록색 배경에 확성기 아이콘을 띄우고, 4초 뒤에 2번 데이터를 읽어서 파란색 배경으로 넘깁니다.

// 장점:

// 나중에 광고 문구를 바꾸고 싶으면, 복잡한 슬라이더 코드를 건드릴 필요 없이 이 파일의 글자만 고치면 끝입니다.
