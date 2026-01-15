// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// (애니메이션, useEffect, 브라우저 API 사용 등을 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
import { useEffect, useRef } from "react"; // 리액트 훅 (부수 효과, 참조 변수)
import { motion, Variants } from "framer-motion"; // 애니메이션 라이브러리
import DefaultLayout from "@/components/layouts/DefaultLayout"; // 헤더/푸터가 있는 기본 레이아웃

// 메인 페이지를 구성하는 각 섹션 컴포넌트들
import Jobs from "@/components/sections/Jobs"; // 구인구직 섹션
import Restaurant from "@/components/sections/Restaurant"; // 맛집 섹션
import TourCurse from "@/components/sections/TourCurse"; // 관광 코스 섹션
import Utils from "@/components/sections/Utils"; // 편의 기능(뉴스, 날씨 등) 섹션
import Visual from "@/components/sections/Visual"; // 상단 메인 비주얼(배너) 섹션
import HospitalMap from "@/components/sections/HospitalMap"; // 병원 지도 섹션
import BoardSection from "@/components/sections/BoardSection"; // 커뮤니티 게시판 섹션
import TourReviewSection from "@/components/sections/TourReviewSection"; // 관광 후기 섹션

// --- [애니메이션 설정 (Variants)] ---
// framer-motion에서 사용할 애니메이션 규칙을 정의합니다.
const fadeInUp: Variants = {
  // 초기 상태: 투명하고(opacity: 0), 아래로 40px 내려가 있음(y: 40)
  initial: { opacity: 0, y: 40 },
  // 화면에 보일 때 상태: 불투명하고(opacity: 1), 원래 위치로 올라옴(y: 0)
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8, // 0.8초 동안 부드럽게
      ease: "easeOut", // 끝으로 갈수록 천천히 멈추는 느낌
    },
  },
};

// --- [메인 페이지 컴포넌트] ---
export default function Home() {
  // 환경 변수에서 API 서버 주소를 가져옵니다.
  const serverURL = process.env.NEXT_PUBLIC_API_URL;

  // React Strict Mode로 인한 useEffect 중복 실행을 막기 위한 참조 변수
  // useRef는 컴포넌트가 다시 렌더링되어도 값이 유지됩니다.
  const isLogged = useRef(false);

  // --- [방문 기록 로직 (useEffect)] ---
  // 페이지가 처음 로드될 때(마운트) 딱 한 번 실행됩니다.
  useEffect(() => {
    // 만약 이미 기록을 보낸 적이 있다면(true), 함수를 종료합니다.
    if (isLogged.current) return;

    const logVisit = async () => {
      try {
        // 서버의 방문 기록 API('/api/v1/admin/visit')에 POST 요청을 보냅니다.
        await fetch(`/api/v1/admin/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // JSON 형식으로 보냄을 명시
          },
          body: JSON.stringify({
            // 현재 사용자가 보고 있는 페이지 URL (예: https://daejeon.com/)
            currentUrl: window.location.href,
            // 사용자가 어디서 타고 들어왔는지 (이전 페이지 주소)
            referrer: document.referrer,
          }),
        });
        // 성공적으로 요청을 보냈으면 플래그를 true로 바꿔서 중복 실행을 막습니다.
        isLogged.current = true;
      } catch (error) {
        // 서버가 죽었거나 네트워크 문제로 실패했을 때 에러를 출력합니다.
        console.error("방문 기록 실패 (서버 꺼짐?)", error);
      }
    };

    logVisit(); // 비동기 함수 실행
  }, []); // 의존성 배열이 빈 배열([])이므로 컴포넌트 마운트 시 1회만 실행

  // --- [화면 렌더링] ---
  return (
    // 헤더와 푸터가 포함된 기본 레이아웃으로 감쌉니다.
    <DefaultLayout>
      {/* 1. 메인 비주얼 (애니메이션 없이 바로 보여줌) */}
      <Visual />

      {/* 2. 유틸리티 섹션 (뉴스, 날씨) - 스크롤 내리면 떠오름 */}
      <motion.div
        variants={fadeInUp} // 위에서 정의한 애니메이션 규칙 적용
        initial="initial" // 시작 상태
        whileInView="whileInView" // 화면에 들어왔을 때 상태
        viewport={{ once: true, margin: "-100px" }} // 한 번만 실행, 화면 하단에서 100px 정도 올라오면 실행
      >
        <Utils />
      </motion.div>

      {/* 3. 구인구직 섹션 */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Jobs />
      </motion.div>

      {/* 4. 관광 코스 섹션 */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <TourCurse />
      </motion.div>

      {/* 5. 맛집 섹션 */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Restaurant />
      </motion.div>

      {/* 6. 관광 후기 섹션 */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <TourReviewSection />
      </motion.div>

      {/* 7. 병원 지도 섹션 */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <HospitalMap />
      </motion.div>

      {/* 8. 커뮤니티 게시판 섹션 */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <BoardSection />
      </motion.div>
    </DefaultLayout>
  );
}

// 1. 페이지 로드 및 방문 기록 (Initialization)

// 페이지가 열리자마자 useEffect가 실행됩니다.

// 브라우저는 몰래 서버에게 **"지금 어떤 사용자가 google.com에서 검색해서 우리 메인 페이지(index)로 들어왔어요!"**라고 보고합니다. (logVisit)

// 이 기록은 나중에 관리자 대시보드에서 방문자 통계로 쓰입니다.

// 2. 상단 비주얼 표시 (First Paint)

// 가장 먼저 Visual 컴포넌트(큰 배너 이미지나 동영상)가 즉시 화면에 나타납니다. 사용자의 시선을 확 사로잡습니다.

// 3. 스크롤 및 애니메이션 (Scrolling Interaction)

// 사용자가 흥미를 느껴 마우스 휠을 아래로 내립니다.

// 화면 하단에서 Utils (뉴스/날씨) 섹션이 보이기 시작하면(viewport margin -100px), motion.div가 감지하고 투명도를 0에서 1로, 위치를 아래에서 위로 부드럽게 올립니다. (SSUK~ 하고 올라오는 효과)

// 계속 스크롤을 내릴 때마다 구인구직 -> 관광코스 -> 맛집 -> 후기 -> 병원 -> 게시판 순서로 섹션들이 하나씩 차례대로 애니메이션 되며 나타납니다.
