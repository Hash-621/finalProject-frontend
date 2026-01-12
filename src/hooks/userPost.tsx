// hooks/usePosts.ts

// 1. [Imports] React의 핵심 훅들을 가져옵니다.
// useState: 데이터를 저장하는 변수 만들기, useCallback: 함수를 기억해서 성능 최적화하기
import { useState, useCallback } from "react";

// 2. [API Import] 미리 만들어둔 axios 인스턴스(api)를 가져옵니다. 이걸로 서버와 통신합니다.
import api from "@/api/axios";

// 3. [Type Import] 게시글 데이터가 어떻게 생겼는지(id, title 등) 정의해둔 타입 설명서를 가져옵니다.
import { PostItem } from "@/types/board";

// 4. [Custom Hook Definition] 'usePosts'라는 이름의 커스텀 훅을 정의합니다.
// 이 훅을 호출하면 게시글 관리 기능세트(목록, 수정, 삭제)를 통째로 빌려 쓸 수 있습니다.
export const usePosts = () => {
  // --- [State] 상태 관리 변수들 (데이터 저장소) ---

  // 5. 서버에서 받아온 게시글(또는 댓글) 목록을 저장하는 배열입니다. 초기값은 빈 배열([])입니다.
  const [listData, setListData] = useState<PostItem[]>([]);

  // 6. 현재 데이터를 불러오는 중인지 표시하는 깃발입니다. (true면 로딩 스피너 표시)
  const [isLoading, setIsLoading] = useState(false);

  // 7. 현재 보고 있는 페이지 번호입니다. 1페이지부터 시작합니다.
  const [currentPage, setCurrentPage] = useState(1);

  // 8. 더 불러올 데이터가 없는지(마지막 페이지인지) 확인하는 변수입니다.
  const [isLastPage, setIsLastPage] = useState(false);

  // --- [Edit State] 수정 기능 관련 상태 ---

  // 9. 현재 '어떤 글'을 수정 중인지 ID를 저장합니다. (null이면 아무것도 수정 안 하는 중)
  const [editingId, setEditingId] = useState<number | null>(null);

  // 10. 수정할 때 입력하는 제목과 내용을 임시로 저장하는 폼(Form) 상태입니다.
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  // --- [Function 1] 데이터 가져오기 (Read) ---
  // useCallback을 써서, 컴포넌트가 다시 그려져도 이 함수가 불필요하게 재생성되지 않게 합니다.
  const fetchPosts = useCallback(async (tab: string, page: number) => {
    try {
      // 11. 로딩 시작! "데이터 가져오는 중이니까 기다려주세요" (UI 잠금/스피너)
      setIsLoading(true);

      // 12. [API Call] 서버에 GET 요청을 보냅니다.
      // tab: "posts"(내 글) 인지 "comments"(내 댓글) 인지 구분
      // page: 몇 번째 페이지를 달라고 할지 지정
      const res = await api.get(`/mypage/${tab}?page=${page}`);

      // 13. 받아온 데이터를 listData 상태에 저장해서 화면에 뿌려줍니다.
      setListData(res.data);

      // 14. [Pagination Logic] 만약 받아온 데이터가 10개 미만이면 "다음 페이지는 없겠구나"라고 판단합니다.
      // (보통 한 페이지에 10개씩 주니까요)
      setIsLastPage(res.data.length < 10);

      // 15. 현재 페이지 번호를 상태에 업데이트합니다.
      setCurrentPage(page);
    } catch (err) {
      // 16. 통신 실패 시 에러를 콘솔에 찍습니다.
      console.error("데이터 로드 실패:", err);
    } finally {
      // 17. 성공하든 실패하든 로딩 끝! 상태를 false로 바꿉니다.
      setIsLoading(false);
    }
  }, []);

  // --- [Function 2] 수정 모드 시작하기 ---
  // 사용자가 [수정] 버튼을 눌렀을 때 실행됩니다.
  const startEdit = (item: PostItem) => {
    // 18. "지금 이 ID(item.id)를 가진 글을 수정할 거야"라고 표시합니다.
    setEditingId(item.id);

    // 19. 기존에 있던 제목과 내용을 입력창에 미리 채워 넣습니다.
    setEditForm({ title: item.title, content: item.content });
  };

  // --- [Function 3] 수정 내용 저장하기 (Update) ---
  // 사용자가 내용을 고치고 [저장] 버튼을 눌렀을 때 실행됩니다.
  const saveEdit = async (tab: string) => {
    // 20. 수정 중인 ID가 없으면 함수를 멈춥니다. (안전장치)
    if (!editingId) return;

    try {
      // 21. https://ko.dict.naver.com/ko/entry/koko/0d5221fc8a524bcfbc8fb93bb0158ca9 탭이 'posts'면 글 수정 API, 아니면 댓글 수정 API 주소를 선택합니다.
      const url =
        tab === "posts"
          ? `/mypage/post/${editingId}` // 글 수정 주소
          : `/mypage/comment/${editingId}`; // 댓글 수정 주소

      // 22. [Payload 분기] 보낼 데이터를 준비합니다.
      // 글이면 제목+내용을 다 보내고, 댓글이면 내용만 보냅니다. (댓글엔 제목이 없으니까요)
      const payload =
        tab === "posts" ? editForm : { content: editForm.content };

      // 23. [API Call] 서버에 PUT 요청(수정)을 보냅니다.
      await api.put(url, payload);

      // 24. 성공하면 수정 모드를 끕니다. (editingId를 null로 초기화)
      setEditingId(null);

      // 25. 목록을 새로고침해서 수정된 내용이 반영되게 합니다.
      await fetchPosts(tab, currentPage);

      // 26. 사용자에게 성공 알림을 띄웁니다.
      alert("수정되었습니다.");
    } catch (err) {
      // 27. 실패하면 에러 알림을 띄웁니다.
      alert("수정에 실패했습니다.");
    }
  };

  // --- [Function 4] 삭제하기 (Delete) ---
  const deletePost = async (tab: string, id: number) => {
    // 28. [Confirm] 진짜 지울 건지 한 번 물어봅니다. 취소하면 바로 종료.
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      // 29. https://en.wikipedia.org/wiki/Construction 삭제할 주소를 만듭니다.
      // tab이 "posts"면 -> /mypage/post/번호
      // tab이 "comments"면 -> slice(0, -1)로 's'를 떼서 "comment"로 만듦 -> /mypage/comment/번호
      let endpoint =
        tab === "posts"
          ? `/mypage/post/${id}`
          : `/mypage/${tab.slice(0, -1)}/${id}`;

      // 30. [API Call] 서버에 DELETE 요청을 보냅니다.
      await api.delete(endpoint);

      // 31. 삭제된 게 안 보이도록 목록을 새로고침합니다.
      await fetchPosts(tab, currentPage);

      // 32. 성공 알림을 띄웁니다.
      alert("삭제되었습니다.");
    } catch (err) {
      // 33. 실패 알림을 띄웁니다.
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 34. [Return] 컴포넌트가 이 훅을 통해 사용할 수 있도록,
  // 변수(State)와 함수(Function)들을 객체에 담아 반환합니다.
  return {
    listData, // 글 목록 데이터
    isLoading, // 로딩 상태
    currentPage, // 현재 페이지 번호
    isLastPage, // 마지막 페이지 여부
    editingId, // 현재 수정 중인 ID
    editForm, // 수정 입력 폼 데이터
    setEditForm, // 입력 폼 변경 함수 (input onChange 연결용)
    fetchPosts, // 목록 가져오기 함수
    startEdit, // 수정 모드 켜기 함수
    saveEdit, // 수정 저장 함수
    deletePost, // 삭제 함수
    setEditingId, // 수정 취소할 때 쓸 ID 변경 함수
  };
};

// 목록 로딩 (fetchPosts):

// 탭을 누르면 "데이터 가져와!"라고 이 훅에게 시킵니다.

// "잠시만요(로딩 중...)" 깃발을 들고 서버에 가서 1페이지 글 목록을 받아옵니다.

// 받아온 글은 listData라는 바구니에 담아서 화면에 보여줍니다.

// 수정 모드 진입 (startEdit):

// 사용자가 글 옆에 있는 [수정] 버튼을 누릅니다.

// 훅은 "지금 3번 글 수정 중이야"(editingId: 3)라고 기록하고, 기존 제목과 내용을 입력창(editForm)에 미리 채워 넣습니다. 화면이 읽기 모드에서 입력 모드로 바뀝니다.

// 수정 저장 (saveEdit):

// 내용을 고치고 [저장]을 누릅니다.

// 훅은 이게 "게시글"인지 "댓글"인지 확인해서(tab 체크), 알맞은 주소로 수정 요청을 보냅니다.

// 성공하면 "수정되었습니다" 알림을 띄우고 목록을 새로고침합니다.

// 삭제 (deletePost):

// [삭제] 버튼을 누르면 "진짜 지울까요?" 물어봅니다.

// 확인하면 서버에 삭제 요청을 보내고, 목록을 다시 불러와서 지워진 걸 확인시켜 줍니다.
