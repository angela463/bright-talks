(function () {
  'use strict';

  var COOKIE_NAME = 'bright_talks_cookie_consent';
  var COOKIE_MAX_AGE_DAYS = 365;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
  }

  function showCookieBar() {
    var bar = document.getElementById('cookie-bar');
    if (!bar) return;
    var overlay = document.getElementById('cookie-overlay');
    bar.removeAttribute('hidden');
    bar.style.display = '';
    if (overlay) {
      overlay.removeAttribute('hidden');
      overlay.style.display = '';
    }
  }

  function hideCookieBar() {
    var bar = document.getElementById('cookie-bar');
    if (bar) {
      bar.setAttribute('hidden', '');
      bar.style.display = 'none';
    }
    var overlay = document.getElementById('cookie-overlay');
    if (overlay) {
      overlay.setAttribute('hidden', '');
      overlay.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  function acceptCookies() {
    setCookie(COOKIE_NAME, 'accept', COOKIE_MAX_AGE_DAYS);
    hideCookieBar();
  }

  function declineCookies() {
    setCookie(COOKIE_NAME, 'decline', COOKIE_MAX_AGE_DAYS);
    hideCookieBar();
  }

  function initCookieBar() {
    if (getCookie(COOKIE_NAME)) {
      return;
    }
    var bar = document.getElementById('cookie-bar');
    if (!bar) return;

    createOverlay();
    var overlay = document.getElementById('cookie-overlay');

    var acceptBtn = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function (e) {
        e.preventDefault();
        acceptCookies();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function (e) {
        e.preventDefault();
        declineCookies();
      });
    }

    showCookieBar();
  }

  // Only create the cookie overlay on pages that actually have a cookie bar (home page)
  function createOverlay() {
    var bar = document.getElementById('cookie-bar');
    if (!bar) return;
    var overlay = document.getElementById('cookie-overlay');
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'cookie-overlay';
    overlay.className = 'cookie-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    document.body.appendChild(overlay);
  }

  function initNav() {
    document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
      var btn = dd.querySelector('.nav-trigger');
      var panel = dd.querySelector('.nav-panel');
      if (!btn || !panel) return;

      function setOpen(open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      dd.addEventListener('mouseenter', function () {
        setOpen(true);
      });
      dd.addEventListener('mouseleave', function () {
        setOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var dd = document.activeElement && document.activeElement.closest('.nav-dropdown');
      if (dd && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    });
  }

  function initWaitlistForm() {
    var form = document.querySelector('.waitlist-form');
    var messageEl = document.getElementById('form-message');
    if (!form || !messageEl) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (form.querySelector('input[name="email"]') || {}).value;
      var privacyChecked = (form.querySelector('input[name="privacy"]') || {}).checked;
      if (!email) {
        messageEl.textContent = 'Please enter your email.';
        messageEl.className = 'form-note error';
        return;
      }
      if (!privacyChecked) {
        messageEl.textContent = 'Please agree to the privacy policy to join our courses.';
        messageEl.className = 'form-note error';
        return;
      }
      messageEl.textContent = 'Thank you! Your submission has been received.';
      messageEl.className = 'form-note success';
      form.reset();
    });
  }

  // Expand and collapse longer copy on the Parent Resources page
  function initParentResourceMore() {
    if (!document.body.classList.contains('page-parent-resources')) return;
    var toggles = document.querySelectorAll('.resource-more-toggle');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.resource-card');
        if (!card) return;
        var more = card.querySelector('.resource-card-more');
        if (!more) return;
        var isHidden = more.hasAttribute('hidden');
        if (isHidden) {
          more.removeAttribute('hidden');
          btn.textContent = 'Show less';
          btn.setAttribute('aria-expanded', 'true');
        } else {
          more.setAttribute('hidden', '');
          btn.textContent = 'Read more';
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Tabs on Parent Resources page (currently just Guide)
  function initParentResourceTabs() {
    if (!document.body.classList.contains('page-parent-resources')) return;
    var tabs = document.querySelectorAll('.parent-resources-tabs .pr-tab');
    var panels = document.querySelectorAll('.pr-panel');
    if (!tabs.length || !panels.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-target');

        tabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        panels.forEach(function (panel) {
          var panelId = panel.id || '';
          var isGuide = target === 'guide' && panelId === 'pr-panel-guide';
          var isVideos = target === 'videos' && panelId === 'pr-panel-videos';
          var show = isGuide || isVideos;
          panel.classList.toggle('pr-panel--hidden', !show);
        });
      });
    });

    var defaultTab = null;
    defaultTab = tabs[0];
    if (defaultTab) defaultTab.click();
  }

  /** Homepage value cards: single flipped card at a time; hover area is the article (grid cell). */
  function initValueFlipCards() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    var cards = document.querySelectorAll('.value-card--flip');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        cards.forEach(function (c) {
          c.classList.remove('is-flipped');
        });
        card.classList.add('is-flipped');
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-flipped');
      });
    });
  }

  createOverlay();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initCookieBar();
      initNav();
      initWaitlistForm();
      initParentResourceMore();
      initParentResourceTabs();
      initValueFlipCards();
    });
  } else {
    initCookieBar();
    initNav();
    initWaitlistForm();
    initParentResourceMore();
    initParentResourceTabs();
    initValueFlipCards();
  }
})();
