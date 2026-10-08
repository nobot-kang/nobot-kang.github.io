// Progressive filter for the topics archive; without JavaScript every article stays listed.
(() => {
  const box = document.querySelector('.archive-filter');
  if (!box) return;
  const input = box.querySelector('input');
  const status = box.querySelector('#archive-status');
  const empty = document.querySelector('.archive-empty');
  const total = Number(status.dataset.total);
  box.hidden = false;
  input.addEventListener('input', () => {
    const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const item of document.querySelectorAll('.archive-list li')) {
      const match = words.every(word => item.dataset.search.includes(word));
      item.hidden = !match;
      shown += match;
    }
    for (const group of document.querySelectorAll('.archive-series, .archive-topic')) {
      group.hidden = !group.querySelector('.archive-list li:not([hidden])');
    }
    empty.hidden = shown > 0;
    status.textContent = words.length ? `전체 ${total}편 중 ${shown}편` : `전체 ${total}편`;
  });
})();
