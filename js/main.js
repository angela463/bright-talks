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
    bar.hidden = false;
    if (overlay) overlay.hidden = false;
  }

  function hideCookieBar() {
    var bar = document.getElementById('cookie-bar');
    if (bar) bar.hidden = true;
    var overlay = document.getElementById('cookie-overlay');
    if (overlay) overlay.hidden = true;
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
    if (acceptBtn) acceptBtn.addEventListener('click', acceptCookies);
    if (declineBtn) declineBtn.addEventListener('click', declineCookies);

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

  createOverlay();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initCookieBar();
      initNav();
      initWaitlistForm();
    });
  } else {
    initCookieBar();
    initNav();
    initWaitlistForm();
  }
})();
