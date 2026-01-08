// --- [라이브러리 및 컴포넌트 임포트] ---

// 1. 프로젝트 공통 레이아웃 컴포넌트를 가져옵니다.
// "@/..."는 'src' 폴더를 가리키는 별칭입니다.
// 이 컴포넌트(DefaultLayout) 안에는 헤더(로고, 메뉴바), 푸터(하단 정보) 등이 미리 만들어져 있습니다.
// 관광지 페이지에서도 다른 페이지와 똑같은 헤더와 푸터를 사용하여 통일감을 줍니다.
import DefaultLayout from "@/components/layouts/DefaultLayout";

// 2. Next.js에서 제공하는 'Metadata' 타입을 가져옵니다.
// TypeScript에게 "이 변수는 SEO 메타데이터(제목, 설명 등) 규칙을 따라야 해"라고 알려주기 위함입니다.
// 'import type'은 실제 실행 시점에는 사라지고, 오직 코드 작성 중에 오타나 형식을 검사하는 용도로만 쓰입니다.
import type { Metadata } from "next";

// --- [SEO 및 메타데이터 설정] ---

// 3. 'metadata'라는 약속된 이름의 상수를 내보냅니다(export).
// Next.js 서버는 이 파일을 읽을 때 'metadata' 변수가 있는지 확인합니다.
// 있다면, 그 안의 내용을 바탕으로 HTML의 <head> 태그(제목, 설명 등)를 자동으로 생성합니다.
export const metadata: Metadata = {
  // 4. 브라우저 탭에 표시될 페이지 제목을 설정합니다.
  // 사용자가 이 레이아웃이 적용된 페이지(관광 명소)에 접속하면, 탭 제목이 "다잇슈대전 | tour | attration"으로 바뀝니다.
  title: "다잇슈대전 | tour | attration",
};

// --- [레이아웃 컴포넌트 정의] ---

// 5. Layout 컴포넌트 함수를 정의하고 기본값(default)으로 내보냅니다.
// Next.js는 화면을 그릴 때 가장 먼저 이 함수를 호출하여 화면의 뼈대를 잡습니다.
export default function Layout({
  children, // 6. 이 레이아웃이 감싸고 있는 '실제 페이지 내용물'을 전달받습니다. (예: attraction/page.tsx의 내용)
}: Readonly<{
  // 7. TypeScript 타입 정의 부분입니다.
  // children은 'React.ReactNode' 타입이어야 합니다. (HTML 태그, 텍스트, 컴포넌트 등 화면에 그릴 수 있는 모든 것)
  // Readonly는 이 props 객체를 함수 내부에서 실수로 수정하지 못하도록 '읽기 전용'으로 잠가둡니다.
  children: React.ReactNode;
}>) {
  // --- [화면 렌더링 (JSX 반환)] ---

  // 8. 최종적으로 브라우저에 그려질 HTML 구조를 반환합니다.
  // 아까 가져온 <DefaultLayout> 컴포넌트로 {children}(실제 페이지 내용)을 감싸서 반환합니다.
  // 즉, [헤더/푸터가 있는 틀] 안에 [관광 명소 페이지 내용]을 쏙 집어넣는 구조입니다.
  return <DefaultLayout>{children}</DefaultLayout>;
}

// 1. 요청 수신 및 메타데이터 처리 (Server Side Analysis)

// Next.js 서버가 /tour/attraction 경로로 들어온 요청을 받습니다.

// 이 경로에 해당하는 layout.tsx (이 파일)를 찾아서 읽습니다.

// 먼저 export const metadata를 확인합니다. 여기서 title: "다잇슈대전 | tour | attration" 정보를 가져와서, HTML 문서의 머리말(<head>)에 제목을 심어줍니다.

// 2. 레이아웃 구조 형성 (Composition)

// 서버는 Layout 함수를 실행합니다.

// 이때, 실제 페이지 내용물인 page.tsx (관광 명소 목록이나 지도 등)를 실행하여 그 결과물을 children이라는 변수에 담습니다.

// 그리고 Layout 함수에게 이 children을 전달합니다. "자, 여기 관광지 페이지 내용 가져왔으니 네가 가진 **공통 틀(DefaultLayout)**로 포장해 줘."

// 3. 최종 HTML 조립 (Rendering)

// Layout 함수는 전달받은 children을 DefaultLayout 사이에 끼워 넣습니다.

// 결과적으로 브라우저에게는 다음과 같은 구조가 전달됩니다:

// HTML

// <header>로고, 메뉴, 로그인 버튼...</header>

//     <main>
//         대전의 명소 리스트... 지도...
//     </main>

// <footer>회사 정보, 이용약관...</footer>
