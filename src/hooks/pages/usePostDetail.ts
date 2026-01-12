// 1. [Imports] React의 상태 관리(useState)와 생명주기(useEffect) 훅을 가져옵니다.
import { useState, useEffect } from "react";

// 2. [Imports] 서버와 통신할 '게시판 서비스' API 함수들을 가져옵니다. (글 조회, 댓글 조회, 삭제 기능 등)
import { boardService } from "@/api/services";

// 3. [Imports] 페이지 이동을 위한 Next.js의 라우터 훅을 가져옵니다. (삭제 후 목록으로 보내기 위해 필요)
import { useRouter } from "next/navigation";

// 4. [Custom Hook Definition] 'usePostDetail'이라는 이름의 훅을 정의합니다.
// 이 훅은 '카테고리(예: free)'와 '글 번호(id)'를 인자로 받아서 작동합니다.
export const usePostDetail = (category: string, id: string) => {
  // 5. [State] 게시글 본문 내용을 저장할 공간입니다. 아직 안 불러왔으니 초기값은 null입니다.
  const [post, setPost] = useState<any>(null);

  // 6. [State] 댓글 목록을 저장할 공간입니다. 댓글은 여러 개니까 빈 배열([])로 시작합니다.
  const [comments, setComments] = useState([]);

  // 7. [State] 현재 데이터를 불러오는 중인지 표시하는 변수입니다. 페이지 들어오자마자 로딩해야 하니 true로 시작합니다.
  const [loading, setLoading] = useState(true);

  // 8. [Router] 페이지 이동을 담당하는 라우터 객체를 생성합니다.
  const router = useRouter();

  // 9. [Function] 실제 서버에서 상세 정보를 가져오는 핵심 함수입니다.
  const fetchDetail = async () => {
    try {
      // 10. [Loading Start] "데이터 가져오기 시작!" 하고 로딩 상태를 켭니다. (재조회 시에도 스피너를 보여주기 위함)
      setLoading(true);

      // 11. [API Call 1] 서버에 "이 카테고리의 이 ID를 가진 글 내용을 줘"라고 요청하고 기다립니다(await).
      const response = await boardService.getPostDetail(category, id);

      // 12. [State Update] 받아온 글 내용(response.data)을 post 상태에 저장합니다.
      setPost(response.data);

      // 13. [API Call 2] 이번엔 "이 글(id)에 달린 댓글들을 줘"라고 요청하고 기다립니다.
      const commentRes = await boardService.getComments(id);

      // 14. [State Update] 받아온 댓글 목록(commentRes.data)을 comments 상태에 저장합니다.
      setComments(commentRes.data);
    } catch (error) {
      // 15. [Error Handling] 통신 중 에러(인터넷 끊김, 없는 글 등)가 나면 콘솔에 빨간 글씨로 출력합니다.
      console.error("데이터 로드 실패", error);
    } finally {
      // 16. [Loading End] 성공하든 실패하든 작업이 끝났으니 로딩 상태를 끕니다(false). 화면에 내용이 보이기 시작합니다.
      setLoading(false);
    }
  };

  // 17. [Function] 게시글 삭제 버튼을 눌렀을 때 실행될 함수입니다.
  const handleDelete = async () => {
    // 18. [Confirm] 브라우저 기본 알림창으로 "정말 삭제할거니?" 물어봅니다.
    // 사용자가 '취소'를 누르면 (!confirm -> true) 함수를 여기서 즉시 종료합니다(return).
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      // 19. [API Call] 사용자가 '확인'을 누르면 서버에 "이 글 삭제해줘"라고 요청을 보냅니다.
      await boardService.deletePost(category, id);

      // 20. [Alert] 삭제가 성공적으로 끝났으면 "삭제되었습니다"라고 알림을 띄웁니다.
      alert("삭제되었습니다.");

      // 21. [Redirect] 글이 지워졌으니 보고 있던 상세 페이지에 있을 수 없죠? 해당 게시판 목록 페이지로 이동시킵니다.
      router.push(`/community/${category}`);
    } catch (error) {
      // 22. [Error Handling] 삭제 중 문제가 생기면(권한 없음 등) 에러를 출력하고 사용자에게 알려줍니다.
      console.error("삭제 에러:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 23. [Effect] 컴포넌트가 처음 켜지거나, 'id'가 바뀔 때마다 실행되는 로직입니다.
  useEffect(() => {
    // 24. [Execute] 위에서 만든 데이터 가져오기 함수(fetchDetail)를 실행합니다.
    // 즉, 페이지에 들어오자마자 데이터를 서버에서 긁어옵니다.
    fetchDetail();
  }, [id]); // 의존성 배열에 [id]가 있으므로, 다른 글(ID)로 넘어가면 자동으로 새 글 내용을 불러옵니다.

  // 25. [Return] 컴포넌트가 이 훅을 통해 사용할 수 있도록 데이터와 함수들을 포장해서 내보냅니다.
  // post(본문), comments(댓글), loading(로딩여부), handleDelete(삭제함수), refresh(새로고침함수)
  return { post, comments, loading, handleDelete, refresh: fetchDetail };
};

// 입장 (Mount):

// 상세 페이지로 이동하면서 이 훅이 실행됩니다.

// "일단 로딩 중!"(loading: true) 깃발을 들고 화면을 하얗게 비우거나 스피너를 돌립니다.

// 데이터 요청 (Fetching):

// useEffect가 "어? 글 ID가 100번이네?" 하고 감지하고 fetchDetail 함수를 실행합니다.

// 서버에게 "100번 글 내용 줘!" 하고 기다리고, 받자마자 "100번 글 댓글도 줘!" 하고 기다립니다.

// 화면 표시 (Render):

// 글 내용과 댓글을 다 받으면 상태(post, comments)에 저장합니다.

// "로딩 끝!"(loading: false) 깃발을 내리면, 화면에 글 제목, 내용, 댓글들이 짠! 하고 나타납니다.

// 삭제 시도 (Delete):

// 사용자가 "삭제" 버튼을 누르면 handleDelete가 실행됩니다.

// 브라우저가 "정말 삭제하시겠습니까?" 하고 물어봅니다. (확인/취소)

// 완료 및 이동 (Redirect):

// 확인을 누르면 서버에 삭제 요청을 보냅니다.

// 삭제가 완료되면 "삭제되었습니다" 알림을 띄우고, 해당 카테고리 목록 페이지(예: 자유게시판 목록)로 강제 이동시킵니다.
