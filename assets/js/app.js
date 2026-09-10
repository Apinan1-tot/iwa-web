/* IWA RICH YOU D — company site interactions (product data is intentionally empty). */
(function () {
  'use strict';

  const IMG = 'assets/img/';
  const services = [
    { title: 'Network Infrastructure & Design', img: 'svc-01-network.png', items: ['ออกแบบและวางระบบเครือข่าย LAN/Fiber Optic', 'Server และ Network Security', 'Smart Classroom Solution', 'Digital Language Lab'] },
    { title: 'Software & Application Development', img: 'svc-02-software.png', items: ['Custom Software', 'Mobile & Web Application', 'System Integration', 'Learning Management System (LMS)', 'พัฒนา AI Application ให้เหมาะกับความต้องการขององค์กร'] },
    { title: 'IT Maintenance Service', img: 'svc-03-maintenance.png', items: ['บริการดูแลรักษารายเดือน-รายปี', 'ตรวจเช็กระบบและกู้คืนข้อมูล', 'ดูแลอุปกรณ์และซอฟต์แวร์'] },
    { title: 'Hardware & Software Supply', img: 'svc-04-hardware.png', items: ['อุปกรณ์คอมพิวเตอร์และซอฟต์แวร์ลิขสิทธิ์', 'Interactive Smart Display', 'สื่อมัลติมีเดียเพื่อการศึกษา'] },
    { title: 'ICT Training & Seminar', img: 'svc-05-training.png', items: ['อบรมการใช้งานระบบและซอฟต์แวร์', 'อบรม Smart Classroom / Language Lab', 'อบรมสื่อการเรียนรู้และ CEFR'] }
  ];
  const training = [
    { title: 'อบรมเชิงปฏิบัติการสำหรับครูผู้สอน', img: 'training-picaro.jpg', items: ['การใช้สื่อดิจิทัลเพื่อการเรียนการสอน', 'กิจกรรมเชิงปฏิบัติการสำหรับผู้สอน'] },
    { title: 'Picaro English Training', img: 'training-picaro-inspire.jpg', items: ['แนวทางการเรียนรู้ภาษาอังกฤษ', 'กิจกรรม Inspire Motivate Enjoy'] },
    { title: 'English CEFR Boost Day', img: 'training-group.jpg', items: ['กิจกรรมพัฒนาทักษะภาษาอังกฤษ', 'แนวทางการประยุกต์ใช้ CEFR'] }
  ];

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const card = (item, index) => `<article class="svc-card iwa-reveal"><div class="svc-photo"><img src="${IMG + esc(item.img)}" alt="${esc(item.title)}" loading="lazy"></div><span class="svc-num">${String(index + 1).padStart(2, '0')}</span><h3>${esc(item.title)}</h3><ul>${item.items.map((entry) => `<li>${esc(entry)}</li>`).join('')}</ul></article>`;

  function renderCards(id, items) {
    const target = document.getElementById(id);
    if (target) target.innerHTML = items.map(card).join('');
  }

  function showPageSection(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('[data-section]').forEach((element) => {
      const active = element.dataset.section === id;
      element.classList.toggle('active', active);
      element.setAttribute('aria-current', active ? 'true' : 'false');
    });
    const mobileNav = document.getElementById('mobileNav');
    const burger = document.getElementById('burgerBtn');
    if (mobileNav) { mobileNav.classList.remove('open'); mobileNav.setAttribute('aria-hidden', 'true'); }
    if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  }

  function initNavigation() {
    document.querySelectorAll('[data-section]').forEach((element) => element.addEventListener('click', (event) => {
      event.preventDefault();
      if (element.dataset.section === 'products') {
        window.location.href = 'products/';
        return;
      }
      showPageSection(element.dataset.section);
    }));
    const burger = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (burger && mobileNav) burger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      mobileNav.setAttribute('aria-hidden', String(!open));
    });
  }

  function initEffects() {
    const header = document.getElementById('siteHeader');
    const toTop = document.getElementById('toTop');
    const updateScroll = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 20);
      if (toTop) toTop.classList.toggle('show', window.scrollY > 420);
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const observer = new IntersectionObserver((entries, activeObserver) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('iwa-visible', 'in'); activeObserver.unobserve(entry.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll('.iwa-reveal, .reveal-stagger').forEach((element) => observer.observe(element));
  }

  function initHeroShowcase() {
    const showcase = document.getElementById('heroShowcase');
    if (!showcase) return;
    const slides = [
      { image: 'hero-product-invitation.png', alt: 'ภาพแนะนำสินค้าและโซลูชันของ IWA RICH YOU D', label: 'DISCOVER OUR SOLUTIONS', title: 'เริ่มต้นค้นหาโซลูชันที่เหมาะกับคุณ', copy: 'เลือกดูสินค้า สื่อการเรียนรู้ และเทคโนโลยีสำหรับห้องเรียนและองค์กรได้ในที่เดียว', link: 'products/', action: 'ดูสินค้าและโซลูชัน' },
      { image: 'hero-classboard.png', alt: 'IWA Ai Board สำหรับห้องเรียนอัจฉริยะ', label: 'SMART CLASSROOM', title: 'ยกระดับการสอนด้วย IWA Ai Board', copy: 'จออัจฉริยะที่ช่วยให้บทเรียน ภาพ และกิจกรรมในห้องเรียนเชื่อมต่อกันได้อย่างลื่นไหล', link: 'products/iwa-smart-board.html', action: 'ดูโซลูชันห้องเรียน' },
      { image: 'product-picaro.jpg', alt: 'Picaro English', label: 'CHILDREN\'S ENGLISH', title: 'การเรียนภาษาอังกฤษที่เด็กอยากค้นพบ', copy: 'พบสื่อและหลักสูตรที่ใช้เรื่องราว ภาพ และกิจกรรมเพื่อสร้างประสบการณ์เรียนรู้ที่สนุกขึ้น', link: 'products/digital-learning.html', action: 'ดูหลักสูตรภาษาอังกฤษ' },
      { image: 'products/primary/digital-library-school.png', alt: 'Digital Library@School', label: 'DIGITAL LEARNING', title: 'คลังสื่อดิจิทัลสำหรับทุกบทเรียน', copy: 'เลือกดูสื่อมัลติมีเดียระดับประถมศึกษาที่ช่วยเสริมการเรียนรู้ในชั้นเรียนได้อย่างเป็นระบบ', link: 'products/primary-multimedia.html', action: 'ดูสื่อระดับประถมศึกษา' }
    ];
    const image = document.getElementById('heroShowcaseImage'); const label = document.getElementById('heroShowcaseLabel'); const title = document.getElementById('heroShowcaseTitle'); const copy = document.getElementById('heroShowcaseCopy'); const link = document.getElementById('heroShowcaseLink'); const dots = document.getElementById('heroShowcaseDots');
    let index = 0; let timer; let paused = false;
    const render = (next) => { index = (next + slides.length) % slides.length; const slide = slides[index]; image.style.opacity = '0'; image.style.transform = 'scale(1.035)'; window.setTimeout(() => { image.src = IMG + slide.image; image.alt = slide.alt; label.textContent = slide.label; title.textContent = slide.title; copy.textContent = slide.copy; link.href = slide.link; link.firstChild.textContent = slide.action + ' '; image.style.opacity = '1'; image.style.transform = 'scale(1)'; }, 180); Array.from(dots.children).forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === index))); };
    slides.forEach((slide, slideIndex) => { const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label', 'แสดง: ' + slide.title); dot.setAttribute('aria-current', String(slideIndex === 0)); dot.addEventListener('click', () => render(slideIndex)); dots.appendChild(dot); });
    const start = () => { window.clearInterval(timer); if (!paused) timer = window.setInterval(() => render(index + 1), 5600); };
    showcase.addEventListener('mouseenter', () => { paused = true; window.clearInterval(timer); }); showcase.addEventListener('mouseleave', () => { paused = false; start(); }); showcase.addEventListener('focusin', () => { paused = true; window.clearInterval(timer); }); showcase.addEventListener('focusout', () => { paused = false; start(); }); start();
  }

  function initLineQrModal() {
    const trigger = document.getElementById('lineContactTrigger');
    const modal = document.getElementById('lineQrModal');
    const closeBtn = document.getElementById('lineQrClose');
    if (!trigger || !modal) return;
    const openModal = () => {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    };
    trigger.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  function dismissLoader() {
    const loader = document.getElementById('bootLoader');
    if (!loader) return;
    window.setTimeout(() => { loader.classList.add('hide'); window.setTimeout(() => loader.remove(), 500); }, 450);
  }

  // A small, restrained "magnetic" pull on the hero's primary buttons — the one
  // deliberate cursor-driven moment on the page, not scattered across every element.
  function initMagneticButtons() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.hero-ctas .btn, .cta-band .btn').forEach((button) => {
      const strength = 0.28;
      button.addEventListener('mousemove', (event) => {
        const box = button.getBoundingClientRect();
        const x = (event.clientX - box.left - box.width / 2) * strength;
        const y = (event.clientY - box.top - box.height / 2) * strength;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('mouseleave', () => { button.style.transform = ''; });
    });
  }

  // Hero stats ("15+ ปีประสบการณ์" etc.) count up once, the moment they scroll into view.
  function initStatCounters() {
    const stats = document.querySelectorAll('.hero-stats strong');
    if (!stats.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = (element) => {
      const raw = element.textContent.trim();
      const match = raw.match(/^(\d+)(.*)$/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      const suffix = match[2];
      if (reduceMotion) { element.textContent = target + suffix; return; }
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries, activeObserver) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('strong').forEach(animate);
      activeObserver.unobserve(entry.target);
    }), { threshold: 0.4 });
    document.querySelectorAll('.hero-stats').forEach((element) => observer.observe(element));
  }

  // Playful bounce/wiggle animation for service/info/hero/contact cards.
  function initHoverBounce() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const STYLE_ID = 'iwa-bounce-styles';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
        '@keyframes iwaCardBounce{0%,100%{transform:scale(1) rotate(0deg);}30%{transform:scale(1.02) rotate(-.6deg);}55%{transform:scale(.992) rotate(.6deg);}75%{transform:scale(1.006) rotate(-.2deg);}}',
        '.iwa-bounce-card{transform-origin:center;}',
        '.iwa-bounce-card:hover,.iwa-bounce-card:focus-visible{animation:iwaCardBounce .55s ease;}'
      ].join('');
      document.head.appendChild(style);
    }
    // Only cards here — hero/CTA buttons already have their own magnetic-pull
    // effect from initMagneticButtons, and combining both would fight for the
    // same transform on every mousemove.
    document.querySelectorAll('.svc-card, .info-card, .hero-card, .contact-card').forEach((el) => {
      if (el.dataset.iwaBounceBound) return;
      el.dataset.iwaBounceBound = '1';
      el.classList.add('iwa-bounce-card');
    });
  }

  // Slide-up-from-below transition, staggered section by section when a page
  // loads, and a simple fade+drop when leaving via an internal link.
  function initPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const STYLE_ID = 'iwa-page-transition-styles';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
        '.iwa-pt-section{opacity:0;transform:translateY(46px);}',
        '.iwa-pt-section-active{opacity:1;transform:translateY(0);transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1);}',
        '.iwa-pt-leave-active{opacity:0;transform:translateY(28px);transition:opacity .28s ease,transform .28s ease;}'
      ].join('');
      document.head.appendChild(style);
    }
    const target = document.querySelector('main') || document.body;
    const sections = Array.from(target.children).filter((el) => el.nodeType === 1);
    const revealList = sections.length ? sections : [target];
    revealList.forEach((el) => el.classList.add('iwa-pt-section'));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealList.forEach((el, index) => {
          window.setTimeout(() => { el.classList.add('iwa-pt-section-active'); }, index * 110);
        });
      });
    });
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const href = link.getAttribute('href');
      if (!href || href.indexOf('#') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;
      let url;
      try { url = new URL(href, window.location.href); } catch (e) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      event.preventDefault();
      target.classList.add('iwa-pt-leave-active');
      window.setTimeout(() => { window.location.href = url.href; }, 240);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCards('serviceGrid', services);
    renderCards('trainingGrid', training);
    initNavigation();
    initEffects();
    initHeroShowcase();
    initLineQrModal();
    initMagneticButtons();
    initStatCounters();
    initHoverBounce();
    initPageTransitions();
    dismissLoader();
  });
}());