/* Shared GA4 and AdSense runtime. Local previews never load vendor scripts. */
(() => {
  if (window.__papaPenguinIntegrations) return;
  let config;
  try {
    const element = document.getElementById('site-integrations');
    if (!element) return;
    config = JSON.parse(element.textContent);
    if (!Array.isArray(config.production_hosts) ||
        !/^G-[A-Z0-9]+$/.test(config.analytics_id) ||
        !/^ca-pub-\d{16}$/.test(config.adsense_client)) return;
  } catch { return; }
  window.__papaPenguinIntegrations = true;
  const placements = [...document.querySelectorAll('[data-ad-placement]')];
  const isProduction = config.production_hosts.includes(location.hostname);
  if (!isProduction) {
    for (const placement of placements) {
      placement.dataset.adState = 'preview';
      placement.hidden = false;
      const preview = placement.querySelector('.ad-preview');
      if (preview) preview.hidden = false;
    }
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // Run before config/loader. The certified Google CMP supplies subsequent updates.
  window.gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', wait_for_update: 500,
    region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
      'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH']
  });
  window.gtag('js', new Date());
  window.gtag('config', config.analytics_id);
  const analytics = document.createElement('script');
  analytics.id = 'google-analytics';
  analytics.async = true;
  analytics.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.analytics_id);
  document.head.append(analytics);

  // Policy/error pages must also be excluded from Auto ads at the loader boundary.
  if (config.ads_enabled === false) {
    placements.forEach(placement => { placement.hidden = true; });
    return;
  }
  // Reopen the certified CMP; never synthesize a user's consent choice.
  const reopen = document.getElementById('consent-reopen');
  const feedback = document.getElementById('consent-feedback');
  if (reopen) {
    const failed = () => { if (feedback) feedback.hidden = false; };
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({CONSENT_API_READY: () => {
      if (typeof window.__tcfapi !== 'function') return;
      try {
        window.__tcfapi('addEventListener', 0, (data, success) => {
          reopen.hidden = !(success && data?.gdprApplies === true &&
            typeof window.googlefc.showRevocationMessage === 'function');
        });
      } catch { reopen.hidden = true; }
    }});
    reopen.addEventListener('click', () => {
      if (feedback) feedback.hidden = true;
      try {
        window.googlefc.callbackQueue.push({CONSENT_API_READY: () => {
          try { window.googlefc.showRevocationMessage(); } catch { failed(); }
        }});
      } catch { failed(); }
    });
  }
  const pending = new Set();
  const collapse = placement => {
    const rect = placement.getBoundingClientRect();
    // Below the viewport is safe; above it, retain the reader's exact position.
    if (rect.top >= innerHeight || rect.bottom <= 0) {
      const above = rect.bottom <= 0;
      const next = placement.nextElementSibling;
      const before = next?.getBoundingClientRect().top;
      placement.hidden = true;
      if (above && next) window.scrollBy(0, next.getBoundingClientRect().top - before);
      pending.delete(placement);
    } else {
      pending.add(placement);
    }
  };
  let scheduled = false;
  const flush = () => {
    if (scheduled || !pending.size) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; pending.forEach(collapse); });
  };
  window.addEventListener('scroll', flush, {passive:true});
  window.addEventListener('resize', flush, {passive:true});
  const stops = [];
  const ads = document.createElement('script');
  ads.id = 'google-adsense';
  ads.async = true;
  ads.crossOrigin = 'anonymous';
  ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(config.adsense_client);
  ads.onerror = () => stops.forEach(stop => stop('error'));

  window.adsbygoogle = window.adsbygoogle || [];
  for (const placement of placements) {
    const unit = placement.querySelector('ins.adsbygoogle');
    if (!unit) { placement.hidden = true; continue; }
    placement.dataset.adState = 'loading';
    let settled = false;
    let timer;
    const stop = status => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      observer.disconnect();
      placement.dataset.adState = status;
      if (status !== 'filled') collapse(placement);
    };
    const check = () => {
      const status = unit.getAttribute('data-ad-status');
      if (status === 'filled' || status === 'unfilled') stop(status);
    };
    const observer = new MutationObserver(check);
    observer.observe(unit, {attributes:true, attributeFilter:['data-ad-status']});
    timer = setTimeout(() => stop('timeout'), 10000);
    stops.push(stop);
    check();
    try { window.adsbygoogle.push({}); } catch { stop('error'); }
  }
  document.head.append(ads);
})();
