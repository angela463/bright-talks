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
    document.querySelectorAll('.nav-trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        var panelId = this.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;
        document.querySelectorAll('.nav-panel').forEach(function (p) {
          p.hidden = true;
        });
        document.querySelectorAll('.nav-trigger').forEach(function (b) {
          b.setAttribute('aria-expanded', 'false');
        });
        if (!expanded && panel) {
          panel.hidden = false;
          this.setAttribute('aria-expanded', 'true');
        }
      });
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
        messageEl.textContent = 'Please agree to the privacy policy to join the waitlist.';
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

  // Tabs on Parent Resources page (Guide / Videos)
  function initParentResourceTabs() {
    if (!document.body.classList.contains('page-parent-resources')) return;
    var tabs = document.querySelectorAll('.parent-resources-tabs .pr-tab');
    var panels = document.querySelectorAll('.pr-panel');
    if (!tabs.length || !panels.length) return;

    var hash = window.location.hash;
    var initialTarget = hash === '#pr-panel-videos' ? 'videos' : 'guide';

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
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-target') === initialTarget) {
        defaultTab = tab;
      }
    });
    if (!defaultTab) defaultTab = tabs[0];
    if (defaultTab) defaultTab.click();
  }

  createOverlay();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initCookieBar();
      initNav();
      initWaitlistForm();
      initParentResourceMore();
      initParentResourceTabs();
    });
  } else {
    initCookieBar();
    initNav();
    initWaitlistForm();
    initParentResourceMore();
    initParentResourceTabs();
  }
})();
