/* IWA RICH YOU D — Product detail loader
   Reads ?slug=xxx from the URL, fetches /api/products/:slug and fills the page. */
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function load() {
    const slug = new URLSearchParams(location.search).get('slug');
    const root = document.querySelector('[data-product-root]');
    if (!slug || !root) {
      if (root) root.innerHTML = '<p style="padding:40px">ไม่พบสินค้าที่ต้องการ</p>';
      return;
    }
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error('not found');
      const p = await res.json();

      document.title = p.name + ' | IWA RICH YOU D';
      const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
      const setHtml = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; };
      const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };

      set('[data-crumb-cat]', p.category_name);
      setAttr('[data-crumb-cat]', 'href', `${p.category_slug}.html`);
      set('[data-crumb-title]', p.name);
      set('[data-product-title]', p.name);
      set('[data-product-label]', p.label || '');
      set('[data-product-summary]', p.summary || '');
      set('[data-product-description]', p.description || '');
      setAttr('[data-product-image]', 'src', p.image || '../assets/img/placeholder-product.png');
      setAttr('[data-product-image]', 'alt', p.name);
      setAttr('[data-product-image]', 'onerror', "this.onerror=null;this.src='../assets/img/placeholder-product.png';");
      set('[data-highlight-title]', p.highlight_title || '');
      set('[data-highlight-body]', p.highlight_body || '');
      setAttr('[data-back-link]', 'href', `${p.category_slug}.html`);

      const gallery = document.querySelector('[data-product-gallery]');
      if (gallery) {
        if (p.images && p.images.length) {
          gallery.innerHTML = p.images.map((img) => `
            <figure>
              <img src="${escapeHtml(img.image)}" alt="${escapeHtml(img.caption || p.name)}" loading="lazy">
              ${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ''}
            </figure>`).join('');
          gallery.closest('section')?.removeAttribute('hidden');
        } else {
          gallery.closest('section')?.setAttribute('hidden', '');
        }
      }

      root.removeAttribute('hidden');
    } catch (err) {
      console.error('IWA product-loader error:', err);
      root.innerHTML = '<p style="padding:40px">ไม่พบสินค้าที่ต้องการ หรือสินค้านี้ถูกลบไปแล้ว</p>';
      root.removeAttribute('hidden');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
