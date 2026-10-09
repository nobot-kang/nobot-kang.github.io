// Local fictional annuity scenarios. No quote lookup, underwriting or persistence.
(() => {
  'use strict';
  const rules = {
    'loan-principal': ['대출원금', 1, 10000000, false],
    'loan-months': ['남은 상환 개월', 1, 600, true],
    'loan-rate-a': ['A안 연금리', 0, 20, false],
    'loan-rate-b': ['B안 연금리', 0, 20, false],
    'loan-budget': ['월 상환 예산', 1, 100000, false]
  };
  function payment(principal, rate, months) {
    const r = rate / 1200;
    return r === 0 ? principal / months : principal * r / -Math.expm1(-months * Math.log1p(r));
  }
  function compare(v) {
    const errors = {};
    for (const [id, [label, min, max, integer]] of Object.entries(rules)) {
      if (typeof v[id] !== 'number' || !Number.isFinite(v[id]) || v[id] < min || v[id] > max || (integer && !Number.isInteger(v[id])))
        errors[id] = `${label}: ${min.toLocaleString('ko-KR')}~${max.toLocaleString('ko-KR')} 사이의 ${integer ? '정수' : '숫자'}를 입력하세요.`;
    }
    if (Object.keys(errors).length) return {errors};
    const p = v['loan-principal'], n = v['loan-months'], a = v['loan-rate-a'], b = v['loan-rate-b'], budget = v['loan-budget'];
    const monthlyA = payment(p, a, n), monthlyB = payment(p, b, n);
    return {monthlyA, monthlyB, delta: monthlyB - monthlyA,
      interestA: monthlyA * n - p, interestB: monthlyB * n - p,
      capacityA: budget / payment(1, a, n), capacityB: budget / payment(1, b, n)};
  }
  if (typeof module !== 'undefined') module.exports = {payment, compare};
  if (typeof document === 'undefined') return;
  const form = document.getElementById('loan-calculator');
  if (!form) return;
  const errorBox = document.getElementById('loan-errors'), output = document.getElementById('loan-result');
  const format = x => x.toLocaleString('ko-KR', {minimumFractionDigits: 1, maximumFractionDigits: 1});
  function clear() {
    errorBox.replaceChildren(); errorBox.hidden = true; output.hidden = true;
    for (const id of Object.keys(rules)) {
      document.getElementById(id).removeAttribute('aria-invalid');
      document.getElementById(id + '-error').textContent = '';
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    const v = Object.fromEntries(Object.keys(rules).map(id => {
      const raw = document.getElementById(id).value.trim();
      return [id, raw === '' ? NaN : Number(raw)];
    }));
    const result = compare(v);
    if (result.errors) {
      const title = document.createElement('p');title.textContent = '입력값을 확인하세요.';errorBox.append(title);
      for (const [id, message] of Object.entries(result.errors)) {
        document.getElementById(id).setAttribute('aria-invalid', 'true');
        document.getElementById(id + '-error').textContent = message;
        const link = document.createElement('a');link.href = '#' + id;link.textContent = message;errorBox.append(link);
      }
      errorBox.hidden = false;errorBox.focus();return;
    }
    for (const key of ['monthlyA','monthlyB','interestA','interestB','capacityA','capacityB'])
      document.getElementById('loan-' + key).textContent = format(result[key]) + '만 원';
    document.getElementById('loan-delta').textContent = Math.abs(result.delta) < 1e-9 ? '월 상환액이 같습니다.' :
      `B안은 A안보다 월 ${format(Math.abs(result.delta))}만 원 ${result.delta > 0 ? '많습니다' : '적습니다'}.`;
    document.getElementById('loan-assumptions').textContent = `원금 ${format(v['loan-principal'])}만 원 · ${v['loan-months']}개월 · A ${v['loan-rate-a']}% / B ${v['loan-rate-b']}% · 월 예산 ${format(v['loan-budget'])}만 원. 각각의 금리가 남은 기간 내내 유지된다고 가정합니다.`;
    output.hidden = false;output.focus();
  });
  form.addEventListener('input', clear);form.addEventListener('reset', clear);form.hidden = false;
})();
