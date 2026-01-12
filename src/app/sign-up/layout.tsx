// 1. [Import] 미리 만들어둔 'PlainLayout' 컴포넌트를 가져옵니다.
// PlainLayout은 보통 상단 메뉴바(Header)나 하단 정보(Footer)가 없는,
// 오직 '내용물'만 보여주는 아주 단순하고 깨끗한 레이아웃입니다.
// "@/components/..."는 프로젝트 내의 경로를 뜻합니다.
import PlainLayout from "@/components/layouts/PlainLayout";

// 2. [Import] Next.js에서 제공하는 'Metadata' 타입을 가져옵니다.
// TypeScript에게 "이제부터 만들 변수는 페이지 정보를 담는 메타데이터야!"라고
// 알려주기 위해 사용합니다. (타입 검사 및 자동완성 지원)
import type { Metadata } from "next";

// 3. [Metadata 설정] 이 페이지의 메타데이터(정보)를 정의하여 내보냅니다.
// Next.js는 이 'metadata'라는 변수명을 인식해서 자동으로 HTML <head> 태그를 수정해줍니다.
export const metadata: Metadata = {
  // 브라우저 탭에 표시될 제목입니다.
  // 사용자가 이 페이지에 들어오면 탭 이름이 "다잇슈대전 | Sign-Up"으로 바뀝니다.
  title: "다잇슈대전 | Sign-Up",
};

// 4. [Main Component] 실제 레이아웃을 구성하는 함수입니다.
// Next.js는 페이지를 그릴 때 이 'Layout' 함수를 가장 먼저 실행하여 껍데기를 만듭니다.
export default function Layout({
  // 5. [Props] 'children'이라는 이름으로 들어오는 재료를 받습니다.
  // 여기서 'children'은 바로 이 폴더에 있는 `page.tsx` (실제 회원가입 입력 폼)입니다.
  // 즉, "내용물"을 전달받는 것입니다.
  children,
}: Readonly<{
  // 6. [TypeScript] 'children'이 무엇인지 타입을 정의합니다.
  // React.ReactNode: 리액트가 화면에 그릴 수 있는 모든 것(HTML 태그, 컴포넌트, 텍스트 등)을 의미합니다.
  // Readonly: 이 props 객체는 수정할 수 없고 읽기만 가능하다는 안전장치입니다.
  children: React.ReactNode;
}>) {
  // 7. [Return] 최종적으로 브라우저에 그려질 구조를 반환합니다.
  // <PlainLayout> 태그로 전체를 감싸고, 그 사이에 {children}(회원가입 폼)을 넣습니다.
  // 결론: "회원가입 폼을 깨끗한 레이아웃(PlainLayout)으로 포장해서 보여줘라"는 뜻입니다.
  return <PlainLayout>{children}</PlainLayout>;
}

// 진입: 사용자가 메인 페이지나 로그인 화면에서 "회원가입" 버튼을 누릅니다.

// 라우팅: 브라우저 주소가 /sign-up으로 변합니다.

// Next.js의 준비:

// Next.js는 /sign-up/page.tsx (실제 가입 폼)를 보여주기 전에, "이 페이지를 감싸는 포장지(Layout)가 있나?" 확인합니다.

// 바로 지금 보시는 이 layout.tsx 파일을 발견합니다.

// 레이아웃 적용:

// 제목 변경: 브라우저 탭의 이름을 **"다잇슈대전 | Sign-Up"**으로 갈아끼웁니다.

// 틀 잡기: PlainLayout이라는 아무것도 없는 깨끗한 레이아웃을 가져와서 준비합니다. (헤더/푸터 제거)

// 내용 주입: 준비된 PlainLayout 안에 실제 회원가입 폼(page.tsx의 내용)을 쏙 집어넣어서 화면에 그려줍니다.
