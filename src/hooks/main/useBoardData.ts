// 1. [Imports] React의 상태 관리(useState)와 생명주기(useEffect) 훅을 가져옵니다.
import { useState, useEffect } from "react";

// 2. [Imports] 서버와 통신할 '게시판 서비스' API 함수들을 가져옵니다.
import { boardService } from "@/api/services";

// 3. [Imports] 게시글 데이터가 어떻게 생겼는지 정의해둔 타입(설명서)을 가져옵니다.
import { PostData } from "@/types/board";

// 4. [Custom Hook Definition] 'useBoardData'라는 이름의 커스텀 훅을 만듭니다.
// 이 훅을 호출하면 게시판 데이터 로딩 로직이 자동으로 수행됩니다.
export const useBoardData = () => {
  // 5. [State] 자유게시판 글 목록을 담을 상태 변수입니다. 초기값은 빈 배열([])입니다.
  const [freePosts, setFreePosts] = useState<PostData[]>([]);

  // 6. [State] 공지사항 글 목록을 담을 상태 변수입니다. 초기값은 빈 배열([])입니다.
  const [noticePosts, setNoticePosts] = useState<PostData[]>([]);

  // 7. [State] 현재 데이터를 불러오는 중인지 표시하는 변수입니다. 시작하자마자 로딩 중(true)입니다.
  const [loading, setLoading] = useState(true);

  // 8. [Effect] 컴포넌트가 처음 화면에 나타날 때(마운트 될 때) 딱 한 번 실행되는 로직입니다.
  useEffect(() => {
    // 9. [Async Function] 데이터를 비동기로 가져오는 내부 함수를 정의합니다.
    const fetchBoards = async () => {
      try {
        // 10. [Loading Start] "이제 데이터 가져오기 시작한다!"라고 알립니다. (안전장치)
        setLoading(true);

        // 11. [Parallel Fetching] 자유게시판과 공지사항 데이터를 '동시에' 요청합니다. (Promise.all)
        // 두 요청이 모두 끝날 때까지 기다렸다가 결과를 freeRes, bestRes에 각각 담습니다.
        // 이렇게 하면 하나씩 하는 것보다 시간이 절약됩니다.
        const [freeRes, bestRes] = await Promise.all([
          boardService.getBoardPosts("free"), // 자유게시판 요청
          boardService.getBoardPosts("notice"), // 공지사항 요청
        ]);

        // 12. [Helper Function] 서버에서 온 데이터를 우리 입맛에 맞게 다듬는 '정규화(Normalize)' 함수입니다.
        const normalize = (data: any[]): PostData[] =>
          // (data || []): 데이터가 혹시 null이면 빈 배열로 처리해서 에러를 방지합니다.
          // .slice(0, 5): 최신 글 5개만 필요하므로 앞에서부터 5개를 자릅니다.
          (data || []).slice(0, 5).map(
            (item) =>
              ({
                // 13. [Defensive Coding] DB 컬럼명이 대문자(ID)일 수도, 소문자(id)일 수도 있어서 둘 다 체크합니다.
                // item.ID가 있으면 그걸 쓰고, 없으면 item.id를 씁니다. (?? 연산자)
                id: item.ID ?? item.id,
                userId: item.USER_ID ?? item.userId,
                title: item.TITLE ?? item.title,
                // 조회수의 경우 값이 없으면 0으로 채워줍니다.
                viewCount: item.VIEW_COUNT ?? item.viewCount ?? 0,
                createdAt: item.CREATED_AT ?? item.createdAt,
              } as PostData) // 최종적으로 PostData 모양으로 강제 변환합니다.
          );

        // 14. [State Update] 다듬어진 데이터를 자유게시판 상태에 저장합니다.
        setFreePosts(normalize(freeRes.data));

        // 15. [State Update] 다듬어진 데이터를 공지사항 상태에 저장합니다.
        setNoticePosts(normalize(bestRes.data));
      } catch (error) {
        // 16. [Error Handling] 통신 중 문제가 생기면(인터넷 끊김 등) 에러를 콘솔에 출력합니다.
        console.error("게시판 데이터 로드 실패:", error);
      } finally {
        // 17. [Loading End] 성공하든 실패하든 작업이 끝났으니 로딩 상태를 끕니다(false).
        setLoading(false);
      }
    };

    // 18. [Execute] 위에서 정의한 데이터 가져오기 함수를 실제로 실행합니다.
    fetchBoards();
  }, []); // 19. [Dependency Array] 빈 배열이므로 이 훅이 처음 사용될 때 딱 1번만 실행됩니다.

  // 20. [Return] 컴포넌트가 사용할 수 있도록 데이터와 로딩 상태를 객체로 묶어서 반환합니다.
  return { freePosts, noticePosts, loading };
};

// 출근 (Mount):

// 메인 페이지가 켜지면 이 useBoardData 훅도 같이 실행됩니다.

// 가장 먼저 "일단 로딩 중이야!"라고 깃발(loading: true)을 듭니다.

// 동시 요청 (Promise.all):

// 효율성을 위해 자유게시판 데이터 요청과 공지사항 데이터 요청을 동시에(병렬로) 서버에 보냅니다. 하나 끝나고 다음 거 하는 게 아니라, 두 명의 배달부를 동시에 출발시키는 것과 같습니다.

// 데이터 정제 (Normalize):

// 서버에서 데이터가 도착하면 포장을 뜯어봅니다.

// 가끔 서버(DB) 설정에 따라 이름표가 대문자(TITLE)로 오기도 하고 소문자(title)로 오기도 합니다. 이걸 방지하기 위해 **안전장치(normalize)**를 거쳐서 통일시킵니다.

// 그리고 메인 화면엔 공간이 부족하니 딱 최신글 5개만 남기고 나머지는 잘라냅니다.

// 배달 완료 (State Update):

// 정리된 데이터를 각각의 바구니(freePosts, noticePosts)에 담습니다.

// "로딩 끝났어!"라고 깃발(loading: false)을 내립니다.

// 반환 (Return):

// 최종적으로 정리된 데이터와 로딩 상태를 컴포넌트에게 건네줍니다. 컴포넌트는 이걸 받아서 화면에 그리기만 하면 됩니다.
