/* IWA RICH YOU D — Keeps the homepage's #products category cards
   (the "มีสินค้า X รายการ" counts) in sync with live admin data.
   Safe no-op if the admin backend / API isn't reachable. */
(function () {
  'use strict';

  function slugFromHref(href) {
    // "products/digital-learning.html" -> "digital-learning"
    const match = href.match(/products\/([a-z0-9-]+)\.html/i);
    return match ? match[1] : null;
  }

  async function sync() {
    const cards = document.querySelectorAll('#products .catalog-category-card');
    if (!cards.length) return;
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      const categories = await res.json();
      const bySlug = {};
      categories.forEach((c) => { bySlug[c.slug] = c; });

      cards.forEach((card) => {
        const slug = slugFromHref(card.getAttribute('href') || '');
        const cat = slug && bySlug[slug];
        const countEl = card.querySelector('small');
        if (cat && countEl) countEl.textContent = `มีสินค้า ${cat.product_count} รายการ`;
      });
    } catch (err) {
      // API not reachable (e.g. static preview without the backend running) — leave the static text as-is.
      console.debug('IWA homepage-catalog-sync: skipped', err.message);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
