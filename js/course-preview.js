(function () {
  'use strict';

  var DESKTOP_MQ = '(min-width: 768px)';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var LOCK_SVG =
    '<svg class="course-lesson-lock-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CHEVRON_SVG =
    '<svg class="course-acc-chevron" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderModules(modules) {
    var parts = [];
    for (var i = 0; i < modules.length; i++) {
      var mod = modules[i];
      var num = i + 1;
      var panelId = 'course-acc-panel-' + i;
      var headingId = 'course-acc-heading-' + i;
      var lessons = mod.lessons || [];
      var lessonRows = [];
      for (var j = 0; j < lessons.length; j++) {
        var label = 'L' + (j + 1);
        lessonRows.push(
          '<li class="course-lesson-item">' +
            '<button type="button" class="course-lesson-row" data-module-idx="' +
            i +
            '" data-lesson-idx="' +
            j +
            '" aria-label="' +
            escapeHtml(label + ': ' + lessons[j] + ', locked') +
            '">' +
            '<span class="course-lesson-label">' +
            escapeHtml(label) +
            '</span>' +
            '<span class="course-lesson-title">' +
            escapeHtml(lessons[j]) +
            '</span>' +
            '<span class="course-lesson-lock-wrap">' +
            LOCK_SVG +
            '<span class="course-lesson-locked-text">Locked</span>' +
            '</span>' +
            '</button>' +
            '</li>'
        );
      }
      parts.push(
        '<div class="course-acc-item" data-acc-index="' +
          i +
          '">' +
          '<button type="button" class="course-acc-trigger" id="' +
          headingId +
          '" aria-expanded="false" aria-controls="' +
          panelId +
          '">' +
          '<span class="course-acc-badge" aria-hidden="true">' +
          num +
          '</span>' +
          '<span class="course-acc-heading-main">' +
          '<span class="course-acc-title">' +
          escapeHtml(mod.title) +
          '</span>' +
          '<span class="course-acc-meta">' +
          '<span class="course-acc-meta-item">' +
          lessons.length +
          ' lessons</span>' +
          '<span class="course-acc-meta-dot" aria-hidden="true">·</span>' +
          '<span class="course-acc-meta-item course-acc-meta-item--muted">Preview only</span>' +
          '</span>' +
          '</span>' +
          CHEVRON_SVG +
          '</button>' +
          '<div class="course-acc-panel" id="' +
          panelId +
          '" role="region" aria-labelledby="' +
          headingId +
          '" hidden>' +
          '<div class="course-acc-panel-inner">' +
          '<ol class="course-lesson-list">' +
          lessonRows.join('') +
          '</ol>' +
          '</div>' +
          '</div>' +
          '</div>'
      );
    }
    return parts.join('');
  }

  function setPanelOpen(item, open) {
    var btn = item.querySelector('.course-acc-trigger');
    var panel = item.querySelector('.course-acc-panel');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      panel.removeAttribute('hidden');
      item.classList.add('is-open');
    } else {
      panel.setAttribute('hidden', '');
      item.classList.remove('is-open');
    }
  }

  function closeAll(items) {
    for (var i = 0; i < items.length; i++) {
      setPanelOpen(items[i], false);
    }
  }

  function initAccordion(root, modules) {
    var items = root.querySelectorAll('.course-acc-item');
    var list = [];
    for (var i = 0; i < items.length; i++) list.push(items[i]);

    var desktop = window.matchMedia(DESKTOP_MQ).matches;
    if (desktop && list.length) {
      setPanelOpen(list[0], true);
    }

    list.forEach(function (item) {
      var btn = item.querySelector('.course-acc-trigger');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        if (isOpen) {
          setPanelOpen(item, false);
          return;
        }
        closeAll(list);
        setPanelOpen(item, true);
      });
    });

    window.addEventListener('resize', function () {
      var nowDesktop = window.matchMedia(DESKTOP_MQ).matches;
      if (nowDesktop && !desktop) {
        closeAll(list);
        if (list.length) setPanelOpen(list[0], true);
      }
      if (!nowDesktop && desktop) {
        closeAll(list);
      }
      desktop = nowDesktop;
    });
  }

  function initLessonModal(modules) {
    var modal = document.getElementById('lesson-locked-modal');
    if (!modal) return;

    var backdrop = modal.querySelector('.lesson-locked-modal__backdrop');
    var closeBtn = modal.querySelector('.lesson-locked-modal__close');
    var cta = modal.querySelector('.lesson-locked-modal__cta');

    function openModal(moduleIdx, lessonIdx) {
      var m = modules[moduleIdx];
      if (!m || !m.lessons || !m.lessons[lessonIdx]) return;
      var nameEl = modal.querySelector('.lesson-locked-modal__lesson-name');
      if (nameEl) {
        nameEl.textContent = m.lessons[lessonIdx];
      }
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      var nameEl = modal.querySelector('.lesson-locked-modal__lesson-name');
      if (nameEl) nameEl.textContent = '';
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var row = e.target.closest('.course-lesson-row');
      if (!row) return;
      e.preventDefault();
      var mi = parseInt(row.getAttribute('data-module-idx'), 10);
      var li = parseInt(row.getAttribute('data-lesson-idx'), 10);
      if (!isNaN(mi) && !isNaN(li)) openModal(mi, li);
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    if (cta) {
      cta.addEventListener('click', function () {
        closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closeModal();
      }
    });
  }

  function init() {
    var modules = window.BRIGHT_TALKS_COURSE_MODULES;
    var root = document.getElementById('course-library-root');
    if (!modules || !Array.isArray(modules) || !root) return;

    root.innerHTML = renderModules(modules);
    initAccordion(root, modules);
    initLessonModal(modules);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
