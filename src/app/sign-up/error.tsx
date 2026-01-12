// 1. [지시어] "use client"
// Next.js에서 에러를 처리하는 컴포넌트(Error Boundary)는 반드시 클라이언트 컴포넌트여야 합니다.
// 왜냐하면 에러는 브라우저(클라이언트)에서 발생하고, 복구하는 버튼 클릭 같은 상호작용이 필요하기 때문입니다.
"use client";

// 2. [Import] React 라이브러리에서 필요한 기능을 가져옵니다.
// useEffect: 에러가 발생했을 때 그 순간을 포착해서 특정 작업(로그 출력 등)을 하기 위해 가져옵니다.
import { useEffect } from "react";

// 3. [Import] Next.js의 링크 기능을 가져옵니다.
// 에러가 나서 꼼짝 못 할 때, 메인 페이지('/')로 이동시켜 주는 비상구 역할을 합니다.
import Link from "next/link";

// 4. [Main Component] 에러 페이지 컴포넌트를 정의하고 내보냅니다.
// Next.js는 에러가 발생하면 자동으로 이 컴포넌트를 찾아 보여줍니다.
export default function Error({
  error, // Next.js가 보내준 실제 에러 객체입니다. (무슨 에러인지 담겨있음)
  reset, // Next.js가 보내준 마법의 함수입니다. 실행하면 페이지를 다시 그려서 복구를 시도합니다.
}: {
  // TypeScript 타입 정의입니다.
  // error: 기본 Error 객체에 digest(에러 고유 해시값)가 추가된 형태입니다.
  error: Error & { digest?: string };
  // reset: 아무것도 반환하지 않는(void) 함수 형태입니다.
  reset: () => void;
}) {
  // 5. [Effect] 에러 감지 및 로그 출력
  // 컴포넌트가 화면에 뜨거나(mount), error 내용이 바뀔 때마다 실행됩니다.
  useEffect(() => {
    // 개발자가 원인을 알 수 있도록 브라우저 콘솔에 에러 내용을 빨갛게 출력합니다.
    // 실제 서비스라면 여기서 에러 리포팅 서비스(Sentry 등)로 전송하기도 합니다.
    console.error(error);
  }, [error]); // [error]: error 변수가 변경될 때마다 이 함수를 재실행하라는 뜻입니다.

  // 6. [Render] 사용자에게 보여질 화면(UI)을 그립니다.
  return (
    // 전체 컨테이너: 화면 높이를 꽉 채우고(min-h-full), 내용물을 정중앙에 배치(place-items-center)합니다.
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      {/* 텍스트 내용들을 감싸는 박스입니다. 글씨를 가운데 정렬(text-center)합니다. */}
      <div className="text-center">
        {/* 작은 글씨로 당황한 느낌의 OOPS!를 보여줍니다. */}
        <p className="text-base font-semibold text-green-600 ">...OOPS!</p>

        {/* 가장 큰 제목: "뭔가 잘못됐어"라고 알려줍니다. */}
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Something went wrong
        </h1>

        {/* 설명 문구: 예상치 못한 에러니 아래 버튼을 눌러보라고 친절하게 안내합니다. */}
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          An unexpected error occurred. Please try again by clicking the button
          below.
        </p>

        {/* 버튼들을 감싸는 영역: 위쪽에 여백(mt-10)을 주고, 버튼들을 가로로 배치하며 간격(gap-x-6)을 줍니다. */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {/* [다시 시도 버튼] */}
          <button
            // 버튼을 클릭하면 위에서 받은 reset() 함수를 실행합니다.
            // 이 함수가 실행되면 Next.js는 현재 페이지를 새로고침하듯 다시 렌더링을 시도합니다.
            onClick={() => reset()}
            // 버튼 스타일: 초록색 배경, 둥근 모서리, 마우스 올리면 색 진해짐 등
            className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Try again
          </button>

          {/* [메인으로 가기 링크] */}
          {/* reset으로도 해결 안 될 때 도망갈 수 있는 메인 페이지 링크입니다. */}
          <Link
            href="/" // 클릭하면 메인 페이지('/')로 이동합니다.
            className="text-sm font-semibold text-gray-900 hover:text-green-500"
          >
            {/* 화살표(->) 특수문자를 포함한 텍스트입니다. */}
            Go to main page <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 사고 발생: 사용자가 페이지를 보다가 갑자기 네트워크가 끊기거나, 코드에 버그가 있어서 화면이 깨지는 치명적인 에러가 발생합니다.

// Next.js의 개입: 원래라면 화면이 하얗게 멈춰야 하지만, Next.js가 "어? 에러 났다!" 하고 감지합니다.

// 화면 교체: 깨진 페이지 대신, 지금 만드신 이 Error 컴포넌트를 화면에 띄웁니다.

// 사용자 경험:

// 사용자는 "OOPS! Something went wrong"이라는 메시지를 봅니다.

// Try again 버튼: "일시적인 오류인가?" 하고 눌러봅니다. 그러면 Next.js가 페이지를 새로고침(재렌더링) 해서 복구를 시도합니다.

// Go to main page 버튼: "아 안 되네, 그냥 홈으로 가야겠다" 하고 안전하게 메인으로 이동합니다.

// 개발자 경험: useEffect가 실행되면서 브라우저 콘솔창에는 에러 내용이 빨갛게 찍힙니다. 개발자는 이걸 보고 고칠 수 있죠.
