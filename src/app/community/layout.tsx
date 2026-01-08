// --- [라이브러리 및 컴포넌트 임포트] ---

// 1. 공통 레이아웃 컴포넌트를 가져옵니다.
// "@/..."는 프로젝트의 최상위 폴더(src)를 가리키는 별칭(Alias)입니다.
// 즉, src/components/layouts 폴더 안에 있는 DefaultLayout.tsx 파일을 불러오는 것입니다.
// 이 컴포넌트 안에는 보통 헤더(Header), 푸터(Footer), 사이드바 등이 들어있습니다.
import DefaultLayout from "@/components/layouts/DefaultLayout";

// 2. Next.js에서 제공하는 'Metadata' 타입을 가져옵니다.
// TypeScript에게 "이 변수는 메타데이터(SEO 설정값) 형식을 따라야 해"라고 알려주기 위함입니다.
// 'import type'은 런타임(실행 시)에는 사라지고 오직 코드 작성 시 타입 검사 용도로만 쓰입니다.
import type { Metadata } from "next";

// --- [SEO 및 메타데이터 설정] ---

// 3. 'metadata'라는 이름의 상수를 내보냅니다(export).
// Next.js는 이 약속된 이름(metadata)의 변수를 찾아서, 자동으로 HTML의 <head> 태그 내용을 생성합니다.
// 브라우저 탭 제목, 설명, 오픈 그래프 이미지 등을 여기서 설정합니다.
export const metadata: Metadata = {
  // 브라우저 탭에 표시될 페이지 제목을 설정합니다.
  // 사용자가 이 폴더 내의 페이지에 접속하면 탭 제목이 "다잇슈대전 | community"로 바뀝니다.
  title: "다잇슈대전 | community",
};

// --- [레이아웃 컴포넌트 정의] ---

// 4. Layout 컴포넌트를 기본값(default)으로 내보냅니다.
// Next.js는 페이지를 그릴 때 이 함수를 호출하여 화면의 틀을 잡습니다.
export default function Layout({
  children, // 5. 이 레이아웃이 감싸고 있는 '하위 페이지들의 내용'을 전달받습니다.
}: Readonly<{
  // 6. TypeScript 타입 정의 부분입니다.
  // children은 'React.ReactNode' 타입(HTML 태그, 컴포넌트, 텍스트 등 화면에 그릴 수 있는 모든 것)이어야 합니다.
  // Readonly는 이 props 객체를 함수 내부에서 수정하지 못하도록 읽기 전용으로 만듭니다.
  children: React.ReactNode;
}>) {
  // --- [화면 렌더링 (JSX 반환)] ---

  // 7. 최종적으로 브라우저에 그릴 HTML 구조를 반환합니다.
  // 가져온 <DefaultLayout> 컴포넌트로 {children}을 감싸서 반환합니다.
  // 즉, [헤더/푸터가 포함된 DefaultLayout] 안에 [실제 페이지 내용(children)]이 쏙 들어가는 구조입니다.
  return <DefaultLayout>{children}</DefaultLayout>;
}

// 1. 요청 수신 및 메타데이터 처리 (Server Side)

// 사용자가 URL을 입력하면 Next.js 서버가 요청을 받습니다.

// Next.js는 먼저 export const metadata를 확인합니다.

// 여기서 설정된 title: "다잇슈대전 | community" 값을 읽어서, 최종 생성될 HTML의 <head><title>...</title></head> 부분에 집어넣습니다.

// 2. 레이아웃 컴포넌트 호출 (Composition)

// Next.js는 화면을 구성하기 위해 Layout 함수를 실행합니다.

// 이때, 현재 보여줘야 할 실제 페이지의 내용(page.tsx의 실행 결과물)을 children이라는 이름의 매개변수로 포장해서 Layout 함수에게 넘겨줍니다.

// 3. 구조 결합 (Rendering)

// Layout 함수는 전달받은 children(페이지 내용)을 그대로 반환하지 않고, DefaultLayout이라는 컴포넌트 사이에 끼워 넣습니다.

// 결과적으로 브라우저에는 다음과 같은 구조로 전달됩니다:

// HTML

// <DefaultLayout>  <PageContent /> </DefaultLayout>
