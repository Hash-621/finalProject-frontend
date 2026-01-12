// 1. [Imports] React의 상태 관리(useState), 성능 최적화(useCallback), 생명주기(useEffect) 훅을 가져옵니다.
import { useState, useCallback, useEffect } from "react";

// 2. [Service Import] 서버에서 채용 공고를 가져오는 API 함수(getCrawledJobs)가 들어있는 객체를 가져옵니다.
import { jobService } from "@/api/services";

// 3. [Type Import] 채용 공고 데이터가 어떻게 생겼는지(제목, 회사명, URL 등) 정의해둔 타입을 가져옵니다.
import { JobData } from "@/types/job";

// 4. [Custom Hook] 'useJobs'라는 이름의 커스텀 훅을 정의합니다.
// 이 훅을 사용하는 컴포넌트는 내부 로직을 몰라도 "jobs 데이터"와 "loading 상태"만 받아서 쓰면 됩니다.
export const useJobs = () => {
  // 5. [State] 채용 공고 목록을 저장할 상태입니다. 초기값은 빈 배열([])입니다.
  // <JobData[]>는 이 배열에 JobData 형태의 데이터만 들어갈 수 있다는 뜻입니다.
  const [jobs, setJobs] = useState<JobData[]>([]);

  // 6. [State] 데이터를 불러오는 중인지 나타내는 상태입니다. (true면 로딩 중, false면 완료)
  const [loading, setLoading] = useState(false);

  // 7. [Function] 실제 데이터를 가져오는 핵심 함수입니다.
  // useCallback으로 감싸는 이유: 이 함수가 불필요하게 재생성되는 것을 막아, useEffect가 무한루프에 빠지는 것을 방지합니다.
  const fetchJobs = useCallback(async () => {
    // 8. [Loading Start] 데이터 요청 시작 전, 로딩 상태를 true로 켭니다. (UI에 스피너 표시용)
    setLoading(true);

    try {
      // 9. [Config] 총 몇 페이지까지 긁어올지 설정합니다. 여기선 4페이지까지 가져오네요.
      const TOTAL_PAGES = 4;

      // 10. [Parallel Setup] 1부터 4까지 반복하면서 API 요청 '약속(Promise)'들을 만듭니다.
      // 아직 요청이 완료된 건 아니고, "요청을 보냈다"는 상태들의 배열입니다.
      // Array.from({ length: 4 }) -> [undefined, undefined, undefined, undefined] 생성
      // map((_, i) => ...) -> 각 자리에 API 요청 함수를 채워 넣습니다. page는 "1", "2", "3", "4"가 됩니다.
      const requests = Array.from({ length: TOTAL_PAGES }, (_, i) =>
        jobService.getCrawledJobs({ page: (i + 1).toString() })
      );

      // 11. [Await All] 위에서 만든 4개의 요청이 '모두' 끝날 때까지 기다립니다.
      // 하나씩 기다리는 것보다 훨씬 빠릅니다. (병렬 처리)
      // responses에는 [1페이지결과, 2페이지결과, 3페이지결과, 4페이지결과]가 담깁니다.
      const responses = await Promise.all(requests);

      // 12. [Flatten] 4개의 배열로 나뉘어 있는 데이터를 하나의 큰 배열로 합칩니다.
      // flatMap: 각 응답(res)에서 data 배열을 꺼내고, 그걸 쫙 펼쳐서 1차원 배열로 만듭니다.
      // Array.isArray(res.data) ? : 데이터가 배열인지 확인하고, 아니면 빈 배열을 반환해 에러를 방지합니다.
      const combined = responses.flatMap((res) =>
        Array.isArray(res.data) ? res.data : []
      );

      // 13. [Filter & Slice] 중복을 제거하고 개수를 제한합니다.
      const uniqueJobs = combined
        .filter(
          // 중복 제거 로직:
          // 현재 아이템(item)의 URL과 똑같은 URL을 가진 첫 번째 요소의 인덱스(findIndex)를 찾습니다.
          // 그 인덱스가 현재 나의 인덱스(index)와 같다면? -> "내가 최초다" -> 유지(true)
          // 다르다면? -> "아까 이미 나온 애네" -> 제거(false)
          (item, index, self) =>
            index === self.findIndex((t) => t.url === item.url)
        )
        // 14. 상위 20개만 자릅니다. (너무 많으면 화면 그리기가 힘드니까요)
        .slice(0, 20);

      // 15. [State Update] 최종적으로 정리된 데이터를 jobs 상태에 저장합니다.
      setJobs(uniqueJobs);
    } catch (e) {
      // 16. [Error Handling] 통신 중 에러가 나면 콘솔에 빨간 글씨로 출력합니다.
      console.error("데이터 로드 실패:", e);
    } finally {
      // 17. [Loading End] 성공하든 실패하든 작업이 끝났으니 로딩 깃발을 내립니다.
      setLoading(false);
    }
  }, []); // 의존성 배열이 비어있음 -> 이 함수는 컴포넌트 생성 시 딱 한 번만 만들어집니다.

  // 18. [Effect] 컴포넌트가 마운트될 때(처음 켜질 때) fetchJobs를 실행합니다.
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]); // fetchJobs 함수가 바뀔 때만 재실행되는데, useCallback 덕분에 안 바뀜 -> 1번만 실행됨.

  // 19. [Return] 컴포넌트가 사용할 데이터와 함수들을 반환합니다.
  // jobs: 공고 목록, loading: 로딩 여부, refetch: 새로고침하고 싶을 때 쓸 함수
  return { jobs, loading, refetch: fetchJobs };
};

// 작업 개시 (Mount):

// 페이지가 열리자마자 useEffect가 fetchJobs 함수를 호출합니다.

// "로딩 시작!" 깃발(loading: true)을 듭니다. 화면에는 스피너가 돌기 시작합니다.

// 동시 출동 (Parallel Requests):

// 1페이지 갔다 오고, 2페이지 갔다 오는 식은 너무 느립니다.

// 배달부 4명을 고용해서 **"1, 2, 3, 4페이지 동시에 가서 데이터 가져와!"**라고 시킵니다 (Promise.all).

// 데이터 취합 (Merge):

// 배달부들이 각자 가져온 데이터 꾸러미 4개를 하나의 큰 자루(combined)에 쏟아 붓습니다.

// 검수 및 선별 (Filter & Slice):

// 자루 안을 뒤져서 **똑같은 공고(URL이 같은 것)**가 있으면 하나만 남기고 버립니다.

// 정리된 것 중에서 상위 20개만 딱 골라냅니다.

// 진열 (State Update):

// 골라낸 20개를 jobs 상태에 저장합니다.

// "로딩 끝!" 깃발(loading: false)을 내립니다. 화면에 공고 목록이 짠 하고 나타납니다.
