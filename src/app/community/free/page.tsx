// // app/community/free/page.tsx : 이 파일의 경로를 나타내는 주석입니다.

// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// 이 페이지가 클릭 이벤트나 브라우저 기능(Hooks)을 사용하는 하위 컴포넌트를 포함하기 때문입니다.
"use client";

// 2. 공통으로 사용되는 '게시판 목록 컴포넌트'를 불러옵니다.
// 이 컴포넌트 안에는 목록 조회, 페이지네이션, 검색 기능 등이 이미 다 구현되어 있습니다.
import CommonBoardList from "@/components/community/CommunityBoardList";
import React, { Suspense } from 'react';
// 3. 페이지의 메인 함수입니다. 파일명(page.tsx)에 따라 '/community/free' 경로로 접속하면 이 함수가 실행됩니다.
export default function FreeBoardList() {
  // 4. 화면에 그릴 내용을 반환합니다.
  return (
    // 5. 불러온 CommonBoardList 컴포넌트를 실행합니다.
    // 여기서부터는 이 컴포넌트에게 "자유게시판처럼 보이게 해줘"라고 설정값(Props)을 넘겨주는 과정입니다.
    <Suspense fallback={<div>로딩 중...</div>}>
      <CommonBoardList
        theme="green" // 6. 테마 색상을 '초록색'으로 설정합니다. (버튼 색, 강조 색 등)
        title="자유게시판" // 7. 페이지 상단에 큼지막하게 표시될 제목입니다.
        description="대전 시민들의 솔직하고 담백한 이야기" // 8. 제목 밑에 들어갈 작은 설명 문구입니다.
        // 9. 상단 배너에 깔릴 배경 이미지 주소입니다. (Unsplash 이미지 사용 중)
        headerImage="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1920"
        // 10. [핵심] 데이터를 가져올 API 주소입니다.
        // CommonBoardList는 이 주소를 받아서 내부적으로 'axios.get("/community/free")'를 실행하게 됩니다.
        apiEndpoint="/community/free"
        // 11. '글쓰기' 버튼을 눌렀을 때 이동할 경로입니다.
        writeLink="/community/write"
        // 12. 만약 게시글이 하나도 없을 때, 화면 덩그러니 비워두지 않고 보여줄 안내 문구입니다.
        emptyMessage="첫 번째 이야기의 주인공이 되어보세요!"
      />
    </Suspense>
  );
}

// 1. 라우팅 및 컴포넌트 호출 (Routing)

// 사용자가 /community/free URL로 요청을 보냅니다.

// Next.js 라우터는 해당 경로에 매칭되는 app/community/free/page.tsx 파일을 찾습니다.

// 그리고 이 파일 안에 있는 FreeBoardList 함수를 실행(호출)합니다.

// 2. 설정값 주입 (Props Injection)

// FreeBoardList 함수는 별다른 로직 없이 즉시 return 문을 실행합니다.

// 이때 <CommonBoardList ... />를 만나는데, 여기에 작성된 속성들(theme, title, apiEndpoint 등)을 하나의 객체(Props)로 묶습니다.

// 이 설정값 꾸러미를 CommonBoardList 컴포넌트에게 전달하면서 실행 권한을 넘깁니다.

// 3. 데이터 요청 및 렌더링 위임 (Delegation)

// 이제부터는 CommonBoardList가 주인공입니다. (이 파일의 코드는 아니지만, 실행 흐름상 여기서 동작합니다.)

// CommonBoardList는 전달받은 apiEndpoint="/community/free" 값을 이용해 **서버에 API 요청(GET)**을 보냅니다.

// 동시에 theme="green"과 headerImage 값을 이용해 초록색 테마의 상단 배너를 그립니다.

// 데이터가 로딩되는 동안에는 로딩 스피너를 보여주다가, 데이터가 도착하면 게시글 목록을 카드 형태로 쫘르륵 보여줍니다.

// 4. 상호작용 준비 (Interaction Ready)

// 화면에 "글쓰기" 버튼이 렌더링 됩니다. 이 버튼에는 위에서 넘겨준 writeLink="/community/write"가 연결되어 있습니다.

// 사용자가 버튼을 누르면 해당 링크로 이동하게 됩니다.
