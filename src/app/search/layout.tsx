// --- [라이브러리 및 컴포넌트 임포트] ---

// 1. 프로젝트 공통 레이아웃 컴포넌트를 가져옵니다.
// "@/..."는 'src' 폴더를 가리키는 별칭입니다.
// 이 컴포넌트(DefaultLayout) 안에는 헤더(로고, 메뉴바), 푸터(하단 정보), 챗봇 등이 미리 조립되어 있습니다.
import DefaultLayout from "@/components/layouts/DefaultLayout";

// 2. Next.js에서 제공하는 'Metadata' 타입을 가져옵니다.
// TypeScript에게 "이 변수는 SEO 메타데이터(제목, 설명 등) 규칙을 따라야 해"라고 알려주기 위함입니다.
// 'import type'은 실제 브라우저 실행 시점에는 사라지고, 개발 중에만 쓰입니다.
import type { Metadata } from "next";

// --- [SEO 및 메타데이터 설정] ---

// 3. 'metadata'라는 약속된 이름의 상수를 내보냅니다(export).
// Next.js 서버는 페이지를 만들기 전에 이 변수를 확인합니다.
// 브라우저 탭에 표시될 제목을 여기서 설정합니다.
export const metadata: Metadata = {
  // 4. 브라우저 탭 제목 설정입니다.
  // 사용자가 검색 관련 페이지(/search)에 접속하면, 탭 제목이 "다잇슈대전 | search"로 바뀝니다.
  title: "다잇슈대전 | search",
};

// --- [레이아웃 컴포넌트 정의] ---

// 5. Layout 컴포넌트 함수를 정의하고 내보냅니다.
// Next.js는 화면을 그릴 때, 해당 폴더의 내용물(page.tsx)을 그리기 전에 이 Layout 함수를 먼저 호출하여 뼈대를 잡습니다.
export default function Layout({
  children, // 6. 이 레이아웃이 감싸게 될 '실제 알맹이(페이지 내용)'를 전달받습니다. (예: 검색 결과 리스트)
}: Readonly<{
  // 7. TypeScript 타입 정의 부분입니다.
  // children은 'React.ReactNode' 타입이어야 합니다. (화면에 그릴 수 있는 모든 요소: HTML 태그, 컴포넌트, 텍스트 등)
  // Readonly는 이 props 객체를 함수 내부에서 실수로 수정하지 못하도록 읽기 전용으로 잠가둡니다.
  children: React.ReactNode;
}>) {
  // --- [화면 렌더링 (JSX 반환)] ---

  // 8. 최종적으로 브라우저에 그려질 HTML 구조를 반환합니다.
  // 아까 가져온 <DefaultLayout> (헤더/푸터가 있는 틀) 사이에 {children} (실제 검색 페이지 내용)을 쏙 집어넣습니다.
  // 즉, [공통 레이아웃]이라는 액자 안에 [검색 결과]라는 그림을 끼워 넣는 작업입니다.
  return <DefaultLayout>{children}</DefaultLayout>;
}

// 1. 요청 수신 및 메타데이터 처리 (Server Side Analysis)

// Next.js 서버가 /search 경로로 들어온 요청을 받습니다.

// 이 경로에 해당하는 layout.tsx (이 파일)를 찾아서 읽습니다.

// export const metadata를 확인하여 title: "다잇슈대전 | search" 정보를 가져옵니다. 최종 HTML의 <head> 태그 안에 이 제목을 심어서 검색엔진이나 브라우저 탭에 보이게 합니다.

// 2. 레이아웃 구조 형성 (Composition)

// 서버는 Layout 함수를 실행합니다.

// 동시에 /search/page.tsx (검색 결과 메인 화면)를 실행하여 그 결과물을 children이라는 변수에 담습니다.

// 그리고 Layout 함수에게 명령합니다. "자, 여기 검색 결과 화면(children) 줄 테니까 네가 가진 공통 틀(DefaultLayout)로 예쁘게 포장해 줘."

// 3. 최종 HTML 조립 (Rendering)

// Layout 함수는 DefaultLayout 컴포넌트를 호출하면서 그 안에 children을 배치합니다.

// 결과적으로 브라우저에게는 다음과 같은 구조가 전달됩니다:

// HTML

// <header>로고, 메뉴바, 로그인 버튼...</header>

//     <main>
//         검색바... 검색 결과 리스트...
//     </main>

// <footer>회사 정보, 이용약관...</footer>
