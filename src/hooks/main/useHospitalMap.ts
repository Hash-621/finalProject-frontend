// 1. [Imports] 리액트 훅과 API 서비스, 타입들을 가져옵니다.
import { useState, useEffect } from "react";
import { hospitalService } from "@/api/services"; // 병원 데이터 API 호출 함수
import { Hospital, HospitalResponse } from "@/types/hospital"; // 타입 정의 (데이터 모양)

// 2. [Custom Hook Definition] 훅 정의 시작
// 이 훅은 'isMapLoaded'(지도가 로딩됐는지 여부)를 인자로 받습니다. 중요합니다!
export const useHospitalMap = (isMapLoaded: boolean) => {
  // --- [State] 상태 관리 ---
  // 3. 전체 병원 리스트 (좌표 변환까지 완료된 원본 데이터)
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // 4. 화면에 보여줄 병원 리스트 (검색이나 필터링 된 결과)
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);

  // 5. 병원들의 진료과목 목록 (중복 제거됨, 예: ["내과", "치과"])
  const [categories, setCategories] = useState<string[]>([]);

  // 6. 현재 데이터를 불러오고 변환하는 중인지 (로딩 상태)
  const [isDataFetching, setIsDataFetching] = useState(true);

  // 7. 사용자가 입력한 검색어
  const [keyword, setKeyword] = useState("");

  // --- [Effect 1] 데이터 가져오기 및 좌표 변환 (핵심 로직!) ---
  useEffect(() => {
    // 8. [Guard Clause] 지도가 아직 로딩 안 됐거나, 카카오 서비스 객체가 없으면 아무것도 안 하고 멈춥니다.
    // Geocoder를 쓰려면 window.kakao가 필수이기 때문입니다.
    if (!isMapLoaded || !window.kakao?.maps?.services) return;

    // 9. [Async Function] 실제 작업을 수행할 함수 정의
    const fetchAndGeocode = async () => {
      try {
        setIsDataFetching(true); // 로딩 시작!

        // 10. [API Call] 서버에서 병원 목록(주소 포함)을 가져옵니다.
        const { data } = await hospitalService.getHospitals();

        // 11. [Geocoder Init] 카카오의 주소-좌표 변환 도구를 생성합니다.
        const geocoder = new window.kakao.maps.services.Geocoder();

        // 12. [Set] 카테고리 중복을 없애기 위해 Set 자료구조를 만듭니다.
        const categorySet = new Set<string>();

        // 13. [Mapping & Promise] 각 병원 데이터마다 좌표 변환 요청을 보냅니다.
        // map을 써서 병원 개수만큼 Promise 배열을 만듭니다. (병렬 처리를 위해)
        const promises = data.map((item: HospitalResponse) => {
          // 각 변환 작업은 비동기이므로 Promise로 감싸줍니다.
          return new Promise<Hospital | null>((resolve) => {
            // 14. [Address Search] 카카오에게 주소를 줍니다. "이 주소 좌표 좀 찾아줘!"
            geocoder.addressSearch(item.address, (result, status) => {
              // 15. [Success] 변환 성공 시 (Status.OK)
              if (status === window.kakao.maps.services.Status.OK) {
                // 카테고리 목록에 이 병원의 진료과목 추가 (Set이라 중복은 알아서 걸러짐)
                categorySet.add(item.treatCategory);

                // 성공적으로 변환된 병원 객체를 만듭니다. (위도, 경도 추가!)
                resolve({
                  id: item.id,
                  name: item.name,
                  category: item.treatCategory,
                  address: item.address,
                  lat: Number(result[0].y), // y가 위도(Latitude)
                  lng: Number(result[0].x), // x가 경도(Longitude)
                });
              } else {
                // 16. [Fail] 주소가 잘못되었거나 해서 변환 실패하면 null을 반환
                resolve(null);
              }
            });
          });
        });

        // 17. [Await All] 모든 병원의 좌표 변환이 끝날 때까지 기다립니다.
        // 병원이 100개면 100개의 변환이 다 끝나야 다음으로 넘어갑니다.
        const results = await Promise.all(promises);

        // 18. [Filtering] 변환에 실패해서 null이 된 데이터들은 걸러냅니다. (유효한 데이터만 남김)
        const validData = results.filter((h): h is Hospital => h !== null);

        // 19. [State Update] 최종 데이터를 상태에 저장합니다.
        setHospitals(validData); // 원본 저장
        setFilteredHospitals(validData); // 초기엔 필터링 없이 다 보여줌
        setCategories(Array.from(categorySet)); // Set을 배열로 변환해서 저장
      } catch (err) {
        // 20. [Error Handling] 에러 발생 시 콘솔에 찍습니다.
        console.error(err);
      } finally {
        // 21. [Finish] 성공하든 실패하든 로딩 상태를 해제합니다.
        setIsDataFetching(false);
      }
    };

    // 22. [Execute] 위에서 만든 함수 실행
    fetchAndGeocode();
  }, [isMapLoaded]); // 의존성 배열: 지도가 로딩되면 실행됨

  // --- [Effect 2] 검색어 필터링 로직 ---
  useEffect(() => {
    // 23. [Filter Logic] 검색어(keyword)나 원본 데이터(hospitals)가 바뀔 때마다 실행됩니다.
    const filtered = hospitals.filter(
      (h) =>
        // 이름에 검색어가 포함되어 있거나 OR
        h.name.toLowerCase().includes(keyword.toLowerCase()) ||
        // 카테고리(진료과목)에 검색어가 포함되어 있으면 통과
        h.category.toLowerCase().includes(keyword.toLowerCase())
    );
    // 24. [Update View] 필터링된 결과만 화면에 보여줍니다.
    setFilteredHospitals(filtered);
  }, [keyword, hospitals]);

  // 25. [Return] 컴포넌트에서 필요한 데이터와 함수들을 반환합니다.
  return {
    hospitals, // 전체 데이터
    filteredHospitals, // 검색 결과 데이터
    setFilteredHospitals, // 직접 필터링 결과를 수정할 수 있는 함수
    categories, // 진료과목 목록
    isDataFetching, // 로딩 중 여부
    keyword, // 현재 검색어
    setKeyword, // 검색어 변경 함수
  };
};
