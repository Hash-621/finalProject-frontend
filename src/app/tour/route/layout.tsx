// 1. [Import] 'DefaultLayout' 컴포넌트를 가져옵니다.
// "@/components/layouts/DefaultLayout" 경로에 있는 파일입니다.
// 이 컴포넌트는 보통 웹사이트의 공통적인 '헤더(메뉴바)'와 '푸터(바닥글)'를 포함하고 있습니다.
// 즉, "기본 틀"을 가져오는 것입니다.
import DefaultLayout from "@/components/layouts/DefaultLayout";

// 2. [Import] Next.js에서 제공하는 'Metadata' 타입을 가져옵니다.
// 이것은 TypeScript에게 "이 변수는 페이지의 제목이나 설명을 담는 메타데이터야!"라고
// 알려주기 위한 규칙(Type)입니다.
import type { Metadata } from "next";

// 3. [Metadata 설정] 이 레이아웃이 적용되는 페이지들의 '메타데이터'를 정의해서 내보냅니다.
// Next.js는 이 'metadata'라는 변수를 자동으로 찾아서 HTML의 <head> 태그 내용을 수정해줍니다.
export const metadata: Metadata = {
  // 브라우저 탭(Tab)에 나타날 제목입니다.
  // 사용자가 이 페이지에 접속하면 탭 이름이 "다잇슈대전 | tour | route"로 바뀝니다.
  title: "다잇슈대전 | tour | route",
};

// 4. [Main Component] 실제 레이아웃을 구성하는 메인 함수입니다.
// 함수 이름은 'Layout'이며, Next.js가 페이지를 그릴 때 이 함수를 가장 먼저 호출하여 틀을 잡습니다.
export default function Layout({
  // 5. [Props] 부모(Next.js 시스템)로부터 'children'이라는 이름의 재료를 받습니다.
  // 여기서 'children'은 이 레이아웃 안쪽에 들어갈 '실제 페이지 내용(page.tsx)'입니다.
  // 즉, "보여줄 알맹이"를 전달받는 것입니다.
  children,
}: Readonly<{
  // 6. [TypeScript Type] 전달받은 props의 타입을 정의합니다.
  // Readonly: 이 데이터는 읽기만 가능하고 수정할 수 없다는 안전장치입니다.
  // React.ReactNode: 'children'은 글자, 그림, HTML 태그 등 리액트가 화면에 그릴 수 있는 모든 것이 될 수 있다는 뜻입니다.
  children: React.ReactNode;
}>) {
  // 7. [Return] 최종적으로 브라우저에 그려질 HTML 구조를 반환합니다.
  // <DefaultLayout> (헤더+푸터가 있는 틀)으로 감싸고,
  // 그 사이에 {children} (실제 페이지 내용)을 끼워 넣습니다.
  // 결과적으로: [헤더] -> [관광 코스 내용] -> [푸터] 순서로 화면에 나타나게 됩니다.
  return <DefaultLayout>{children}</DefaultLayout>;
}

// 진입: 사용자가 웹사이트에서 "관광 코스" 메뉴를 클릭하여 /tour/route 주소로 들어옵니다.

// Next.js의 준비:

// Next.js는 해당 페이지의 내용(page.tsx)을 보여주기 전에, 이 layout.tsx 파일을 먼저 실행합니다.

// "아, 이 페이지는 기본 틀(DefaultLayout)을 써야 하는구나!"라고 인식합니다.

// 메타데이터 적용:

// 브라우저 탭의 제목을 **"다잇슈대전 | tour | route"**로 변경합니다. 검색엔진에도 이 제목으로 알려줍니다.

// 화면 조립 (샌드위치 만들기):

// 빵 (DefaultLayout): 헤더(메뉴)와 푸터(하단 정보)를 먼저 준비합니다.

// 재료 (children): 실제 관광 코스 내용(page.tsx)을 가져옵니다.

// 합체: 빵 사이에 재료를 끼워 넣어 완성된 화면을 사용자에게 보여줍니다.
