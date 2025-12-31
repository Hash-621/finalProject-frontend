export default function Page() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-black mb-10 text-green-600">
        개인정보처리방침
      </h1>

      <section className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <p className="text-slate-700 font-medium m-0">
          회사는 이용자의 개인정보를 소중하게 생각하며, "개인정보보호법" 등 관련
          법규를 준수하고 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">1. 수집하는 개인정보 항목</h2>
        <p className="text-slate-600">
          회사는 서비스 이용을 위해 아래와 같은 정보를 수집할 수 있습니다.
        </p>
        <ul className="list-disc pl-5 text-slate-600 space-y-2 mt-2">
          <li>필수항목: 이메일, 닉네임, 로그인 정보</li>
          <li>자동수집: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">2. 개인정보의 이용 목적</h2>
        <p className="text-slate-600 leading-relaxed">
          수집한 개인정보는 이용자 식별, 서비스 품질 개선, 새로운 코스 추천 알림
          등을 위해서만 사용됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">3. 개인정보의 보유 및 파기</h2>
        <p className="text-slate-600 leading-relaxed">
          원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체
          없이 파기합니다. 단, 법령에 의해 보존이 필요한 경우 해당 기간까지
          보관합니다.
        </p>
      </section>

      <h2 className="text-xl font-bold mb-4">개인정보 보호책임자</h2>
      <p className="text-slate-600">
        성명: 홍길동 (Daejeon Tour Team)
        <br />
        이메일: support@daejeontour.com
      </p>

      <p className="text-sm text-slate-400 mt-20 font-bold underline">
        버전번호: v1.0 (최종 업데이트: 2025-12-22)
      </p>
    </article>
  );
}
