/* OHHH™ — reveals, motion preferences, autoplay fallback */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* — scroll reveals, staggered per group — */
  var targets = document.querySelectorAll('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    targets.forEach(function (el, i) {
      var siblings = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--delay', (siblings % 5) * 0.09 + 's');
      void i;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* — background reel — */
  var video = document.querySelector('.hero__video');

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
})();
