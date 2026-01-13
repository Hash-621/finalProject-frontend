import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string;
  type?: "success" | "error" | "warning" | "confirm";
  onConfirm?: () => void;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  content,
  type = "success",
  onConfirm,
}: ModalProps) {
  // 모달의 등장/퇴장 애니메이션을 제어하기 위한 상태
  const [animate, setAnimate] = useState(false);

  // 모달이 열리고 닫힐 때의 효과 처리
  useEffect(() => {
    if (isOpen) {
      // 열릴 때: 애니메이션 시작, 배경 스크롤 잠금
      setAnimate(true);
      document.body.style.overflow = "hidden";
    } else {
      // 닫힐 때: 0.3초(애니메이션 시간) 뒤에 사라짐, 스크롤 잠금 해제
      setTimeout(() => setAnimate(false), 300);
      document.body.style.overflow = "unset";
    }
    // 컴포넌트가 사라질 때 안전하게 스크롤 잠금 해제
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 닫혀있고 애니메이션도 끝났으면 화면에서 제거 (렌더링 안 함)
  if (!isOpen && !animate) return null;

  // 타입에 따라 알맞은 아이콘(SVG)을 반환하는 함수
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      case "warning":
      case "confirm":
        return (
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100" // 열릴 때: 클릭 가능, 불투명
          : "pointer-events-none opacity-0" // 닫힐 때: 클릭 불가, 투명
      }`}
    >
      {/* 어두운 배경 (Backdrop) - 클릭 시 닫힘 */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      {/* 모달 창 본체 */}
      <div
        className={`relative z-10 w-11/12 max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ease-out ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="text-center">
          {/* 아이콘 표시 */}
          {getIcon()}

          {/* 제목 표시 (없으면 타입에 따라 자동 설정) */}
          <h3 className="mb-2 text-xl font-bold leading-6 text-gray-900">
            {title ||
              (type === "error"
                ? "오류"
                : type === "success"
                ? "완료"
                : "알림")}
          </h3>

          {/* 내용 텍스트 표시 */}
          <div className="mt-2">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-500">
              {content}
            </p>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-8 flex gap-3">
          {type === "confirm" ? (
            // Confirm 타입일 경우: 취소 / 확인 버튼 2개
            <>
              <button
                type="button"
                className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none"
                onClick={onClose}
              >
                취소
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
              >
                확인
              </button>
            </>
          ) : (
            // 그 외 타입일 경우: 확인 버튼 1개
            <button
              type="button"
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === "error"
                  ? "bg-red-600 hover:bg-red-500 focus:ring-red-500"
                  : "bg-blue-600 hover:bg-blue-500 focus:ring-blue-500"
              }`}
              onClick={() => {
                // [핵심] 알림창(warning, error 등)에서도 확인 누르면 이동 로직 실행
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 등장 신호: 부모 컴포넌트가 isOpen={true}라고 신호를 보냅니다.

// 무대 준비 (useEffect):

// 모달은 "나 이제 등장해!"라며 내부 상태(animate)를 켭니다.

// 동시에 브라우저의 스크롤을 막아버립니다(overflow: hidden). 팝업이 떴는데 뒤에 있는 내용이 스크롤 되면 어색하니까요.

// 애니메이션 시작:

// 검은색 반투명 배경이 서서히 진해집니다(opacity 0 -> 100).

// 하얀색 알림창이 살짝 아래에서 위로, 작았다가 원래 크기로 뿅 하고 나타납니다(scale 95 -> 100).

// 내용 표시: 개발자가 지정한 타입(success, error 등)에 맞춰서 초록색 체크 아이콘이나 빨간색 X 아이콘을 보여주고 메시지를 띄웁니다.

// 사용자 선택:

// 취소 클릭: onClose 함수가 실행되어 모달을 닫으라는 신호를 보냅니다.

// 확인 클릭: onConfirm 함수(예: 삭제 로직, 페이지 이동)를 먼저 실행하고, 그 뒤에 닫습니다.

// 퇴장 (중요 디테일):

// isOpen이 false가 되어도 모달은 즉시 사라지지 않습니다.

// 약 0.3초 동안 서서히 투명해지는 애니메이션을 보여줍니다.

// 0.3초가 지나면 그제야 화면에서 완전히 삭제(return null)되고, 막아뒀던 브라우저 스크롤을 다시 풉니다.

// 2. 한 줄 한 줄 완벽 분석 (Line-by-Line Analysis)

// 이제 코드를 위에서부터 아래로 꼼꼼하게 해석해 드리겠습니다.
