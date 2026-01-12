// 1. [Import] 미리 만들어둔 'PlainLayout'이라는 컴포넌트를 가져옵니다.
// PlainLayout은 보통 헤더(Header)나 푸터(Footer)가 없는, 아주 깨끗한 도화지 같은 레이아웃입니다.
// "@/components/..."는 프로젝트의 components 폴더를 가리키는 지름길(Alias)입니다.
import PlainLayout from "@/components/layouts/PlainLayout";

// 2. [Import] Next.js에서 제공하는 'Metadata'라는 타입을 가져옵니다.
// TypeScript에게 "이 변수는 페이지 정보를 담는 메타데이터야!"라고 알려주기 위함입니다.
// 'type'이라고 붙인 건, 자바스크립트로 변환될 때는 사라지는 순수 타입 정보라는 뜻입니다.
import type { Metadata } from "next";

// 3. [Metadata 설정] 이 페이지의 메타데이터(정보)를 정의해서 내보냅니다(export).
// Next.js는 이 변수를 읽어서 브라우저 탭 제목이나 검색엔진 정보를 자동으로 설정해 줍니다.
export const metadata: Metadata = {
  // 브라우저 탭에 표시될 제목입니다.
  // 예: 크롬 탭에 "다잇슈대전 | Callback"이라고 뜹니다.
  title: "다잇슈대전 | Callback",
};

// 4. [Main Component] 실제 레이아웃을 그리는 함수(컴포넌트)를 정의하고 내보냅니다(export default).
// 이 함수의 이름은 'Layout'이고, Next.js가 이 페이지를 그릴 때 가장 먼저 호출합니다.
export default function Layout({
  // 5. [Props] 부모(Next.js)가 이 레이아웃 안에 넣을 '내용물'을 'children'이라는 이름으로 줍니다.
  // 여기서 'children'은 바로 이 폴더에 있는 `page.tsx` (실제 로그인 처리 화면)가 됩니다.
  children,
}: Readonly<{
  // 6. [TypeScript] 'children'이 어떤 타입인지 정의합니다.
  // Readonly: 이 props는 읽기 전용이라 수정할 수 없다는 뜻입니다. (안전장치)
  // React.ReactNode: 리액트가 화면에 그릴 수 있는 모든 것(태그, 컴포넌트, 글씨 등)을 의미합니다.
  children: React.ReactNode;
}>) {
  // 7. [Return] 최종적으로 화면에 그려질 HTML 구조를 반환합니다.
  // 가져왔던 <PlainLayout> 태그로 감싸고, 그 안에 내용물({children})을 쏙 집어넣습니다.
  // 즉, "내용물(page.tsx)을 깔끔한 레이아웃(PlainLayout)으로 포장해서 보여줘라"는 뜻입니다.
  return <PlainLayout>{children}</PlainLayout>;
}

// 상황: 사용자가 카카오 로그인 버튼을 누르고 인증을 마친 뒤, 다시 우리 사이트(.../callback)로 돌아왔습니다.

// Next.js의 판단: "어? 사용자가 /callback 주소로 들어왔네? 이 주소에 맞는 page.tsx(내용물)를 보여줘야겠다."

// 레이아웃의 개입 (이 코드의 역할):

// "잠깐! 내용을 보여주기 전에 **포장지(Layout)**부터 씌워야 해."

// "이 페이지의 브라우저 탭 제목은 **'다잇슈대전 | Callback'**으로 바꿔줘."

// "그리고 이 페이지는 복잡한 메뉴판(헤더) 필요 없어. 그냥 **아무것도 없는 깔끔한 상자(PlainLayout)**에 내용을 담아서 보여줘."

// 결과: 사용자는 흰 배경(또는 심플한 배경) 위에서 "로그인 처리 중..." 같은 메시지만 깔끔하게 보게 됩니다.
