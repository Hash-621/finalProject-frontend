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
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setAnimate(false), 300);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !animate) return null;

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
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ease-out ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="text-center">
          {getIcon()}

          <h3 className="mb-2 text-xl font-bold leading-6 text-gray-900">
            {title ||
              (type === "error"
                ? "오류"
                : type === "success"
                ? "완료"
                : "알림")}
          </h3>

          <div className="mt-2">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-500">
              {content}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          {type === "confirm" ? (
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
