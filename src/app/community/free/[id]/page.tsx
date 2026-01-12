// "use client": 이 파일이 서버가 아닌 브라우저(클라이언트)에서 실행되는 컴포넌트임을 선언합니다.
// (리액트의 use 훅을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
// 1. React 19 / Next.js 15에서 새로 도입된 'use' 훅을 가져옵니다.
// 이 훅은 Promise(비동기 작업)를 마치 동기 변수처럼 풀어서 값을 꺼낼 때 사용합니다.
import { use } from "react";

// 2. 게시글 상세 내용을 보여주는 '공통 컴포넌트'를 가져옵니다.
// 자유게시판, 공지사항, 투어리뷰 등 여러 게시판에서 디자인을 재사용하기 위해 만들어둔 컴포넌트입니다.
import CommonPostDetail from "@/components/community/CommunityPostDetail";

import { notFound } from "next/navigation";

// --- [메인 페이지 컴포넌트 정의] ---
export default function FreeBoardDetail({
  params, // 3. Next.js 라우터가 넘겨주는 URL 파라미터를 받습니다. (예: /free/123 에서 '123')
}: {
  // 4. 타입 정의: Next.js 15부터는 params가 바로 객체가 아니라 'Promise' 타입입니다.
  // 즉, "기다리면 { id: string } 객체를 줄게"라는 약속 상자 형태로 들어옵니다.
  params: Promise<{ id: string }>;
}) {
  // 5. [핵심] use 훅을 사용하여 Promise인 params를 풀어헤칩니다.
  // params라는 약속 상자를 열어서 그 안에 들어있는 실제 'id' 값을 꺼내옵니다.
  // 예: params가 Promise({ id: "50" })라면, 여기서 id 변수에 "50"이 저장됩니다.
  const { id } = use(params);

  // --- [화면 렌더링 (JSX 반환)] ---
  // 6. 공통 컴포넌트(CommonPostDetail)에게 "자유게시판용 설정을 가지고 화면을 그려줘"라고 명령합니다.
  return (
    <CommonPostDetail
      postId={id} // 7. 위에서 꺼낸 게시글 번호("50")를 넘겨줍니다.
      theme="green" // 8. 테마 색상을 초록색(green)으로 설정합니다.
      categoryLabel="Free Board" // 9. 화면 상단에 "Free Board"라고 표시하라고 알려줍니다.
      listPath="/community/free" // 10. "목록으로" 버튼을 눌렀을 때 이동할 주소입니다.
      // 11. 이 컴포넌트가 서버와 통신할 때 사용할 API 주소들을 꾸러미로 묶어서 넘겨줍니다.
      // CommonPostDetail은 이 주소들만 알면, 어느 게시판이든 상관없이 동작할 수 있습니다.
      apiEndpoints={{
        fetchPost: `/community/free/${id}`, // 12. 글 내용을 가져올 API 주소 (GET
        deletePost: `/community/free/${id}`, // 13. 글 삭제할 API 주소 (DELETE)
        fetchComments: `/community/comments/${id}`, // 14. 댓글 목록을 가져올 API 주소 (GET)
        postComment: "/community/comments", // 15. 새 댓글을 등록할 API 주소 (POST)
        deleteComment: "/community/comments/delete", // 16. 댓글을 삭제할 API 주소 (DELETE/POST)
      }}
    />
  );
}

// 1. 라우팅 및 파라미터 캡처 (Server & Router)

// Next.js 서버는 URL에서 /community/free/ 뒤에 있는 숫자 777을 발견합니다.

// 이 숫자를 id라는 이름의 파라미터로 인식합니다.

// 그리고 이 값을 바로 주는 게 아니라, "나중에 줄게"라는 의미의 Promise 객체로 포장해서 FreeBoardDetail 컴포넌트에게 params라는 이름으로 던져줍니다.

// 2. 컴포넌트 실행 및 데이터 언랩핑 (Component Execution)

// FreeBoardDetail 함수가 실행됩니다.

// const { id } = use(params); 줄을 만납니다.

// use 훅의 역할: "잠깐! 이 params는 Promise니까 내용물이 나올 때까지 기다렸다가, 나오면 껍질을 까고 id만 줘!"라고 동작합니다.

// Promise가 즉시 해결(Resolve)되면서 id 변수에는 문자열 "777"이 담깁니다.

// 3. 하청 업체에 작업 지시 (Delegation)

// FreeBoardDetail은 직접 데이터를 가져오거나 화면을 그리지 않습니다. "디자인 담당자"인 <CommonPostDetail>을 호출합니다.

// 이때 그냥 부르는 게 아니라 작업지시서를 꼼꼼하게 적어서 넘깁니다.

// "게시글 번호는 777번이야." (postId)

// "테마는 초록색으로 해." (theme)

// "데이터 가져올 때는 /community/free/777로 요청해." (apiEndpoints)

// 4. 최종 렌더링 (Painting)

// 이제 공통 컴포넌트(CommonPostDetail)가 이 지시서(Props)를 받아서 실제로 서버에 API 요청을 보내고, 데이터를 받아와서 예쁜 상세 페이지를 사용자에게 보여줍니다.
