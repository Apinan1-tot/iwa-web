/* IWA RICH YOU D — lightweight motion for catalogue pages. */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const usableTargets = [
    'main > section:not(.catalog-page__hero)',
    '.catalog-page__content > *',
    '.product-long-content > section',
    '.product-detail-simple',
    '.vantage-summary',
    '.vantage-detail-image',
    '.demo-product-card',
    '.catalog-category-card',
    '.empty-product-state'
  ].join(',');

  function addScrollProgress() {
    const progress = document.createElement('div');
    progress.className = 'motion-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function addReveals() {
    const targets = Array.from(document.querySelectorAll(usableTargets))
      .filter((element, index, all) => all.indexOf(element) === index)
      .filter((element) => !element.closest('.catalog-page__hero'));
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-visible');
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    targets.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--motion-delay', Math.min((index % 4) * 70, 210) + 'ms');
      observer.observe(element);
    });
  }

  function addTactileCards() {
    document.querySelectorAll('.demo-product-card, .catalog-category-card, .preschool-lesson-gallery figure, .skill-list article').forEach((card) => {
      card.classList.add('motion-card');
    });
  }

  function addLinkFeedback() {
    document.querySelectorAll('a, button').forEach((element) => {
      if (!element.closest('.catalog-page__header, main, footer')) return;
      element.classList.add('motion-press');
    });
  }

  // Playful bounce/wiggle animation for product cards and key action buttons/links.
  function initHoverBounce() {
    if (reducedMotion) return;
    const STYLE_ID = 'iwa-bounce-styles';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
        '@keyframes iwaCardBounce{0%,100%{transform:scale(1) rotate(0deg);}30%{transform:scale(1.02) rotate(-.6deg);}55%{transform:scale(.992) rotate(.6deg);}75%{transform:scale(1.006) rotate(-.2deg);}}',
        '@keyframes iwaBtnBounce{0%,100%{transform:scale(1) rotate(0deg);}25%{transform:scale(1.035) rotate(-1.3deg);}50%{transform:scale(.98) rotate(1.3deg);}75%{transform:scale(1.015) rotate(-.6deg);}}',
        '.iwa-bounce-card{transform-origin:center;}',
        '.iwa-bounce-card:hover,.iwa-bounce-card:focus-visible{animation:iwaCardBounce .55s ease;}',
        '.iwa-bounce-btn{display:inline-flex;transform-origin:center;}',
        '.iwa-bounce-btn:hover,.iwa-bounce-btn:focus-visible{animation:iwaBtnBounce .5s ease;}'
      ].join('');
      document.head.appendChild(style);
    }
    function attach(selector, className) {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.dataset.iwaBounceBound) return;
        el.dataset.iwaBounceBound = '1';
        el.classList.add(className);
      });
    }
    attach('.demo-product-card, .catalog-category-card, .preschool-lesson-gallery figure, .skill-list article', 'iwa-bounce-card');
    attach('.demo-detail-action, .product-more-link, .catalog-page__contact, .catalog-all-link, .aiboard-contact a', 'iwa-bounce-btn');
  }

  // Slide-up-from-below transition, staggered section by section when a page
  // loads, and a simple fade+drop when leaving via an internal link.
  function initPageTransitions() {
    if (reducedMotion) return;
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

  function start() {
    if (reducedMotion) return;
    root.classList.add('motion-ready');
    initPageTransitions();
    addScrollProgress();
    addReveals();
    addTactileCards();
    initHoverBounce();
    addLinkFeedback();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}());