/* TELLI — скрипты одностраничного сайта. Без библиотек. */

/* ===== НАСТРОЙКИ: заполнить, когда клиент пришлёт данные ===== */
var CONFIG = {
  // Номер WhatsApp менеджера, только цифры с кодом страны, например '77011234567'
  whatsapp: '77015753312',
  whatsappText: 'Здравствуйте! Пишу с сайта telli.kz',
  links: {
    kaspi: 'https://l.kaspi.kz/shop/98tx2FT8QUjR7jj', // магазин TELLI на Kaspi.kz
    wb: 'https://global.wildberries.ru/catalog/krasota/tags/telli-kosmetika', // TELLI на Wildberries
    ozon: 'https://ozon.kz/brand/telli-101880001/', // TELLI на Ozon
    instagram: '',  // https://instagram.com/...
    arnica: '',     // меню / бронирование ARNICA
    tiktok: '',     // https://www.tiktok.com/@...
    facebook: ''    // https://www.facebook.com/...
  }
};

(function () {
  'use strict';

  /* --- WhatsApp-кнопки --- */
  if (CONFIG.whatsapp) {
    var waUrl = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.whatsappText);
    document.querySelectorAll('.js-wa').forEach(function (a) {
      a.href = waUrl;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* --- Внешние ссылки (Kaspi, Instagram, ARNICA) --- */
  document.querySelectorAll('[data-link]').forEach(function (a) {
    var url = CONFIG.links[a.getAttribute('data-link')];
    if (url) a.href = url;
  });

  /* --- Внешние кнопки без ссылки (href="#") прячем, чтобы не кидали наверх --- */
  document.querySelectorAll('a[target="_blank"][href="#"]').forEach(function (a) {
    a.hidden = true;
  });
  document.querySelectorAll('.market').forEach(function (m) {
    if (!m.querySelector('a:not([hidden])')) m.hidden = true;
  });
  /* карточки брендов без ссылки — просто не реагируют на клик */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* --- Режим «вкладки»: пункт меню показывает свой раздел, остальные прячутся --- */
  if (document.documentElement.getAttribute('data-layout') === 'tabs') {
    var main = document.querySelector('main');
    var sections = [].slice.call(main.children).filter(function (el) { return el.tagName === 'SECTION'; });
    // номера секций считаем один раз, пока все разделы на месте
    sections.forEach(function (sec, i) {
      var eb = sec.querySelector('.eyebrow');
      if (eb) eb.setAttribute('data-n', String(sections.filter(function (x, j) { return j <= i && x.querySelector('.eyebrow'); }).length).padStart(2, '0'));
    });
    var tabOf = function (sec) { return sec.getAttribute('data-tab') || sec.id; };
    var tabs = sections.map(tabOf);
    var navLinks = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var show = function (tab, scroll) {
      if (tabs.indexOf(tab) === -1) tab = 'about';
      sections.forEach(function (sec) { sec.hidden = tabOf(sec) !== tab; });
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + tab); });
      if (scroll !== false) window.scrollTo(0, 0);
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      var sec = target && target.closest('main > section');
      if (!sec) return; // #footer и прочее — обычная прокрутка
      e.preventDefault();
      var tab = tabOf(sec);
      if (location.hash !== '#' + tab) history.pushState(null, '', '#' + tab);
      show(tab);
    });
    window.addEventListener('popstate', function () { show(location.hash.slice(1)); });
    show(location.hash.slice(1), false);
  }

  /* --- Бургер-меню --- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* --- Слайдеры: CSS scroll-snap + стрелки, точки, автопрокрутка --- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.slider').forEach(function (slider) {
    var track = slider.querySelector('.slider__track');
    var slides = track ? track.children : [];
    var count = slides.length;
    if (count < 2) return;

    var arrow = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    var prev = document.createElement('button');
    prev.className = 'slider__btn slider__btn--prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Предыдущее фото');
    prev.innerHTML = arrow;
    var next = prev.cloneNode(true);
    next.className = 'slider__btn slider__btn--next';
    next.setAttribute('aria-label', 'Следующее фото');

    var dots = document.createElement('div');
    dots.className = 'slider__dots';
    for (var i = 0; i < count; i++) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'slider__dot';
      d.setAttribute('aria-label', 'Фото ' + (i + 1) + ' из ' + count);
      d.dataset.i = i;
      dots.appendChild(d);
    }
    slider.append(prev, next, dots);

    var current = 0;
    var index = function () { return Math.round(track.scrollLeft / track.clientWidth); };
    var go = function (i) {
      current = (i + count) % count;
      track.scrollTo({ left: current * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var paint = function () {
      current = index();
      [].forEach.call(dots.children, function (d, n) { d.classList.toggle('is-active', n === current); });
    };

    prev.addEventListener('click', function () { go(current - 1); restart(); });
    next.addEventListener('click', function () { go(current + 1); restart(); });
    dots.addEventListener('click', function (e) {
      var d = e.target.closest('.slider__dot');
      if (d) { go(+d.dataset.i); restart(); }
    });

    var raf;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    }, { passive: true });
    paint();

    /* автопрокрутка только для слайдеров с data-autoplay и только когда видны */
    var delay = +slider.dataset.autoplay;
    var timer = null, visible = false, hovered = false;
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (delay && visible && !hovered && !reduceMotion && !document.hidden) {
        timer = setInterval(function () { go(current + 1); }, delay);
      }
    }
    function restart() { start(); }
    if (delay && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        start();
      }, { threshold: 0.4 }).observe(slider);
      slider.addEventListener('mouseenter', function () { hovered = true; stop(); });
      slider.addEventListener('mouseleave', function () { hovered = false; start(); });
      track.addEventListener('touchstart', stop, { passive: true });
      document.addEventListener('visibilitychange', start);
    }
  });

  /* --- Плавающая кнопка WhatsApp: появляется после первого экрана --- */
  var waFloat = document.querySelector('.wa-float');
  if (waFloat) {
    var onScroll = function () { waFloat.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.6); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Мягкое всплытие блоков при прокрутке --- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var targets = document.querySelectorAll(
      '.section .eyebrow, .section .h2, .section .rule, .split__text > p, .slider, .product, .kz__card, .proc, .city, .store, .kzmap, .stat, .bignum, .market, .btns'
    );
    document.documentElement.classList.add('js-reveal');
    targets.forEach(function (el) {
      el.classList.add('reveal');
      var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
      if (el.matches('.product, .proc, .stat, .city, .store')) el.style.setProperty('--d', (sib % 5) * 0.08 + 's');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* --- Год в подвале --- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
