/* IWA RICH YOU D — Admin shared helpers */
const Admin = (function () {
  async function api(path, options = {}) {
    const res = await fetch('/admin-api' + path, {
      method: options.method || 'GET',
      headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
      credentials: 'same-origin'
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (res.status === 401) {
      window.location.href = 'index.html';
      throw new Error('unauthorized');
    }
    if (!res.ok) {
      const err = new Error((data && data.message) || 'เกิดข้อผิดพลาด');
      err.data = data;
      throw err;
    }
    return data;
  }

  function toast(message, type = 'success') {
    let el = document.querySelector('.a-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'a-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = 'a-toast show ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3200);
  }

  async function guard() {
    try {
      const me = await api('/me');
      if (!me.loggedIn) { window.location.href = 'index.html'; return null; }
      const nameEl = document.querySelector('[data-admin-username]');
      if (nameEl) nameEl.textContent = me.username;
      return me;
    } catch (e) {
      window.location.href = 'index.html';
      return null;
    }
  }

  function bindLogout() {
    const btn = document.querySelector('[data-logout]');
    if (btn) btn.addEventListener('click', async () => {
      await api('/logout', { method: 'POST' });
      window.location.href = 'index.html';
    });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function setActiveNav() {
    const page = document.body.getAttribute('data-page');
    document.querySelectorAll('.a-sidebar a[data-nav]').forEach((a) => {
      if (a.getAttribute('data-nav') === page) a.classList.add('active');
    });
  }

  return { api, toast, guard, bindLogout, escapeHtml, setActiveNav };
})();
