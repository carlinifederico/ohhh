/* OHHH™ — reveals, liquid page transition, gentle snap */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body    = document.body;
  var hero    = document.querySelector('.hero');
  var about   = document.getElementById('about');
  var disp    = document.getElementById('liquid-disp');
  var video   = document.querySelector('.hero__video');

  /* ── helpers ───────────────────────────────────────────── */

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* smoothstep: ease in and out of a range, so nothing starts or stops hard */
  function ss(a, b, x) {
    x = clamp((x - a) / (b - a), 0, 1);
    return x * x * (3 - 2 * x);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scrollY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  /* ── scroll reveals ────────────────────────────────────── */

  var targets = document.querySelectorAll('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    Array.prototype.forEach.call(targets, function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--delay', (i % 5) * 0.09 + 's');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ── the reel ──────────────────────────────────────────── */

  if (video) {
    if (reduced) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        // Some browsers block autoplay until the first interaction — retry then.
        play.catch(function () {
          var retry = function () {
            video.play().catch(function () {});
            window.removeEventListener('pointerdown', retry);
            window.removeEventListener('touchstart', retry);
          };
          window.addEventListener('pointerdown', retry, { once: true });
          window.addEventListener('touchstart', retry, { once: true });
        });
      }
    }
  }

  if (reduced || !hero || !about) return;

  /* ── liquid transition, driven by scroll position ──────── */

  var edge = 0;   // where the hero ends and the violet begins
  var vh   = 0;
  var morphing = false;

  function measure() {
    edge = about.offsetTop;
    vh   = window.innerHeight;
  }

  function paint() {
    var p = edge > 0 ? clamp(scrollY() / edge, 0, 1) : 0;
    var s = body.style;

    // leaving: drifts up a little faster than the scroll, softens, then goes
    s.setProperty('--exit-o',    1 - ss(0.02, 0.66, p));
    s.setProperty('--exit-blur', (7 * ss(0, 0.75, p)).toFixed(2) + 'px');
    s.setProperty('--exit-s',    (1 + 0.07 * p).toFixed(4));
    s.setProperty('--exit-y',    (-0.07 * vh * p).toFixed(1) + 'px');
    s.setProperty('--video-s',   (1 + 0.045 * p).toFixed(4));

    // arriving: comes up out of focus and settles
    s.setProperty('--enter-o',    ss(0.18, 0.92, p).toFixed(3));
    s.setProperty('--enter-blur', (8 * (1 - ss(0.2, 0.96, p))).toFixed(2) + 'px');
    s.setProperty('--enter-y',    (0.055 * vh * (1 - p)).toFixed(1) + 'px');

    // the warp peaks halfway across and is gone at both ends
    if (disp) disp.setAttribute('scale', (12 * Math.sin(Math.PI * p)).toFixed(2));

    var active = p > 0.001 && p < 0.999;
    if (active !== morphing) {
      morphing = active;
      body.classList.toggle('is-morphing', active);
    }
  }

  // the cue only joins the exit once its own intro has finished playing
  setTimeout(function () { body.classList.add('is-scrolled'); }, 2200);

  /* ── snap: only across the seam, never inside a section ── */

  var snapping = false;
  var snapRaf  = null;
  var idleTimer = null;

  function stopSnap() {
    snapping = false;
    if (snapRaf) { cancelAnimationFrame(snapRaf); snapRaf = null; }
  }

  function snapTo(target) {
    var from = scrollY();
    var dist = target - from;
    if (Math.abs(dist) < 2) return;

    // longer trips get a little more time, but never enough to feel slow
    var dur   = 420 + 420 * Math.min(1, Math.abs(dist) / (edge || 1));
    var start = null;
    snapping  = true;

    (function step(now) {
      if (!snapping) return;
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / dur);
      window.scrollTo(0, Math.round(from + dist * easeInOutCubic(t)));
      if (t < 1) { snapRaf = requestAnimationFrame(step); }
      else { snapping = false; snapRaf = null; }
    })(performance.now());
  }

  function maybeSnap() {
    if (snapping || edge <= 0) return;
    var y = scrollY();
    // hands off unless we are parked mid-seam
    if (y <= 0 || y >= edge) return;
    snapTo(y < edge / 2 ? 0 : edge);
  }

  /* ── wiring ────────────────────────────────────────────── */

  var ticking = false;

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { ticking = false; paint(); });
    }
    if (snapping) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(maybeSnap, 130);
  }

  // any deliberate input wins over an in-flight snap
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (evt) {
    window.addEventListener(evt, stopSnap, { passive: true });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); paint(); });

  var cue = document.querySelector('.scroll');
  if (cue) {
    cue.addEventListener('click', function (e) {
      e.preventDefault();
      stopSnap();
      measure();
      snapTo(edge);
    });
  }

  measure();
  paint();
  window.addEventListener('load', function () { measure(); paint(); });
})();
