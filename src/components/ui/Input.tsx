// 1. [Import] React 라이브러리를 불러옵니다.
// JSX 문법(HTML 태그 같은 것)을 사용하고 컴포넌트를 만들기 위해 필수적입니다.
import React from "react";

// 2. [Interface Definition] 이 컴포넌트가 받을 '데이터의 규칙(Type)'을 정의합니다.
// - extends ... : 기본 HTML input 태그가 가진 모든 속성(type, value, onChange 등)을 그대로 물려받습니다.
// - label: 입력창 위에 보여줄 제목 (필수 항목, 문자열)
// - icon: 입력창 안에 보여줄 아이콘 (선택 항목, 리액트 컴포넌트 형태)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

// 3. [Main Component] Input 컴포넌트를 정의합니다.
// - { label, icon, ...props }: 부모에게서 받은 데이터 중 label, icon은 따로 꺼내고,
//   나머지(placeholder, type 등)는 'props'라는 이름으로 몽땅 모아서 받습니다.
export const Input = ({ label, icon, ...props }: InputProps) => (
  // 4. [Wrapper] 전체를 감싸는 박스입니다.
  // - space-y-2.5: 라벨과 입력창 사이의 간격을 2.5단위(약 10px)만큼 띄웁니다.
  // - w-full: 부모 너비에 맞춰 꽉 채웁니다.
  <div className="space-y-2.5 w-full">
    {/* 5. [Label] 입력창의 제목(라벨) 부분입니다. */}
    {/* - text-[11px] font-black: 글씨를 아주 작고 두껍게 만듭니다. */}
    {/* - text-slate-400: 색상은 연한 회색으로 해서 너무 튀지 않게 합니다. */}
    {/* - uppercase tracking-[0.15em]: 영문일 경우 대문자로 바꾸고 자간을 넓혀 세련되게 보입니다. */}
    <label className="text-[11px] font-black text-slate-400 ml-4 uppercase tracking-[0.15em]">
      {label}
    </label>

    {/* 6. [Input Wrapper] 아이콘과 인풋창을 묶어주는 박스입니다. */}
    {/* - relative: 내부의 아이콘(absolute)이 이 박스를 기준으로 위치를 잡게 합니다. */}
    {/* - group: 아주 중요! 이 박스 내부에 포커스가 생기면 자식 요소들이 반응할 수 있게 그룹핑합니다. */}
    <div className="relative group">
      {/* 7. [Icon Render] 아이콘이 있을 때만(&&) 렌더링합니다. */}
      {icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors z-10">
          {/* - absolute ... : 왼쪽 5만큼, 위에서 50% 위치에 두고 y축 기준 중앙 정렬합니다. */}
          {/* - text-slate-300: 평소에는 연한 회색입니다. */}
          {/* - group-focus-within:text-green-500: [핵심] 사용자가 입력창을 클릭하면(그룹 내 포커스), 아이콘 색이 초록색으로 변합니다. */}
          {icon}
        </div>
      )}

      {/* 8. [Actual Input] 진짜 input 태그입니다. */}
      {/* - {...props}: 부모가 전달한 나머지 속성들(onChange, value 등)을 여기에 다 쏟아붓습니다. */}
      <input
        {...props}
        className={`w-full ${
          // 아이콘이 있으면 왼쪽 여백(pl)을 14만큼 줘서 글씨가 아이콘에 가리지 않게 하고,
          // 아이콘이 없으면 일반적인 여백(px-6)을 줍니다.
          icon ? "pl-14" : "px-6"
        } pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.8rem] outline-none transition-all font-black text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-green-400 focus:ring-[6px] focus:ring-green-50/50 disabled:opacity-50`}
        // [스타일 상세 설명]
        // - bg-slate-50/50: 배경은 반투명한 아주 연한 회색
        // - rounded-[1.8rem]: 모서리를 아주 둥글게 깎습니다.
        // - outline-none: 클릭했을 때 생기는 못생긴 기본 테두리를 없앱니다.
        // - focus:bg-white...: 클릭하면 배경이 하얘지고, 테두리가 초록색이 되며, 초록색 빛나는 링(ring)이 생깁니다.
        // - disabled:opacity-50: 비활성화되면 흐릿하게 만듭니다.
      />
    </div>
  </div>
);

// 개발자의 사용:

// 로그인 페이지를 만들면서 <input type="text" ... />를 직접 쓰지 않습니다.

// 대신 <Input label="아이디" icon={<UserIcon />} placeholder="입력하세요" /> 라고만 씁니다.

// 그러면 라벨, 아이콘, 예쁜 디자인이 모두 적용된 입력창이 뚝딱 만들어집니다.

// 사용자의 경험 (렌더링):

// 화면에는 "아이디"라는 작은 회색 글씨(라벨)가 보이고, 그 아래에 둥글둥글한 입력창이 있습니다.

// 입력창 왼쪽에는 회색 사람 아이콘이 들어있습니다.

// 상호작용 (Focus):

// 사용자가 입력창을 **클릭(Focus)**합니다.

// 변화: 입력창 배경이 하얗게 밝아지고, 테두리에 초록색 링이 생깁니다. 동시에 회색이었던 아이콘도 초록색으로 변합니다(group-focus-within 효과).

// 사용자는 "아, 지금 여기 입력 중이구나"라고 직관적으로 느낍니다.
