// --- [라이브러리 및 컴포넌트 임포트] ---

// 1. 상단 메뉴바(헤더) 컴포넌트를 가져옵니다. (로고, 네비게이션 메뉴 등)
import Header from "@/components/layouts/Header";

// 2. 하단 정보란(푸터) 컴포넌트를 가져옵니다. (저작권, 패밀리 사이트 등)
import Footer from "@/components/layouts/Footer";

// 3. 화면 구석에 떠다니는 AI 챗봇 컴포넌트를 가져옵니다.
import ChatBot from "@/components/features/ChatBot";

// 4. 'react-toastify' 라이브러리에서 알림창 컨테이너를 가져옵니다.
// 회원가입 성공, 에러 발생 같은 메시지를 예쁜 팝업으로 띄워주는 도구입니다.
import { ToastContainer } from "react-toastify";

// 5. 실시간 통신(웹소켓)을 위한 Pusher 공급자를 가져옵니다.
// 이 컴포넌트가 감싸고 있는 영역에서는 실시간 데이터(채팅, 알림 등)를 받을 수 있게 됩니다.
import PusherProvider from "@/components/features/PusherProvider";

// --- [레이아웃 컴포넌트 정의] ---

// 6. DefaultLayout 함수를 정의하고 내보냅니다.
// 이 함수는 'children'이라는 특별한 props를 받습니다.
export default function DefaultLayout({
  children, // 7. 이 레이아웃 사이에 들어올 '실제 페이지 내용물'입니다. (예: 메인화면, 게시판화면 등)
}: Readonly<{
  // 8. TypeScript 타입 정의: children은 리액트가 그릴 수 있는 모든 요소(Node)여야 합니다.
  // Readonly는 이 props를 수정하지 못하게 막습니다.
  children: React.ReactNode;
}>) {
  // --- [화면 렌더링 (JSX 반환)] ---
  return (
    // 9. 전체를 감싸는 최상위 div입니다.
    // 'wrap': 전체 너비 스타일, 'overflow-hidden': 내용이 넘치면 자름, 'relative': 자식 요소 위치 기준점
    <div className="wrap overflow-hidden relative">
      {/* 10. 페이지 최상단에 헤더를 고정적으로 보여줍니다. */}
      <Header />

      {/* 11. PusherProvider로 실제 콘텐츠 영역(main)을 감쌉니다. */}
      {/* 이렇게 하면 <main> 안에 들어가는 모든 페이지에서 실시간 기능을 사용할 수 있습니다. */}
      <PusherProvider>
        {/* 12. 시멘틱 태그 main을 사용하여 실제 페이지 내용(children)을 표시합니다. */}
        <main>{children}</main>
      </PusherProvider>

      {/* 13. 알림 팝업이 뜨는 위치와 스타일을 설정하는 컨테이너입니다. */}
      {/* 화면에는 보이지 않다가, toast() 함수가 호출되면 팝업을 띄웁니다. */}
      <ToastContainer
        position="bottom-right" // 오른쪽 아래에 뜨게 설정
        autoClose={5000} // 5초 뒤에 자동으로 사라짐
        hideProgressBar={true} // 시간이 줄어드는 진행 막대는 숨김
        theme="light" // 밝은 테마 사용
        style={{ zIndex: 50 }} // 다른 요소들보다 무조건 위에 뜨도록 설정 (맨 앞)
      />

      {/* 14. 챗봇 버튼을 화면에 렌더링합니다. (보통 우측 하단 고정) */}
      <ChatBot />

      {/* 15. 페이지 최하단에 푸터를 고정적으로 보여줍니다. */}
      <Footer />
    </div>
  );
}

// 1. 페이지 요청 및 레이아웃 감지 (Server & Router)

// 사용자가 사이트에 들어오면 Next.js는 해당 페이지(page.tsx)를 찾습니다.

// 그리고 그 페이지를 감싸고 있는 layout.tsx를 먼저 실행합니다. (이 코드가 바로 그 파일입니다.)

// 2. 기본 골격 형성 (Structure Building)

// DefaultLayout 함수가 실행되면서 div.wrap이라는 큰 도화지를 깝니다.

// Header: 가장 먼저 맨 위에 헤더(로고, 메뉴)를 그립니다.

// Footer: 맨 아래에 푸터(저작권 정보)를 그립니다.

// 3. 콘텐츠 주입 및 기능 연결 (Injection & Context)

// PusherProvider: 헤더와 푸터 사이, 몸통 부분에 실시간 통신망을 설치합니다.

// Main & Children: 설치된 통신망 안에 실제 페이지 내용(예: 채용 공고 리스트)을 children 자리에 쏙 집어넣습니다.

// 덕분에 채용 공고 페이지에서도 실시간 알림을 받을 수 있게 됩니다.

// 4. 유틸리티 배치 (Overlay Setup)

// ToastContainer: 눈에는 보이지 않지만, 화면 오른쪽 아래 구석에 "알림이 오면 띄울 투명 박스"를 미리 만들어둡니다. (zIndex: 9999로 제일 앞에 배치)

// ChatBot: 화면 한구석(보통 우측 하단)에 챗봇 아이콘을 띄웁니다.
