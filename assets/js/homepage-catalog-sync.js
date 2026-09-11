/* IWA RICH YOU D — Keeps the homepage's #products category cards
   in sync with live admin data by dynamically rendering categories. */
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  function renderCategoryCard(cat) {
    const href = `products/${cat.slug}.html`;
    const eyebrow = cat.eyebrow || cat.label || '';
    const summary = cat.description || cat.summary || '';
    const count = cat.product_count || 0;

    return `
      <a class="catalog-category-card" href="${href}">
        <span class="catalog-card-photo" aria-hidden="true"></span>
        <span class="catalog-category-card__label">${escapeHtml(eyebrow)}</span>
        <strong>${escapeHtml(cat.name)}</strong>
        <span>${escapeHtml(summary)}</span>
        <small>มีสินค้า ${count} รายการ</small>
      </a>
    `;
  }

  async function sync() {
    const grid = document.querySelector('#products .catalog-category-grid');
    if (!grid) return;

    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      const categories = await res.json();

      if (Array.isArray(categories) && categories.length > 0) {
        grid.innerHTML = categories.map(renderCategoryCard).join('');
      }
    } catch (err) {
      console.debug('IWA homepage-catalog-sync: skipped', err.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
})();