import React from "react";
import { ApplyFormData } from "@/types/job";

interface ApplyFormProps {
  applyForm: ApplyFormData;
  setApplyForm: React.Dispatch<React.SetStateAction<ApplyFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ApplyForm({
  applyForm,
  setApplyForm,
  onSubmit,
  onCancel,
}: ApplyFormProps) {
  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col p-6 animate-in fade-in">
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-lg my-auto">
        <h4 className="text-xl font-bold text-gray-900 text-center mb-6">
          간편 지원하기
        </h4>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-all"
            placeholder="이름"
            value={applyForm.name}
            onChange={(e) =>
              setApplyForm({ ...applyForm, name: e.target.value })
            }
          />
          <input
            type="tel"
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-all"
            placeholder="연락처 (010-0000-0000)"
            value={applyForm.phone}
            onChange={(e) =>
              setApplyForm({ ...applyForm, phone: e.target.value })
            }
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
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
