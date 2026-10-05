/* Shared GA4 and AdSense runtime. Local previews never load vendor scripts. */
(() => {
  if (window.__papaPenguinIntegrations) return;
  window.__papaPenguinIntegrations = true;
  const config = JSON.parse(document.getElementById('site-integrations').textContent);
  const placements = [...document.querySelectorAll('[data-ad-placement]')];
  const isProduction = config.production_hosts.includes(location.hostname);
  if (!isProduction) {
    // Show reserved dimensions for editorial QA, without making impressions.
    for (const placement of placements) {
      placement.dataset.adState = 'preview';
      placement.hidden = false;
      placement.querySelector('.ad-preview').hidden = false;
    }
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', config.analytics_id);
  const analytics = document.createElement('script');
  analytics.id = 'google-analytics';
  analytics.async = true;
  analytics.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.analytics_id);
  document.head.append(analytics);

  // The common loader also supports account-enabled Auto ads. Manual slots are separate.
  const ads = document.createElement('script');
  ads.id = 'google-adsense';
  ads.async = true;
  ads.crossOrigin = 'anonymous';
  ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(config.adsense_client);
  ads.onerror = () => placements.forEach(placement => { placement.hidden = true; });
  document.head.append(ads);

  window.adsbygoogle = window.adsbygoogle || [];
  for (const placement of placements) {
    const unit = placement.querySelector('ins.adsbygoogle');
    // Missing account slot IDs must not produce malformed requests or blank public boxes.
    if (!unit) continue;
    placement.hidden = false;
    placement.dataset.adState = 'loading';
    const observer = new MutationObserver(() => {
      const status = unit.getAttribute('data-ad-status');
      if (status === 'unfilled') { placement.hidden = true; placement.dataset.adState = 'unfilled'; observer.disconnect(); }
      if (status === 'filled') { placement.dataset.adState = 'filled'; observer.disconnect(); }
    });
    observer.observe(unit, {attributes:true, attributeFilter:['data-ad-status']});
    try {
      window.adsbygoogle.push({});
    } catch {
      placement.hidden = true;
      placement.dataset.adState = 'error';
      observer.disconnect();
    }
  }
})();
