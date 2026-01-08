// "use client": 이 파일이 서버가 아닌 브라우저(클라이언트)에서 실행되는 컴포넌트임을 선언합니다.
// (리액트의 use 훅을 사용하기 위해 필수입니다.)
"use client";

// --- [라이브러리 및 컴포넌트 임포트] ---
// 1. React 19 / Next.js 15의 핵심 기능인 'use' 훅을 가져옵니다.
// 비동기 데이터(Promise)를 동기 데이터처럼 편하게 꺼내 쓸 수 있게 해주는 도구입니다.
import { use } from "react"; //

// 2. 게시글 상세 내용을 보여주는 '만능 공통 컴포넌트'를 가져옵니다.
// 이 컴포넌트 하나로 자유게시판, 공지사항 등 모든 상세 페이지 디자인을 처리합니다.
import CommonPostDetail from "@/components/community/CommunityPostDetail";

// --- [메인 페이지 컴포넌트 정의] ---
// 3. 페이지 컴포넌트 함수를 정의하고 내보냅니다.
export default function RecommendPostDetail({
  params, // 4. Next.js 라우터가 URL에 있는 id 값을 'Promise' 형태로 포장해서 넘겨줍니다.
}: {
  // 5. 타입 정의: Next.js 15부터 params는 무조건 'Promise' 타입입니다.
  // "기다리면 { id: string } 객체가 나오는 약속 상자"라는 뜻입니다.
  params: Promise<{ id: string }>;
}) {
  // 6. [핵심] use 훅을 사용해 params 약속 상자를 엽니다.
  // 상자가 열릴 때까지 기다렸다가, 그 안에 있는 실제 'id' 값(게시글 번호)을 꺼내옵니다.
  const { id } = use(params);

  // --- [화면 렌더링 (JSX 반환)] ---
  // 7. 공통 컴포넌트(CommonPostDetail)에게 "공지사항 설정으로 그려줘"라고 명령합니다.
  return (
    <CommonPostDetail
      postId={id} // 8. URL에서 꺼낸 게시글 번호를 넘겨줍니다.
      theme="slate" // 9. 테마 색상을 '회색(slate)' 계열로 설정합니다. (공지사항의 차분한 느낌)
      categoryLabel="Notice" // 10. 화면 왼쪽 상단에 "Notice"라는 라벨을 붙이라고 지시합니다.
      listPath="/community/notice" // 11. '목록으로' 버튼을 누르면 공지사항 목록으로 가도록 설정합니다.
      // 12. 공지사항 전용 API 주소들을 묶어서 전달합니다.
      // CommonPostDetail은 이 주소로 데이터를 요청하게 됩니다.
      apiEndpoints={{
        fetchPost: `/community/post/${id}`, // 13. 공지사항 상세 내용을 가져올 주소 (GET)
        deletePost: `/community/post/${id}`, // 14. [중요] 게시글 삭제할 주소 (DELETE) - 관리자용 기능일 것입니다.
        fetchComments: `/community/comments/${id}`, // 15. 댓글 목록 가져올 주소 (GET)
        postComment: "/community/comments", // 16. 댓글 등록할 주소 (POST)
        deleteComment: "/community/comments/delete", // 17. 댓글 삭제할 주소 (DELETE/POST)
      }}
    />
  );
}

// 1. URL 파싱 및 페이지 진입 (Server & Router)

// Next.js 서버는 /community/notice/99 요청을 받고, 이 페이지 파일(RecommendPostDetail)을 실행할 준비를 합니다.

// URL 맨 뒤의 숫자 99를 파라미터로 인식합니다.

// Next.js 15의 규칙에 따라 이 99를 바로 주지 않고, Promise 객체(잠시 후에 줄게!) 로 감싸서 params라는 이름으로 컴포넌트에 던져줍니다.

// 2. Promise 해제 및 ID 추출 (Component Logic)

// 컴포넌트가 실행되면서 const { id } = use(params); 줄을 만납니다.

// use 훅이 작동하여 params라는 포장을 뜯습니다.

// 포장 안에 들어있던 실제 문자열 값 "99"가 id 변수에 저장됩니다.

// 3. 작업 지시서 작성 및 하청 (Props Passing)

// RecommendPostDetail은 직접 화면을 그리지 않고, CommonPostDetail을 호출합니다.

// 이때 **"공지사항용 작업 지시서(Props)"**를 작성해서 넘깁니다.

// "글 번호는 99번이야."

// "색깔은 **회색(Slate)**으로 점잖게 해줘."

// "왼쪽에 Notice라고 이름표 붙여."

// "데이터는 /community/post/99 여기 가서 가져와."

// 4. 데이터 통신 및 렌더링 (Fetching & UI)

// 이제 공통 컴포넌트(CommonPostDetail)가 이 지시서를 받고 실제 행동을 개시합니다.

// 지시서에 적힌 주소(apiEndpoints.fetchPost)로 서버에 요청을 보냅니다.

// 서버에서 글 내용(제목, 본문, 작성자 등)이 도착하면, 회색 테마의 깔끔한 디자인으로 화면을 꽉 채워 보여줍니다.
