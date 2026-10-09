// Arithmetic comparison only. No market-rate lookup, legal verdict or input persistence.
(() => {
  'use strict';
  const fields = ['deposit-a', 'rent-a', 'deposit-b', 'rent-b', 'cost-rate'];
  const labels = ['A안 보증금', 'A안 월세', 'B안 보증금', 'B안 월세', '추가 자금의 연비용률'];
  function compare(values) {
    const errors = {};
    fields.forEach((id, i) => {
      const value = values[id], max = id === 'cost-rate' ? 100 : 100000000;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max)
        errors[id] = `${labels[i]}: 0~${max.toLocaleString('ko-KR')} 사이의 숫자를 입력하세요.`;
    });
    if (Object.keys(errors).length) return {errors};
    const extra = values['deposit-b'] - values['deposit-a'];
    if (extra <= 0) return {errors: {'deposit-b': 'B안 보증금은 A안보다 커야 합니다. 두 안을 바꾸거나 보증금을 확인하세요.'}};
    const saving = values['rent-a'] - values['rent-b'];
    const cost = extra * values['cost-rate'] / 1200;
    const implied = saving * 1200 / extra;
    if (!Number.isFinite(implied)) return {errors: {'deposit-b': '보증금 차이가 너무 작아 비율을 계산할 수 없습니다. 금액과 단위를 확인하세요.'}};
    return {extra, saving, implied, cost, net: saving - cost};
  }
  if (typeof module !== 'undefined') module.exports = {compare};
  if (typeof document === 'undefined') return;
  const form = document.getElementById('deposit-calculator');
  if (!form) return;
  const errorBox = document.getElementById('deposit-errors');
  const output = document.getElementById('deposit-result');
  const format = value => value.toLocaleString('ko-KR', {minimumFractionDigits: 1, maximumFractionDigits: 2});
  function clear() {
    errorBox.replaceChildren(); errorBox.hidden = true; output.hidden = true;
    fields.forEach(id => {
      document.getElementById(id).removeAttribute('aria-invalid');
      document.getElementById(`${id}-error`).textContent = '';
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    const values = Object.fromEntries(fields.map(id => {
      const raw = document.getElementById(id).value.trim();
      return [id, raw === '' ? NaN : Number(raw)];
    }));
    const result = compare(values);
    if (result.errors) {
      const title = document.createElement('p'); title.textContent = '입력값을 확인하세요.'; errorBox.append(title);
      Object.entries(result.errors).forEach(([id, message]) => {
        document.getElementById(id).setAttribute('aria-invalid', 'true');
        document.getElementById(`${id}-error`).textContent = message;
        const link = document.createElement('a'); link.href = `#${id}`; link.textContent = message;
        errorBox.append(link);
      });
      errorBox.hidden = false; errorBox.focus(); return;
    }
    ['extra', 'saving', 'implied', 'cost'].forEach(key => {
      document.getElementById(`deposit-${key}`).textContent = format(result[key]);
    });
    const same = Math.abs(result.net) < 1e-9;
    document.getElementById('deposit-net').textContent = same ? '두 안의 계산상 비용이 같습니다.' :
      `B안이 A안보다 월 ${format(Math.abs(result.net))}만원 ${result.net > 0 ? '적습니다' : '많습니다'}.`;
    document.getElementById('deposit-direction').textContent = result.saving <= 0 ?
      '보증금을 더 내지만 월세가 줄지 않는 조건입니다. 음수 전환율은 월세 절감이 없다는 산술 표시입니다.' :
      '계산된 전환율은 입력한 두 조건의 차이입니다. 시장 대표율·법정 상한·보장 수익률이 아닙니다.';
    output.hidden = false; output.focus();
  });
  form.addEventListener('input', clear);
  form.addEventListener('reset', () => { clear(); });
  form.hidden = false;
})();
