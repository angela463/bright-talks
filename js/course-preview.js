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

  function lessonTitle(lesson) {
    if (typeof lesson === 'string') return lesson;
    if (lesson && typeof lesson.title === 'string') return lesson.title;
    return '';
  }

  function lessonUnlocked(lesson) {
    return lesson && typeof lesson === 'object' && lesson.unlocked === true;
  }

  var LOCK_SVG =
    '<svg class="course-lesson-lock-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CHEVRON_SVG =
    '<svg class="course-acc-chevron course-lesson-chevron-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var PLAY_SVG =
    '<svg class="lesson-video-play-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10.25" fill="rgba(0,0,0,0.52)" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/><path d="M9.5 7.5v9L16.5 12 9.5 7.5z" fill="#fff"/></svg>';

  function renderLockedLesson(modIdx, lessonIdx, title) {
    var label = 'L' + (lessonIdx + 1);
    return (
      '<li class="course-lesson-item">' +
        '<button type="button" class="course-lesson-row course-lesson-row--locked" data-module-idx="' +
        modIdx +
        '" data-lesson-idx="' +
        lessonIdx +
        '" aria-label="' +
        escapeHtml(label + ': ' + title + ', locked') +
        '">' +
        '<span class="course-lesson-label">' +
        escapeHtml(label) +
        '</span>' +
        '<span class="course-lesson-title">' +
        escapeHtml(title) +
        '</span>' +
        '<span class="course-lesson-lock-wrap">' +
        LOCK_SVG +
        '<span class="course-lesson-locked-text">Locked</span>' +
        '</span>' +
        '</button>' +
        '</li>'
    );
  }

  function renderUnlockedLesson(modIdx, lessonIdx, lesson) {
    var title = lessonTitle(lesson);
    var label = 'L' + (lessonIdx + 1);
    var panelId = 'lesson-detail-m' + modIdx + '-l' + lessonIdx;
    var btnId = panelId + '-btn';
    var youtubeId = lesson.video && lesson.video.youtubeId ? String(lesson.video.youtubeId) : '';
    var poster = youtubeId
      ? 'https://img.youtube.com/vi/' + youtubeId + '/hqdefault.jpg'
      : '';
    var duration =
      lesson.durationMinutes != null ? '~' + lesson.durationMinutes + ' min' : '';
    var videoLabel = lesson.video && lesson.video.label ? lesson.video.label : title;
    var bulletsHtml = '';
    if (lesson.bullets && lesson.bullets.length) {
      bulletsHtml =
        '<ul class="lesson-detail-bullets">' +
        lesson.bullets
          .map(function (b) {
            return '<li>' + escapeHtml(b) + '</li>';
          })
          .join('') +
        '</ul>';
    }

    return (
      '<li class="course-lesson-item course-lesson-item--unlocked">' +
        '<div class="course-lesson-expandable">' +
        '<button type="button" class="course-lesson-row course-lesson-row--unlocked" data-module-idx="' +
        modIdx +
        '" data-lesson-idx="' +
        lessonIdx +
        '" aria-expanded="false" aria-controls="' +
        panelId +
        '" id="' +
        btnId +
        '">' +
        '<span class="course-lesson-label">' +
        escapeHtml(label) +
        '</span>' +
        '<span class="course-lesson-title-wrap">' +
        '<span class="course-lesson-title">' +
        escapeHtml(title) +
        '</span>' +
        (duration
          ? '<span class="course-lesson-duration">' + escapeHtml(duration) + '</span>'
          : '') +
        '</span>' +
        '<span class="course-lesson-chevron" aria-hidden="true">' +
        CHEVRON_SVG +
        '</span>' +
        '</button>' +
        '<div class="course-lesson-detail" id="' +
        panelId +
        '" hidden role="region" aria-labelledby="' +
        btnId +
        '">' +
        '<div class="lesson-video-card">' +
        '<div class="lesson-video-poster" ' +
        (poster ? 'style="background-image:url(\'' + escapeHtml(poster) + '\')"' : '') +
        '>' +
        '<button type="button" class="lesson-video-play" data-youtube-id="' +
        escapeHtml(youtubeId) +
        '" aria-label="Play video: ' +
        escapeHtml(videoLabel) +
        '">' +
        PLAY_SVG +
        '</button>' +
        '</div>' +
        '<div class="lesson-video-frame" hidden>' +
        '<iframe class="lesson-video-iframe" title="' +
        escapeHtml(videoLabel) +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>' +
        '</div>' +
        '</div>' +
        (lesson.summary
          ? '<p class="lesson-detail-summary">' + escapeHtml(lesson.summary) + '</p>'
          : '') +
        bulletsHtml +
        '</div>' +
        '</div>' +
        '</li>'
    );
  }

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
        var lesson = lessons[j];
        if (lessonUnlocked(lesson)) {
          lessonRows.push(renderUnlockedLesson(i, j, lesson));
        } else {
          lessonRows.push(renderLockedLesson(i, j, lessonTitle(lesson)));
        }
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

  function initUnlockedLessonInteractions(root) {
    root.addEventListener('click', function (e) {
      var playBtn = e.target.closest('.lesson-video-play');
      if (playBtn) {
        e.preventDefault();
        e.stopPropagation();
        var id = playBtn.getAttribute('data-youtube-id');
        if (!id) return;
        var card = playBtn.closest('.lesson-video-card');
        if (!card) return;
        var frameWrap = card.querySelector('.lesson-video-frame');
        var iframe = card.querySelector('.lesson-video-iframe');
        var poster = card.querySelector('.lesson-video-poster');
        if (iframe && frameWrap) {
          iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
          frameWrap.removeAttribute('hidden');
          if (poster) poster.setAttribute('hidden', '');
        }
        return;
      }

      var toggle = e.target.closest('.course-lesson-row--unlocked');
      if (!toggle) return;
      e.preventDefault();
      var panelId = toggle.getAttribute('aria-controls');
      var panel = panelId && document.getElementById(panelId);
      if (!panel) return;
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      var item = toggle.closest('.course-lesson-item');
      if (isOpen) {
        toggle.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
        if (item) item.classList.remove('is-open');
      } else {
        toggle.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
        if (item) item.classList.add('is-open');
      }
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
        nameEl.textContent = lessonTitle(m.lessons[lessonIdx]);
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
      var row = e.target.closest('.course-lesson-row--locked');
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
    initUnlockedLessonInteractions(root);
    initLessonModal(modules);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
