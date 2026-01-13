// 1. [Import] Next.js에서 제공하는 'Metadata' 타입을 가져옵니다.
// TypeScript에게 "이 변수는 웹사이트의 제목과 설명을 담는 데이터야!"라고 알려주는 역할을 합니다.
import type { Metadata, Viewport } from "next";

// 2. [Import] 전역 스타일 시트(CSS)를 불러옵니다.
// 이 파일(globals.css)에 정의된 스타일은 사이트의 모든 페이지에 적용됩니다. (예: Tailwind 설정, 기본 배경색 등)
import "./globals.css";

// 3. [Import] Next.js의 폰트 최적화 기능을 가져옵니다.
// 구글 폰트가 아니라, 내 컴퓨터(프로젝트 폴더)에 있는 폰트 파일을 직접 불러와서 웹폰트로 쓰겠다는 뜻입니다.
import localFont from "next/font/local";

// 4. [Font Config] 'Pretendard' 폰트를 설정하는 부분입니다.
const pretendard = localFont({
  // 폰트 파일의 위치입니다. 현재 폴더의 fonts 폴더 안에 있는 woff2 파일을 씁니다.
  // (woff2는 압축률이 좋아서 웹에서 가장 많이 쓰는 폰트 포맷입니다.)
  src: "./fonts/PretendardVariable.woff2",

  // 폰트가 로딩되는 동안 시스템 폰트를 보여주다가, 로딩이 끝나면 샥! 바꿔주는 설정입니다. (깜빡임 방지)
  display: "swap",

  // 이 폰트는 '가변 폰트(Variable Font)'입니다.
  // 굵기를 45부터 920까지 자유자재로 조절할 수 있다는 뜻입니다. (파일 하나로 얇은 글씨, 두꺼운 글씨 다 됨)
  weight: "45 920",

  // 이 폰트를 CSS에서 쓸 때 부를 이름(변수명)을 정합니다.
  // 나중에 CSS에서 'var(--font-pretendard)'라고 쓰면 이 폰트가 적용됩니다.
  variable: "--font-pretendard",
});

// 5. [Metadata] 사이트의 대문 정보를 설정합니다. (SEO - 검색엔진 최적화)
export const metadata: Metadata = {
  // 브라우저 탭에 표시될 이름입니다.
  title: "다잇슈대전",
  // 검색엔진(구글, 네이버)이나 카톡 공유 미리보기에 뜰 설명글입니다.
  description: "대전 지역 커뮤니티 사이트",
};

// ++ 뷰포트 설정 (모바일화면시 화면이 고정되어 자동확대되지 않음)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 6. [Root Layout] 이 프로젝트의 최상위 컴포넌트(함수)입니다.
// 모든 페이지는 무조건 이 함수를 거쳐갑니다.
export default function RootLayout({
  // 'children'은 "자식 내용물"이라는 뜻입니다.
  // 사용자가 로그인 페이지에 가면 children은 로그인 폼이 되고, 메인에 가면 메인 화면이 됩니다.
  children,
}: Readonly<{
  // TypeScript 타입 정의: children은 리액트가 그릴 수 있는 모든 요소(태그, 컴포넌트 등)입니다.
  children: React.ReactNode;
}>) {
  // 7. [Render] 최종적으로 브라우저에 그려질 HTML 뼈대를 반환합니다.
  return (
    // html 태그: 웹페이지의 시작입니다.
    // lang="ko": "이 사이트는 한국어 사이트야"라고 검색엔진과 브라우저에 알립니다.
    // className: 아까 설정한 프리텐다드 폰트 변수를 html 태그에 등록합니다.
    // 이제 이 태그 하위에 있는 모든 요소는 프리텐다드 폰트를 쓸 수 있게 됩니다.
    <html lang="ko" className={`${pretendard.variable}`}>
      {/* body 태그: 실제 화면에 보이는 내용이 들어가는 곳입니다. */}
      {/* {children}: 여기가 바로 알맹이(페이지 내용)가 들어가는 자리입니다! */}
      <body>{children}</body>
    </html>
  );
}

// 접속 요청: 사용자가 www.다잇슈대전.com에 접속합니다.

// Next.js의 기초 공사:

// Next.js는 가장 먼저 이 RootLayout 파일을 찾습니다.

// "아, 이 사이트는 전체적으로 **한국어(lang="ko")**로 설정해야 하고, 폰트는 **프리텐다드(Pretendard)**를 쓰는구나!"라고 인식합니다.

// globals.css를 읽어서 사이트 전체에 적용될 **기본 스타일(배경색, 글자 크기 등)**을 준비합니다.

// 메타데이터 설정:

// 브라우저 탭에 **"다잇슈대전"**이라는 제목을 달고, 검색엔진(구글, 네이버)에게 "이곳은 대전 지역 커뮤니티 사이트입니다"라고 설명표(description)를 붙입니다.

// 내용 합체 (렌더링):

// 사용자가 요청한 **실제 페이지 내용(예: 메인 페이지)**을 children이라는 변수로 받습니다.

// 준비해둔 <body> 태그 안에 그 내용을 쏙 집어넣습니다.

// 전송: 이렇게 완성된 하나의 거대한 HTML 문서를 사용자의 브라우저로 보내줍니다.
