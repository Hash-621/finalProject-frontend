// --- [라이브러리 및 타입 임포트] ---
import React from "react"; // 리액트 기본 모듈
// 지원 양식 데이터의 타입(모양)을 정의해둔 곳에서 가져옵니다. (name: string, phone: string 등)
import { ApplyFormData } from "@/types/job";

// --- [Props 타입 정의] ---
// 부모 컴포넌트(JobDetailModal)로부터 받아야 할 데이터와 함수들의 규칙입니다.
interface ApplyFormProps {
  applyForm: ApplyFormData; // 현재 입력된 폼 데이터 (이름, 전화번호 값)
  setApplyForm: React.Dispatch<React.SetStateAction<ApplyFormData>>; // 폼 데이터를 변경하는 함수
  onSubmit: (e: React.FormEvent) => void; // '지원완료' 버튼 클릭 시 실행할 함수
  onCancel: () => void; // '취소' 버튼 클릭 시 실행할 함수
}

// --- [메인 컴포넌트 정의] ---
export default function ApplyForm({
  applyForm,
  setApplyForm,
  onSubmit,
  onCancel,
}: ApplyFormProps) {
  // --- [화면 렌더링 (JSX)] ---
  return (
    // 1. 전체 컨테이너: 모달 내부를 꽉 채우는 흰색 배경 (absolute inset-0)
    // z-20으로 설정해 다른 내용보다 위에 뜨도록 함. 페이드인 애니메이션 적용.
    <div className="absolute inset-0 bg-white z-20 flex flex-col p-6 animate-in fade-in">
      {/* 2. 폼 박스: 화면 중앙에 위치하며, 그림자와 테두리로 구분감을 줌 */}
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-lg my-auto">
        {/* 제목 */}
        <h4 className="text-xl font-bold text-gray-900 text-center mb-6">
          간편 지원하기
        </h4>

        {/* 입력 폼 태그 */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* (1) 이름 입력 필드 */}
          <input
            type="text"
            required // 필수 입력 항목
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-all"
            placeholder="이름"
            value={applyForm.name} // 상태값 바인딩
            // 값이 바뀔 때마다 부모 상태 업데이트 (기존 값 유지하면서 name만 변경)
            onChange={(e) =>
              setApplyForm({ ...applyForm, name: e.target.value })
            }
          />

          {/* (2) 연락처 입력 필드 */}
          <input
            type="tel"
            required // 필수 입력 항목
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-all"
            placeholder="연락처 (010-0000-0000)"
            value={applyForm.phone} // 상태값 바인딩
            // 값이 바뀔 때마다 부모 상태 업데이트 (기존 값 유지하면서 phone만 변경)
            onChange={(e) =>
              setApplyForm({ ...applyForm, phone: e.target.value })
            }
          />

          {/* (3) 버튼 영역 (취소 / 지원완료) */}
          <div className="flex gap-2 pt-2">
            {/* 취소 버튼 */}
            <button
              type="button" // type="button"을 안 쓰면 폼이 제출되어 버림
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200"
            >
              취소
            </button>

            {/* 지원완료 버튼 */}
            <button
              type="submit" // 폼 제출 트리거
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700"
            >
              지원완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 1. 컴포넌트 마운트 (Mount & Appear)

// 부모 컴포넌트(JobDetailModal)에서 applyStep이 "FORM"으로 바뀌면서 이 ApplyForm 컴포넌트가 렌더링 됩니다.

// absolute inset-0 bg-white 스타일 때문에, 기존의 상세 공고 내용 위에 하얀색 레이어가 덮어씌워지며 등장합니다. (마치 새 페이지로 넘어간 듯한 효과)

// 2. 사용자 입력 (User Input)

// 사용자가 이름 칸에 "홍길동"을 입력합니다.

// 키보드를 칠 때마다 onChange 이벤트가 발생하고, setApplyForm 함수가 호출되어 부모 컴포넌트가 가진 applyForm 상태 변수를 실시간으로 업데이트합니다.

// 연락처 칸도 마찬가지로 동작합니다.

// 3. 제출 또는 취소 (Action)

// 취소 클릭 시: onCancel 함수가 실행됩니다. 부모는 applyStep을 다시 "NONE"으로 돌려서, 이 폼을 화면에서 지우고 원래의 상세 공고 화면을 보여줍니다.

// 지원완료 클릭 시: onSubmit 함수가 실행됩니다. 브라우저의 기본 새로고침 동작은 e.preventDefault()에 의해 막히고(부모 쪽 로직), 입력된 데이터를 서버로 전송하는 API 호출이 시작됩니다.
