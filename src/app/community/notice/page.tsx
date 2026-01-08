// 1. "use client": 이 파일이 브라우저에서 실행되는 클라이언트 컴포넌트임을 선언합니다.
// 이 페이지 안에서 클릭 이벤트나 화면 전환 등의 브라우저 기능이 작동해야 하기 때문입니다.
"use client";

// 2. 공통으로 사용되는 '만능 게시판 목록 컴포넌트'를 불러옵니다.
// 자유게시판 때와 똑같은 컴포넌트이지만, 설정값만 바꿔서 공지사항용으로 재사용합니다.
import CommonBoardList from "@/components/community/CommunityBoardList";

// 3. 페이지의 메인 함수입니다. '/community/notice' 경로로 들어오면 이 함수가 실행됩니다.
export default function NoticeBoardList() {
  // 4. 화면에 그릴 내용을 반환합니다.
  return (
    // 5. 불러온 CommonBoardList 컴포넌트를 실행합니다.
    // 여기서부터는 "이 목록을 공지사항처럼 보이게 꾸며줘"라고 설정값(Props)을 하나씩 넘겨주는 과정입니다.
    <CommonBoardList
      theme="slate" // 6. 테마 색상을 '회색(slate)' 계열로 설정합니다. (공지사항다운 차분하고 공식적인 느낌)
      title="공지사항" // 7. 페이지 최상단에 큰 글씨로 표시될 제목입니다.
      description="Local Hub의 새로운 소식과 주요 업데이트를 확인하세요." // 8. 제목 아래에 들어갈 부가 설명입니다.
      // 9. 상단 배너에 사용할 배경 이미지 주소입니다. (오피스 느낌이 나는 깔끔한 이미지를 사용했네요.)
      headerImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920"
      // 10. [핵심] 데이터를 가져올 API 주소입니다.
      // CommonBoardList는 이 주소를 받아 내부적으로 'axios.get("/community/notice")'를 실행해 공지사항 데이터만 가져옵니다.
      apiEndpoint="/community/notice"
      // 11. '글쓰기' 버튼을 눌렀을 때 이동할 주소입니다.
      // [중요] '?category=NOTICE'를 붙여서, 글쓰기 페이지에 갔을 때 자동으로 '공지사항' 카테고리가 선택되도록 합니다.
      writeLink="/community/write?category=NOTICE"
      // 12. 만약 서버에서 가져온 공지사항 데이터가 하나도 없을 때 보여줄 안내 문구입니다.
      emptyMessage="아직 등록된 공지사항이 없습니다."
      // 13. [추가] 제목 옆이나 배너에 'Official'이라는 작은 뱃지를 달아주라고 지시합니다.
      // 자유게시판에는 없던 속성으로, 공지사항만의 특별한 표식입니다.
      badgeText="Official"
    />
  );
}

// 1. 페이지 진입 및 컴포넌트 호출 (Routing)

// 브라우저가 /community/notice 주소를 인식합니다.

// Next.js 라우터는 이 주소에 해당하는 NoticeBoardList 함수를 찾아 실행합니다.

// 2. 작업 지시서(Props) 작성 및 위임 (Configuration)

// NoticeBoardList 함수는 직접 일하지 않습니다. 즉시 CommonBoardList를 호출합니다.

// 호출하면서 **"공지사항용 작업 지시서(Props)"**를 작성해서 건네줍니다.

// "분위기는 **회색(Slate)**으로 진지하게 잡아." (theme)

// "제목은 공지사항이고, 배경은 이 오피스 사진 써." (title, headerImage)

// "데이터는 /community/notice에서 가져와." (apiEndpoint)

// "누가 글 쓴다고 하면 ?category=NOTICE 붙여서 보내." (writeLink)

// "그리고 Official 딱지 꼭 붙여." (badgeText)

// 3. 실무자(CommonBoardList)의 실행 (Execution)

// 이제 CommonBoardList가 이 지시서를 받고 움직입니다.

// API 요청: 지시서에 적힌 /community/notice로 서버에 데이터를 달라고 요청합니다.

// 화면 렌더링:

// 데이터를 기다리는 동안 로딩 바를 보여줍니다.

// 데이터가 도착하면, 회색 톤의 디자인(theme="slate")으로 게시글 카드들을 예쁘게 나열합니다.

// 상단에는 'Official' 뱃지가 붙은 배너가 그려집니다.

// 4. 글쓰기 버튼 동작 (Interaction)

// 사용자가 (주로 관리자겠죠?) [글쓰기] 버튼을 클릭합니다.

// 브라우저는 writeLink에 적힌 대로 /community/write?category=NOTICE로 이동합니다.

// 이동한 글쓰기 페이지는 URL의 ?category=NOTICE를 보고, 카테고리 드롭다운을 미리 '공지사항'으로 딱 맞춰놓습니다.
