// --- [라이브러리 및 컴포넌트 임포트] ---

// 1. '심플한 레이아웃 컴포넌트'를 가져옵니다.
// "@/..."는 'src' 폴더를 가리키는 별칭(Alias)입니다.
// PlainLayout은 보통 헤더(메뉴)나 푸터(바닥글) 없이, 내용만 깔끔하게 중앙에 배치하는 틀입니다.
// 로그인 처리 중인 화면(스피너 등)을 보여줄 때, 불필요한 메뉴가 번쩍거리지 않게 하려고 이걸 씁니다.
import PlainLayout from "@/components/layouts/PlainLayout";

// 2. Next.js에서 제공하는 'Metadata'라는 타입(Type)을 가져옵니다.
// TypeScript에게 "이 변수는 SEO 메타데이터(제목, 설명 등) 규칙을 따라야 해"라고 알려주기 위함입니다.
// 'import type'은 실제 브라우저 실행 시점에는 사라지고, 개발 중에 오타 검사 용도로만 쓰입니다.
import type { Metadata } from "next";

// --- [SEO 및 메타데이터 설정] ---

// 3. 'metadata'라는 약속된 이름의 상수를 내보냅니다(export).
// Next.js 서버는 페이지를 만들기 전에 이 변수를 확인합니다.
// 여기서 브라우저 탭에 표시될 제목을 설정합니다.
export const metadata: Metadata = {
  // 4. 브라우저 탭 제목 설정입니다.
  // 사용자가 소셜 로그인 후 돌아오는 콜백 페이지에 잠깐 머무를 때, 탭 제목이 "다잇슈대전 | Callback"으로 보입니다.
  title: "다잇슈대전 | Callback",
};

// --- [레이아웃 컴포넌트 정의] ---

// 5. Layout 컴포넌트 함수를 정의하고 내보냅니다(export default).
// Next.js는 화면을 그릴 때, 해당 폴더(callback)의 내용물(page.tsx)을 그리기 전에 이 Layout 함수를 먼저 호출합니다.
export default function Layout({
  children, // 6. 이 레이아웃이 감싸게 될 '실제 알맹이(페이지 내용)'를 전달받습니다. (예: "로그인 처리 중..." 메시지)
}: Readonly<{
  // 7. TypeScript 타입 정의 부분입니다.
  // children은 'React.ReactNode' 타입이어야 합니다. (화면에 그릴 수 있는 모든 요소: HTML 태그, 텍스트, 컴포넌트 등)
  // Readonly는 이 props 객체를 함수 내부에서 실수로 수정하지 못하도록 '읽기 전용'으로 잠가둡니다.
  children: React.ReactNode;
}>) {
  // --- [화면 렌더링 (JSX 반환)] ---

  // 8. 최종적으로 브라우저에 그려질 HTML 구조를 반환합니다.
  // 아까 가져온 <PlainLayout> (아무것도 없는 깨끗한 틀) 사이에 {children} (로그인 처리 페이지)을 쏙 집어넣습니다.
  // 결과적으로 화면에는 헤더/푸터 없이 오직 "로그인 중..." 같은 내용만 깔끔하게 뜨게 됩니다.
  return <PlainLayout>{children}</PlainLayout>;
}

// 1. 콜백 요청 수신 (Request)

// 카카오 서버가 사용자를 http://사이트주소/auth/callback/kakao 같은 주소로 다시 보내줍니다.

// Next.js 서버는 이 주소에 해당하는 폴더를 찾습니다.

// 2. 레이아웃 감지 및 메타데이터 적용 (Setup)

// 해당 폴더에 있는 layout.tsx (이 파일)를 읽습니다.

// metadata를 확인하고 브라우저 탭 제목을 **"다잇슈대전 | Callback"**으로 설정합니다.

// 3. 레이아웃 구조 형성 (Wrapping)

// 서버는 Layout 함수를 실행합니다.

// 동시에 실제 로직을 처리하는 page.tsx (토큰을 저장하고 메인으로 이동시키는 로직이 들어있는 파일)를 실행해 children에 담습니다.

// 그리고 PlainLayout으로 이 children을 감쌉니다.

// 4. 최종 화면 표시 (Rendering)

// 브라우저 화면: 헤더나 푸터 없이, 화면 중앙에 "로그인 처리 중입니다..." 혹은 로딩 스피너만 깔끔하게 뜹니다.

// 사용자 경험: 화면이 번잡스럽지 않고, 아주 잠깐 로딩 화면만 보였다가 로그인이 완료되면 메인 페이지로 슉! 하고 이동하게 됩니다.
