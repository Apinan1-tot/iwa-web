/* IWA RICH YOU D — Keeps the homepage's #products category cards in sync
   with live admin data, and automatically appends a card for any category
   that doesn't already have a hand-placed card on the homepage (so brand new
   categories show up here too, not just on /products/).
   Safe no-op if the admin backend / API isn't reachable. */
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function slugFromHref(href) {
    // "products/digital-learning.html" -> "digital-learning", "products/category.html?slug=x" -> "x"
    const queryMatch = href.match(/[?&]slug=([a-z0-9-]+)/i);
    if (queryMatch) return queryMatch[1];
    const pathMatch = href.match(/products\/([a-z0-9-]+)\.html/i);
    return pathMatch ? pathMatch[1] : null;
  }

  function newCardHtml(cat) {
    const bgStyle = cat.image ? `background-image:url('${escapeHtml(cat.image)}');background-size:cover;background-position:center` : '';
    return `
      <a class="catalog-category-card" href="products/category.html?slug=${encodeURIComponent(cat.slug)}" data-iwa-generated="1">
        <span class="catalog-card-photo" aria-hidden="true" style="${bgStyle}"></span>
        <span class="catalog-category-card__label">${escapeHtml(cat.eyebrow || '')}</span>
        <strong>${escapeHtml(cat.name)}</strong>
        <span>${escapeHtml(cat.description || '')}</span>
        <small>มีสินค้า ${cat.product_count} รายการ</small>
      </a>`;
  }

  async function sync() {
    const grid = document.querySelector('#products .catalog-category-grid');
    const cards = document.querySelectorAll('#products .catalog-category-card');
    if (!grid && !cards.length) return;
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      const categories = await res.json();
      const bySlug = {};
      categories.forEach((c) => { bySlug[c.slug] = c; });
      const matchedSlugs = new Set();

      cards.forEach((card) => {
        const slug = slugFromHref(card.getAttribute('href') || '');
        const cat = slug && bySlug[slug];
        if (!cat) return;
        matchedSlugs.add(slug);
        const countEl = card.querySelector('small');
        if (countEl) countEl.textContent = `มีสินค้า ${cat.product_count} รายการ`;
        if (cat.image) {
          const photoEl = card.querySelector('.catalog-card-photo');
          if (photoEl) {
            photoEl.style.backgroundImage = `url('${cat.image}')`;
            photoEl.style.backgroundSize = 'cover';
            photoEl.style.backgroundPosition = 'center';
          }
        }
      });

      if (grid) {
        // Remove any previously auto-generated cards so we don't duplicate on repeat visits/navigations.
        grid.querySelectorAll('[data-iwa-generated]').forEach((el) => el.remove());
        categories
          .filter((c) => !matchedSlugs.has(c.slug))
          .forEach((c) => { grid.insertAdjacentHTML('beforeend', newCardHtml(c)); });
      }
    } catch (err) {
      // API not reachable (e.g. static preview without the backend running) — leave the static content as-is.
      console.debug('IWA homepage-catalog-sync: skipped', err.message);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();