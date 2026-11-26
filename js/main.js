/* TELLI — скрипты одностраничного сайта. Без библиотек. */

/* ===== НАСТРОЙКИ: заполнить, когда клиент пришлёт данные ===== */
var CONFIG = {
  // Номер WhatsApp менеджера, только цифры с кодом страны, например '77011234567'
  whatsapp: '77015753312',
  whatsappText: 'Здравствуйте! Пишу с сайта telli.kz',
  links: {
    kaspi: 'https://kaspi.kz/shop/search/?q=%3AallMerchants%3ATelli', // магазин TELLI на Kaspi.kz
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

  /* --- Режим «вкладки»: пункт меню показывает свой раздел на один экран, без прокрутки.
         Если в разделе несколько страниц (О TELLI, Кафе) — внизу переключатель страниц. --- */
  if (document.documentElement.getAttribute('data-layout') === 'tabs') {
    var main = document.querySelector('main');
    var sections = [].slice.call(main.children).filter(function (el) { return el.tagName === 'SECTION'; });
    var n = 0;
    sections.forEach(function (sec) {
      var eb = sec.querySelector('.eyebrow');
      if (eb) eb.setAttribute('data-n', String(++n).padStart(2, '0'));
    });
    var tabOf = function (sec) { return sec.getAttribute('data-tab') || sec.id; };
    var pageOf = function (sec) { return sec.getAttribute('data-page') || sec.id; };
    var navLinks = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));

    // переключатель страниц внутри вкладки
    var pager = document.createElement('div');
    pager.className = 'pager';
    main.insertBefore(pager, main.firstChild);

    var pagesOfTab = function (tab) {
      var seen = [];
      sections.forEach(function (sec) {
        if (tabOf(sec) === tab && seen.indexOf(pageOf(sec)) === -1) seen.push(pageOf(sec));
      });
      return seen;
    };
    var labelOf = function (page) {
      var sec = sections.filter(function (x) { return pageOf(x) === page && x.getAttribute('data-label'); })[0];
      return sec ? sec.getAttribute('data-label') : page;
    };

    var show = function (key, scroll) {
      // key может быть вкладкой (#about) или страницей (#home, #icecream)
      var sec = sections.filter(function (x) { return pageOf(x) === key || x.id === key; })[0] ||
                sections.filter(function (x) { return tabOf(x) === key; })[0] || sections[0];
      var tab = tabOf(sec);
      var pages = pagesOfTab(tab);
      var page = (pageOf(sec) === key || sec.id === key) ? pageOf(sec) : pages[0];
      sections.forEach(function (x) { x.hidden = pageOf(x) !== page; });
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + tab); });
      pager.innerHTML = '';
      pager.hidden = pages.length < 2;
      main.classList.toggle('has-pager', pages.length > 1);
      pages.forEach(function (pg) {
        var b = document.createElement('a');
        b.href = '#' + pg;
        b.className = 'pager__item' + (pg === page ? ' is-active' : '');
        b.textContent = labelOf(pg);
        pager.appendChild(b);
      });
      if (scroll !== false) window.scrollTo(0, 0);
    };

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      var sec = target && target.closest('main > section');
      if (!sec) return; // #footer и прочее — обычное поведение
      e.preventDefault();
      // ссылка из меню на вкладку открывает её первую страницу
      var key = a.closest('.nav') ? tabOf(sec) : pageOf(sec);
      if (location.hash !== '#' + key) history.pushState(null, '', '#' + key);
      show(key);
    });
    window.addEventListener('popstate', function () { show(location.hash.slice(1) || 'home'); });
    show(location.hash.slice(1) || 'home', false);
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
    slider.append(dots);

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

  /* --- Made in KZ: описание бренда переключает фото в арке --- */
  document.querySelectorAll('.kzbrand').forEach(function (b) {
    var track = document.querySelector('.slider--kz .slider__track');
    if (!track) return;
    var go = function () { track.scrollTo({ left: +b.dataset.slide * track.clientWidth, behavior: 'smooth' }); };
    b.addEventListener('mouseenter', go);
    b.addEventListener('click', function (e) { if (!e.target.closest('a')) go(); });
    track.addEventListener('scroll', function () {
      b.classList.toggle('is-active', Math.round(track.scrollLeft / track.clientWidth) === +b.dataset.slide);
    }, { passive: true });
  });
  var kzt = document.querySelector('.slider--kz .slider__track');
  if (kzt) kzt.dispatchEvent(new Event('scroll'));

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

  /* --- Каталог-витрина «орбита»: колесо, наведение на соседа, свайп, автопрокрутка --- */
  document.querySelectorAll('.showcase').forEach(function (sc) {
    var slides = [].slice.call(sc.querySelectorAll('.sc-slide')), items = sc.querySelectorAll('.sc-item');
    var ticks = sc.querySelectorAll('.sc-ticks span'), stage = sc.querySelector('.showcase__stage');
    var n = slides.length, cur = 0, timer = null, chg = null, lock = 0, hoverT = null, hovered = false;
    var delay = +sc.dataset.autoplay || 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var section = sc.closest('section');
    var visible = function () { return !section.hidden && !document.hidden; };
    var layout = function () {
      slides.forEach(function (s, k) {
        var d = k - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
        var ad = Math.abs(d);
        s.style.setProperty('--d', d); s.style.setProperty('--ad', Math.min(ad, 3));
        s.classList.toggle('is-active', d === 0);
        s.classList.toggle('is-far', ad > 2);
        if (ad <= 2) { var img = s.querySelector('img'); if (img) img.loading = 'eager'; }
      });
      [].forEach.call(items, function (it, k) { it.hidden = k !== cur; });
      [].forEach.call(ticks, function (t, k) { t.classList.toggle('is-active', k === cur); });
    };
    var go = function (i) {
      i = (i + n) % n; if (i === cur) return;
      sc.classList.add('is-changing'); clearTimeout(chg); chg = setTimeout(function () { sc.classList.remove('is-changing'); }, 450);
      cur = i; layout(); restart();
    };
    var restart = function () {
      clearTimeout(timer);
      if (delay && !hovered && !reduce) timer = setTimeout(function () { if (visible()) go(cur + 1); else restart(); }, delay);
    };
    // колесо / тачпад: один жест — один продукт
    stage.addEventListener('wheel', function (e) {
      var v = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(v) < 4) return;
      e.preventDefault();
      var now = Date.now(); if (now < lock) return; lock = now + 750;
      go(cur + (v > 0 ? 1 : -1));
    }, { passive: false });
    // наведение на соседний продукт выводит его в центр (после смены ждём, пока мышь сдвинется)
    var armX = null, armY = null;
    stage.addEventListener('mousemove', function (e) {
      if (armX !== null && Math.abs(e.clientX - armX) + Math.abs(e.clientY - armY) < 40) return;
      armX = null;
      var s = e.target.closest('.sc-slide'), k = s ? slides.indexOf(s) : -1;
      clearTimeout(hoverT);
      if (k < 0 || k === cur || s.classList.contains('is-far')) return;
      hoverT = setTimeout(function () { armX = e.clientX; armY = e.clientY; go(k); }, 260);
    });
    slides.forEach(function (s, k) {
      s.addEventListener('click', function (e) { clearTimeout(hoverT); armX = e.clientX; armY = e.clientY; go(k); });
    });
    stage.addEventListener('mouseenter', function () { hovered = true; restart(); });
    stage.addEventListener('mouseleave', function () { hovered = false; restart(); });
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    });
    document.addEventListener('keydown', function (e) {
      if (!visible()) return;
      if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'ArrowLeft') go(cur - 1);
    });
    layout(); restart();
  });

  /* --- Фото других разделов подгружаем в фоне после загрузки страницы,
         чтобы при переключении вкладок они были уже готовы --- */
  window.addEventListener('load', function () {
    var lazy = [].slice.call(document.querySelectorAll('img[loading="lazy"]'));
    var next = function () {
      var img = lazy.shift();
      if (!img) return;
      img.loading = 'eager';
      if (img.complete) next(); else { img.addEventListener('load', next); img.addEventListener('error', next); }
    };
    setTimeout(next, 300);
  });

  /* --- Год в подвале --- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
