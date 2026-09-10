/* IWA RICH YOU D — Category loader
   Fetches category + product data from the live /api and renders it into
   the page. Add data-category="<slug>" on <body> to activate.
   Optional: data-card-style="preschool" on <body> for the alt card layout. */
(function () {
  'use strict';
  const body = document.body;
  const slug = body.getAttribute('data-category');
  if (!slug) return;
  const cardStyle = body.getAttribute('data-card-style') || 'default';

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderMeta(tags) {
    if (!tags) return '';
    return tags.split(',').map((t) => `<span>${escapeHtml(t.trim())}</span>`).join('');
  }

  function cardHtml(p) {
    const href = `product.html?slug=${encodeURIComponent(p.slug)}`;
    const img = p.image || '../assets/img/placeholder-product.png';
    const onerr = `this.onerror=null;this.src='../assets/img/placeholder-product.png';`;
    if (cardStyle === 'preschool') {
      return `
        <article class="demo-product-card preschool-product-card">
          <div class="preschool-product-art"><img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="${onerr}"></div>
          <div class="demo-product-card__body">
            <span class="demo-product-label">${escapeHtml(p.label || '')}</span>
            <h3>${escapeHtml(p.name)}</h3>
            <p>${escapeHtml(p.summary || '')}</p>
            <div class="demo-product-meta">${renderMeta(p.meta_tags)}</div>
            <a class="demo-product-card__link" href="${href}">ดูรายละเอียดสินค้า <b aria-hidden="true">→</b></a>
          </div>
        </article>`;
    }
    return `
      <article class="demo-product-card">
        <div class="demo-product-art demo-product-art--image"><img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="${onerr}"></div>
        <div class="demo-product-card__body">
          <span class="demo-product-label">${escapeHtml(p.label || '')}</span>
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.summary || '')}</p>
          <div class="demo-product-meta">${renderMeta(p.meta_tags)}</div>
          <a class="demo-product-card__link" href="${href}">ดูรายละเอียดสินค้า<b aria-hidden="true">→</b></a>
        </div>
      </article>`;
  }

  async function load() {
    const grid = document.querySelector('[data-product-grid]');
    try {
      const [catRes, productsRes] = await Promise.all([
        fetch(`/api/categories/${encodeURIComponent(slug)}`),
        fetch(`/api/products?category=${encodeURIComponent(slug)}`)
      ]);
      if (catRes.ok) {
        const cat = await catRes.json();
        const h1 = document.querySelector('[data-cat-title]');
        const eyebrow = document.querySelector('[data-cat-eyebrow]');
        const desc = document.querySelector('[data-cat-desc]');
        const crumb = document.querySelector('[data-cat-crumb]');
        if (h1) h1.textContent = cat.name;
        if (eyebrow) eyebrow.textContent = cat.eyebrow || '';
        if (desc) desc.textContent = cat.description || '';
        if (crumb) crumb.textContent = cat.name;
        document.title = cat.name + ' | IWA RICH YOU D';
      }
      if (!productsRes.ok) throw new Error('failed to load products');
      const products = await productsRes.json();

      const countEl = document.querySelector('[data-cat-count]');
      if (countEl) countEl.textContent = `${products.length} รายการ`;

      if (!grid) return;
      if (!products.length) {
        grid.innerHTML = `<div class="empty-product-state"><div><div class="empty-product-state__icon">–</div><h3>ยังไม่มีสินค้าในหมวดหมู่นี้</h3><p>เมื่อมีสินค้าใหม่ จะเพิ่มรายละเอียดอย่างเป็นระบบในหน้านี้</p><a class="catalog-page__contact" href="../#contact">สอบถามทีมงาน →</a></div></div>`;
        return;
      }
      grid.innerHTML = products.map(cardHtml).join('');
    } catch (err) {
      console.error('IWA category-loader error:', err);
      if (grid) grid.innerHTML = '<p style="padding:24px;color:#8f8573">ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้</p>';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
