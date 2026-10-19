// Local display/controller for fictional contribution comparisons.
(() => {
  'use strict';
  const abs = n => n < 0n ? -n : n;
  const round = (n, d) => (abs(n) * 2n + d) / (2n * d);
  function money(value) {
    const {n, d} = typeof value === 'bigint' ? {n: value, d: 1n} : value;
    if (n === 0n) return '0만 원';
    if (abs(n) < d) return '1만 원 미만' + (n < 0n ? ' (음수)' : '');
    const rounded = round(n, d), eok = rounded / 10000n, man = rounded % 10000n;
    const parts = [];
    if (eok) parts.push(eok.toLocaleString('ko-KR') + '억');
    if (man) parts.push(man.toLocaleString('ko-KR') + '만');
    return (n < 0n ? '−' : '') + parts.join(' ') + ' 원';
  }
  function percent({n, d}) {
    const rounded = round(n * 10000n, d);
    if (n !== 0n && rounded === 0n) return n < 0n ? '0% 미만 · 크기는 0.01% 미만' : '0% 초과 · 0.01% 미만';
    return (n < 0n ? '−' : '') + (rounded / 100n).toLocaleString('ko-KR') + '.' +
      (rounded % 100n).toString().padStart(2, '0') + '%';
  }
  function deltaText(value) {
    if (value.n === 0n) return '개인 분담금은 두 안에서 같습니다.';
    return '변경안의 개인 분담금은 기준안보다 ' + money({n: abs(value.n), d: value.d}) +
      (value.n > 0n ? ' 증가합니다.' : ' 감소합니다.');
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {money, percent, deltaText};
  if (typeof document === 'undefined') return;
  const core = globalThis.RenewalCalculator, form = document.getElementById('renewal-calculator');
  if (!core || !form) return;
  const errors = document.getElementById('renewal-errors');
  const output = document.getElementById('renewal-result');
  const status = document.getElementById('renewal-status');
  const notices = document.getElementById('renewal-notices');
  const sides = {base: '기준안', change: '변경안'};
  const input = (side, key) => document.getElementById(`renewal-${side}-${key}`);
  function clear() {
    errors.replaceChildren(); errors.hidden = true; output.hidden = true;
    for (const side of Object.keys(sides)) for (const key of Object.keys(core.fields)) {
      input(side, key).removeAttribute('aria-invalid');
      document.getElementById(`renewal-${side}-${key}-error`).textContent = '';
    }
  }
  function showErrors(found) {
    const heading = document.createElement('h3');
    heading.id = 'renewal-error-title'; heading.textContent = '입력값을 확인하세요'; errors.append(heading);
    const list = document.createElement('ul'); errors.append(list);
    for (const [side, items] of Object.entries(found)) for (const [key, message] of Object.entries(items)) {
      const field = input(side, key); field.setAttribute('aria-invalid', 'true');
      document.getElementById(field.id + '-error').textContent = message;
      const item = document.createElement('li'), link = document.createElement('a');
      link.href = '#' + field.id; link.textContent = `${sides[side]} · ${message}`;
      link.addEventListener('click', event => {event.preventDefault(); field.focus();});
      item.append(link); list.append(item);
    }
    status.textContent = '오류를 고친 뒤 다시 계산하세요.';
    errors.hidden = false; errors.focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    const raw = Object.fromEntries(Object.keys(sides).map(side => [side,
      Object.fromEntries(Object.keys(core.fields).map(key => [key, input(side, key).value]))]));
    const result = core.compare(raw.base, raw.change);
    if (result.errors) {showErrors(result.errors); return;}
    notices.replaceChildren();
    for (const [side, label] of Object.entries(sides)) {
      const r = result[side];
      const values = {revenue: money(r.revenue), ratio: percent(r.ratio), rights: money(r.rights),
        charge: money(r.charge), total: money(r.totalCash)};
      for (const [key, value] of Object.entries(values)) document.getElementById(`renewal-${side}-${key}-result`).textContent = value;
      const notes = [];
      if (r.ratio.n < 0n) notes.push('총수입보다 총사업비가 커 비례율과 권리가액이 음수입니다. 단순 산식의 결과이며 이 조건의 사업이 실제로 가능한지 판정하지 않습니다.');
      if (r.charge.n < 0n) notes.push('권리가액이 선택 분양가보다 커 개인 분담금이 음수입니다. 산식상 차감 초과이며 확정 환급액이나 지급 시기를 뜻하지 않습니다.');
      if (r.totalCash < 0n) notes.push('외부 수입이 총사업비보다 큽니다. 전체 차액의 음수도 실제 정산·환급을 보장하지 않습니다.');
      for (const note of notes) {const p = document.createElement('p'); p.textContent = `${label}: ${note}`; notices.append(p);}
    }
    notices.hidden = notices.children.length === 0;
    document.getElementById('renewal-delta').textContent = deltaText(result.delta);
    status.textContent = '현재 두 안의 입력으로 계산했습니다.';
    output.hidden = false; output.focus();
  });
  form.addEventListener('input', () => {clear(); status.textContent = '입력이 바뀌었습니다. 두 안 비교하기를 눌러 결과를 갱신하세요.';});
  form.addEventListener('reset', () => {clear(); status.textContent = '두 안을 처음의 같은 가상 예시로 되돌렸습니다. 다시 계산하세요.';});
  for (const button of form.querySelectorAll('[data-renewal-example]')) button.addEventListener('click', () => {
    const example = core.example(button.dataset.renewalExample); clear();
    for (const side of Object.keys(sides)) for (const key of Object.keys(core.fields)) input(side, key).value = example[side][key];
    status.textContent = '두 안 전체에 가상 예시를 불러왔습니다. 두 안 비교하기를 눌러 계산하세요.';
  });
  form.hidden = false;
})();
