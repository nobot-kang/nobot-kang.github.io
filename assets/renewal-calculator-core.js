// Fictional project accounting. Monetary integers are in KRW 10,000.
// No DOM, network, persistence, observed-market inputs or intermediate rounding.
(() => {
  'use strict';
  const fields = {
    external: {label: '일반분양 등 외부 수입', max: 10000000000n},
    member: {label: '조합원 분양 수입 합계', max: 10000000000n},
    cost: {label: '총사업비', max: 10000000000n},
    assets: {label: '종전자산 총액', max: 10000000000n},
    individual: {label: '개인 평가액', max: 10000000n},
    price: {label: '개인 선택 분양가', max: 10000000n}
  };
  const defaults = Object.freeze({external: '6000', member: '9000', cost: '9000',
    assets: '6000', individual: '6', price: '9'});
  function rational(n, d = 1n) {
    if (d === 0n) throw new RangeError('Zero denominator');
    if (d < 0n) {n = -n; d = -d;}
    let a = n < 0n ? -n : n, b = d;
    while (b) [a, b] = [b, a % b];
    return {n: n / a, d: d / a};
  }
  function subtract(a, b) {return rational(a.n * b.d - b.n * a.d, a.d * b.d);}
  function parseAmount(raw) {
    if (typeof raw !== 'string' || raw.length > 32) return null;
    const text = raw.trim();
    if (!/^(?:\d+(?:\.\d{1,4})?|\.\d{1,4})$/.test(text)) return null;
    const [whole, decimal = ''] = text.split('.');
    return BigInt(whole || '0') * 10000n + BigInt(decimal.padEnd(4, '0'));
  }
  function calculate(raw) {
    const values = {}, errors = {};
    for (const [key, {label, max}] of Object.entries(fields)) {
      const value = parseAmount(raw?.[key]);
      if (value === null) errors[key] = `${label}: 숫자를 소수 네 자리까지 입력하세요. 단위는 억 원입니다.`;
      else if (value > max) errors[key] = `${label}: 도구의 입력 범위는 0~${(max / 10000n).toLocaleString('ko-KR')}억 원입니다.`;
      else values[key] = value;
    }
    if (values.assets === 0n) errors.assets = '종전자산 총액은 0보다 커야 합니다. 최소 입력은 0.0001억 원입니다.';
    if (values.individual !== undefined && values.assets !== undefined && values.individual > values.assets)
      errors.individual = '개인 평가액은 종전자산 총액을 넘을 수 없습니다. 같은 범위의 금액인지 확인하세요.';
    if (values.price !== undefined && values.member !== undefined && values.price > values.member)
      errors.price = '개인 선택 분양가는 조합원 분양 수입 합계를 넘을 수 없습니다.';
    if (Object.keys(errors).length) return {errors};
    const revenue = values.external + values.member;
    const ratio = rational(revenue - values.cost, values.assets);
    const rights = rational(values.individual * ratio.n, ratio.d);
    const charge = subtract(rational(values.price), rights);
    const totalCash = values.cost - values.external;
    return {values, revenue, ratio, rights, charge, totalCash};
  }
  function compare(baseRaw, changeRaw) {
    const base = calculate(baseRaw), change = calculate(changeRaw);
    if (base.errors || change.errors) return {errors: {base: base.errors || {}, change: change.errors || {}}};
    return {base, change, delta: subtract(change.charge, base.charge)};
  }
  function example(kind) {
    const base = {...defaults}, change = {...defaults};
    if (kind === 'external') change.external = '5400';
    else if (kind === 'member') {change.member = '8100'; change.price = '8.1';}
    else if (kind === 'cost') change.cost = '9200';
    else if (kind !== 'base') throw new RangeError('Unknown example');
    return {base, change};
  }
  const api = {fields, defaults, parseAmount, rational, calculate, compare, example};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globalThis.RenewalCalculator = api;
})();
