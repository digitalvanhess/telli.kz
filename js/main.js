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

  /* --- Год в подвале --- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
