// 1. [Component Definition] 'Container'라는 이름의 컴포넌트(함수)를 정의하고 내보냅니다.
// 'export default'는 다른 파일에서 "import Container from ..."로 바로 가져다 쓸 수 있게 한다는 뜻입니다.
export default function Container({
  // 2. [Props Destructuring] 부모가 전달해준 데이터 꾸러미(Props)를 풉니다.
  // 여기서 'children'은 <Container>태그 사이에 넣은 모든 내용물(HTML, 다른 컴포넌트 등)을 말합니다.
  children,
}: Readonly<{
  // 3. [TypeScript Type Definition] 여기서부터는 타입스크립트 문법입니다.
  // "이 컴포넌트가 받는 데이터가 어떤 모양인지" 설명서를 적는 곳입니다.

  // Readonly: "이 데이터는 읽기 전용이야. 절대 수정하지 마!"라고 안전장치를 겁니다.
  // children: React.ReactNode; -> "children은 리액트가 화면에 그릴 수 있는 모든 것(태그, 글씨, null 등)이 될 수 있어"라는 뜻입니다.
  children: React.ReactNode;
}>) {
  // 4. [Return] 함수가 끝나고 최종적으로 화면에 그려질 HTML을 반환합니다.
  return (
    // 5. [Wrapper Div] 실제 내용을 감싸는 '진짜 상자(div)'를 만듭니다.
    // className="..." : Tailwind CSS를 사용해 상자의 스타일을 지정합니다.
    // - relative: 이 상자를 기준으로 자식 요소들이 위치를 잡을 수 있게 '기준점'을 만듭니다.
    // - overflow-hidden: 내용물이 이 상자 크기보다 커지면, 삐져나온 부분은 안 보이게(잘라내기) 처리합니다.
    // - lg:min-w-7xl: "화면이 클 때(lg), 최소 너비(min-w)를 아주 넓게(7xl) 잡아라"는 뜻입니다. (내용이 너무 쪼그라들지 않게 방어)
    <div className="relative overflow-hidden lg:min-w-7xl">
      {/* 6. [Children Injection] 여기가 핵심입니다! */}
      {/* 부모가 전달해준 'children'(내용물)을 바로 이 자리에 쏙 집어넣습니다. */}
      {/* 즉, 이 div 상자 안에 내용물이 들어가게 됩니다. */}
      {children}
    </div>
  );
}

// 사용 (부모 컴포넌트):

// 다른 페이지에서 <Container> ...내용... </Container> 이렇게 이 컴포넌트를 가져다 씁니다.

// 마치 **"이 내용물들을 이 상자에 담아줘!"**라고 명령하는 것과 같습니다.

// 호출 (React):

// 리액트는 이 Container 함수를 실행합니다.

// 이때, 상자 안에 담긴 ...내용...을 **children**이라는 이름의 보따리에 싸서 전달해 줍니다.

// 포장 (Container 컴포넌트):

// 이 컴포넌트는 전달받은 children(내용물)을 <div> 태그로 감쌉니다.

// 그냥 감싸는 게 아니라, className을 통해 **스타일(옷)**을 입힙니다.

// "위치 기준 잡아!" (relative)

// "넘치는 건 잘라내!" (overflow-hidden)

// "PC 화면에서는 최소 이만큼은 넓어져야 해!" (lg:min-w-7xl)

// 렌더링 (결과):

// 최종적으로 브라우저에는 스타일이 적용된 div 박스 안에 내용물이 쏙 들어간 형태로 나타납니다.
