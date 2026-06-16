(function () {
  'use strict';

  var ACCOUNTS_KEY = 'bright_talks_test_accounts';
  var SESSION_KEY = 'bright_talks_session';
  var modal = null;

  function getAccounts() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.slice(0, 20)));
  }

  function setSession(email, name) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email: email,
      name: name || '',
      signedInAt: new Date().toISOString()
    }));
  }

  function buildModal() {
    if (document.getElementById('auth-modal')) return;

    var root = document.createElement('div');
    root.id = 'auth-modal';
    root.className = 'auth-modal';
    root.setAttribute('hidden', '');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'auth-modal-title');

    root.innerHTML =
      '<div class="auth-modal__backdrop" data-auth-close></div>' +
      '<div class="auth-modal__panel">' +
      '  <button type="button" class="auth-modal__close" data-auth-close aria-label="Close">&times;</button>' +
      '  <h2 id="auth-modal-title" class="auth-modal__title">Welcome back</h2>' +
      '  <p class="auth-modal__subtitle">Sign in to your Bright Talks account or create a new one.</p>' +
      '  <div class="auth-modal__tabs" role="tablist">' +
      '    <button type="button" class="auth-modal__tab is-active" role="tab" aria-selected="true" data-auth-tab="sign-in">Sign In</button>' +
      '    <button type="button" class="auth-modal__tab" role="tab" aria-selected="false" data-auth-tab="create">Create Account</button>' +
      '  </div>' +
      '  <div class="auth-modal__pane" data-auth-pane="sign-in">' +
      '    <form id="auth-sign-in-form">' +
      '      <div class="auth-modal__field">' +
      '        <label for="auth-sign-in-email">Email</label>' +
      '        <input id="auth-sign-in-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />' +
      '      </div>' +
      '      <div class="auth-modal__field">' +
      '        <label for="auth-sign-in-password">Password</label>' +
      '        <input id="auth-sign-in-password" name="password" type="password" autocomplete="current-password" placeholder="Your password" required minlength="6" />' +
      '      </div>' +
      '      <button type="submit" class="auth-modal__submit">Sign In</button>' +
      '      <p id="auth-sign-in-status" class="auth-modal__status" role="status" aria-live="polite"></p>' +
      '    </form>' +
      '  </div>' +
      '  <div class="auth-modal__pane" data-auth-pane="create" hidden>' +
      '    <form id="auth-create-form">' +
      '      <div class="auth-modal__grid">' +
      '        <div class="auth-modal__field">' +
      '          <label for="auth-create-first">First name</label>' +
      '          <input id="auth-create-first" name="firstName" autocomplete="given-name" required />' +
      '        </div>' +
      '        <div class="auth-modal__field">' +
      '          <label for="auth-create-last">Last name</label>' +
      '          <input id="auth-create-last" name="lastName" autocomplete="family-name" required />' +
      '        </div>' +
      '      </div>' +
      '      <div class="auth-modal__field">' +
      '        <label for="auth-create-email">Email</label>' +
      '        <input id="auth-create-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />' +
      '      </div>' +
      '      <div class="auth-modal__field">' +
      '        <label for="auth-create-password">Password</label>' +
      '        <input id="auth-create-password" name="password" type="password" autocomplete="new-password" placeholder="At least 6 characters" required minlength="6" />' +
      '      </div>' +
      '      <button type="submit" class="auth-modal__submit">Create Account</button>' +
      '      <p id="auth-create-status" class="auth-modal__status" role="status" aria-live="polite"></p>' +
      '    </form>' +
      '    <p class="auth-modal__footer">Need full membership checkout? <a href="free-course-signup.html">Go to checkout</a></p>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(root);
    modal = root;
    bindModalEvents();
  }

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message || '';
    el.className = 'auth-modal__status' + (type ? ' is-' + type : '');
  }

  function switchTab(tabName) {
    if (!modal) return;
    var isSignIn = tabName === 'sign-in';
    modal.querySelectorAll('[data-auth-tab]').forEach(function (btn) {
      var active = btn.getAttribute('data-auth-tab') === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    modal.querySelector('[data-auth-pane="sign-in"]').hidden = !isSignIn;
    modal.querySelector('[data-auth-pane="create"]').hidden = isSignIn;
    modal.querySelector('.auth-modal__title').textContent = isSignIn ? 'Welcome back' : 'Create your account';
    modal.querySelector('.auth-modal__subtitle').textContent = isSignIn
      ? 'Sign in with the email you used at checkout.'
      : 'Set up a Bright Talks account to access your courses.';
  }

  function openModal(tab) {
    buildModal();
    switchTab(tab || 'sign-in');
    setStatus(document.getElementById('auth-sign-in-status'), '');
    setStatus(document.getElementById('auth-create-status'), '');
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    var focusTarget = tab === 'create'
      ? document.getElementById('auth-create-first')
      : document.getElementById('auth-sign-in-email');
    if (focusTarget) focusTarget.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function bindModalEvents() {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-auth-close]')) closeModal();
    });

    modal.querySelectorAll('[data-auth-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(btn.getAttribute('data-auth-tab'));
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeModal();
    });

    var signInForm = document.getElementById('auth-sign-in-form');
    var createForm = document.getElementById('auth-create-form');

    if (signInForm) {
      signInForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var statusEl = document.getElementById('auth-sign-in-status');
        var email = document.getElementById('auth-sign-in-email').value.trim().toLowerCase();
        var password = document.getElementById('auth-sign-in-password').value;

        if (!email || password.length < 6) {
          setStatus(statusEl, 'Enter a valid email and password (6+ characters).', 'err');
          return;
        }

        var accounts = getAccounts();
        var match = accounts.find(function (a) {
          return String(a.email || '').toLowerCase() === email;
        });

        if (match) {
          setSession(email, match.cardName || match.name || '');
          setStatus(statusEl, 'Signed in as ' + email + '.', 'ok');
          setTimeout(closeModal, 700);
          return;
        }

        setSession(email, '');
        setStatus(statusEl, 'Signed in as ' + email + ' (demo account).', 'ok');
        setTimeout(closeModal, 700);
      });
    }

    if (createForm) {
      createForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var statusEl = document.getElementById('auth-create-status');
        var first = document.getElementById('auth-create-first').value.trim();
        var last = document.getElementById('auth-create-last').value.trim();
        var email = document.getElementById('auth-create-email').value.trim().toLowerCase();
        var password = document.getElementById('auth-create-password').value;
        var fullName = (first + ' ' + last).trim();

        if (!first || !last || !email || password.length < 6) {
          setStatus(statusEl, 'Complete all fields. Password must be at least 6 characters.', 'err');
          return;
        }

        var accounts = getAccounts();
        if (accounts.some(function (a) { return String(a.email || '').toLowerCase() === email; })) {
          setStatus(statusEl, 'An account with this email already exists. Try signing in.', 'err');
          return;
        }

        accounts.unshift({
          id: 'bt_user_' + Date.now(),
          createdAt: new Date().toISOString(),
          email: email,
          name: fullName,
          cardName: fullName,
          status: 'active'
        });
        saveAccounts(accounts);
        setSession(email, fullName);
        setStatus(statusEl, 'Account created! Welcome, ' + first + '.', 'ok');
        createForm.reset();
        setTimeout(closeModal, 900);
      });
    }
  }

  function createSignInButton(className) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className || 'btn btn-secondary header-sign-in';
    btn.setAttribute('data-auth-open', 'sign-in');
    btn.textContent = 'Sign In';
    return btn;
  }

  function injectHeaderButtons() {
    document.querySelectorAll('.site-header .header-inner').forEach(function (header) {
      if (header.querySelector('[data-auth-open]')) return;

      var libraryActions = header.querySelector('.bt-library-header__actions');
      if (libraryActions) {
        libraryActions.insertBefore(
          createSignInButton('btn btn-secondary bt-library-sign-in'),
          libraryActions.firstChild
        );
        return;
      }

      var coursesBtn = header.querySelector(':scope > a.btn-primary');
      if (!coursesBtn) {
        coursesBtn = header.querySelector('.header-actions a.btn-primary');
      }

      if (coursesBtn && !coursesBtn.closest('.header-actions')) {
        var actions = document.createElement('div');
        actions.className = 'header-actions';
        coursesBtn.parentNode.insertBefore(actions, coursesBtn);
        actions.appendChild(createSignInButton());
        actions.appendChild(coursesBtn);
        return;
      }

      if (header.querySelector('.nav')) {
        var actionsOnly = document.createElement('div');
        actionsOnly.className = 'header-actions';
        actionsOnly.appendChild(createSignInButton());
        header.appendChild(actionsOnly);
      }
    });

    var signupNav = document.querySelector('.signup-nav');
    if (signupNav && !signupNav.querySelector('[data-auth-open]')) {
      signupNav.insertBefore(createSignInButton('header-sign-in-link'), signupNav.firstChild);
    }

    var playerBrand = document.querySelector('.player-v2-sidebar__brand');
    if (playerBrand && !playerBrand.parentElement.querySelector('[data-auth-open]')) {
      playerBrand.insertAdjacentElement('afterend', createSignInButton('player-v2-sign-in-btn'));
    }
  }

  function bindTriggers() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-auth-open]');
      if (!trigger) return;
      e.preventDefault();
      openModal(trigger.getAttribute('data-auth-open') || 'sign-in');
    });
  }

  function initFromHash() {
    if (window.location.hash === '#sign-in') {
      openModal('sign-in');
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function init() {
    if (window.__btAuthModalReady) return;
    window.__btAuthModalReady = true;
    injectHeaderButtons();
    bindTriggers();
    initFromHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BrightTalksAuthModal = {
    open: openModal,
    close: closeModal
  };
})();
