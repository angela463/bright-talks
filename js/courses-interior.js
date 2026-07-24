/* courses-interior.js — alternate Thinkific-style course interior */
(function () {
  'use strict';

  var COMPLETE_KEY = 'brightTalksInteriorCompletedV1';
  var DEFAULT_COURSE = 'bt-foundations-early-years';

  var el = {
    courseTitle: document.getElementById('ci-course-title'),
    progressLabel: document.getElementById('ci-progress-label'),
    progressFill: document.getElementById('ci-progress-fill'),
    progressTrack: document.querySelector('.ci-progress__track'),
    sidebarMeta: document.getElementById('ci-sidebar-meta'),
    curriculum: document.getElementById('ci-curriculum'),
    sidebar: document.getElementById('ci-sidebar'),
    sidebarToggle: document.getElementById('ci-sidebar-toggle'),
    overlay: document.getElementById('ci-overlay'),
    moduleLabel: document.getElementById('ci-module-label'),
    lessonTitle: document.getElementById('ci-lesson-title'),
    lessonSummary: document.getElementById('ci-lesson-summary'),
    lessonType: document.getElementById('ci-lesson-type'),
    lessonBody: document.getElementById('ci-lesson-body'),
    embed: document.getElementById('ci-embed'),
    video: document.getElementById('ci-video'),
    image: document.getElementById('ci-image'),
    mediaFallback: document.getElementById('ci-media-fallback'),
    mediaFallbackTitle: document.getElementById('ci-media-fallback-title'),
    mediaFallbackLink: document.getElementById('ci-media-fallback-link'),
    prev: document.getElementById('ci-prev'),
    next: document.getElementById('ci-next'),
    complete: document.getElementById('ci-complete'),
    completeLabel: document.getElementById('ci-complete-label')
  };

  var state = {
    course: null,
    flat: [],
    moduleIndex: 0,
    lessonIndex: 0,
    completed: {}
  };

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getQueryNumber(key, fallback) {
    var raw = CourseExperienceCommon.getQueryParam(key);
    var n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
  }

  function loadCompleted(courseId) {
    try {
      var raw = localStorage.getItem(COMPLETE_KEY);
      var map = raw ? JSON.parse(raw) : {};
      var list = Array.isArray(map[courseId]) ? map[courseId] : [];
      var out = {};
      list.forEach(function (id) {
        out[id] = true;
      });
      return out;
    } catch (err) {
      return {};
    }
  }

  function saveCompleted() {
    try {
      var raw = localStorage.getItem(COMPLETE_KEY);
      var map = raw ? JSON.parse(raw) : {};
      map[state.course.id] = Object.keys(state.completed).filter(function (id) {
        return state.completed[id];
      });
      localStorage.setItem(COMPLETE_KEY, JSON.stringify(map));
    } catch (err) {
      /* no-op */
    }
  }

  function flattenCourse(course) {
    var items = [];
    (course.modules || []).forEach(function (module, mIndex) {
      (module.lessons || []).forEach(function (lesson, lIndex) {
        items.push({
          module: module,
          lesson: lesson,
          moduleIndex: mIndex,
          lessonIndex: lIndex
        });
      });
    });
    return items;
  }

  function currentItem() {
    for (var i = 0; i < state.flat.length; i++) {
      var item = state.flat[i];
      if (item.moduleIndex === state.moduleIndex && item.lessonIndex === state.lessonIndex) {
        return item;
      }
    }
    return state.flat[0] || null;
  }

  function currentFlatIndex() {
    for (var i = 0; i < state.flat.length; i++) {
      var item = state.flat[i];
      if (item.moduleIndex === state.moduleIndex && item.lessonIndex === state.lessonIndex) {
        return i;
      }
    }
    return 0;
  }

  function isLessonLocked(lesson) {
    return lesson && (lesson.availability === 'soon' || lesson.availability === 'coming-soon');
  }

  function playerHref(moduleIndex, lessonIndex) {
    return (
      'course-player-v2.html?course=' +
      encodeURIComponent(state.course.id) +
      '&module=' +
      moduleIndex +
      '&lesson=' +
      lessonIndex
    );
  }

  function updateUrl() {
    var url = new URL(window.location.href);
    url.searchParams.set('course', state.course.id);
    url.searchParams.set('module', String(state.moduleIndex));
    url.searchParams.set('lesson', String(state.lessonIndex));
    window.history.replaceState({}, '', url.toString());
  }

  function completedCount() {
    return state.flat.filter(function (item) {
      return state.completed[item.lesson.id];
    }).length;
  }

  function updateProgress() {
    var total = state.flat.length || 1;
    var done = completedCount();
    var pct = Math.round((done / total) * 100);
    if (el.progressLabel) el.progressLabel.textContent = pct + '%';
    if (el.progressFill) el.progressFill.style.width = pct + '%';
    if (el.progressTrack) el.progressTrack.setAttribute('aria-valuenow', String(pct));
    if (el.sidebarMeta) el.sidebarMeta.textContent = done + ' of ' + total + ' complete';
    if (window.CourseExperienceCommon && CourseExperienceCommon.setCourseProgress) {
      CourseExperienceCommon.setCourseProgress(state.course.id, pct);
    }
  }

  function hideMedia() {
    if (el.embed) {
      el.embed.hidden = true;
      el.embed.removeAttribute('src');
    }
    if (el.video) {
      el.video.pause();
      el.video.removeAttribute('src');
      el.video.hidden = true;
      el.video.load();
    }
    if (el.image) {
      el.image.hidden = true;
      el.image.removeAttribute('src');
    }
    if (el.mediaFallback) el.mediaFallback.hidden = true;
  }

  function showFallback(title, moduleIndex, lessonIndex) {
    if (!el.mediaFallback) return;
    el.mediaFallback.hidden = false;
    if (el.mediaFallbackTitle) el.mediaFallbackTitle.textContent = title || 'Lesson media';
    if (el.mediaFallbackLink) el.mediaFallbackLink.href = playerHref(moduleIndex, lessonIndex);
  }

  function renderMedia(item) {
    hideMedia();
    var lesson = item.lesson;
    var hero = lesson.heroVisual || {};
    var title = lesson.title;

    if (hero.type === 'embed' && hero.src) {
      el.embed.hidden = false;
      el.embed.src = hero.src;
      return;
    }

    if (hero.type === 'video' && hero.src) {
      el.video.hidden = false;
      el.video.src = hero.src;
      return;
    }

    if (hero.type === 'image' && hero.src) {
      el.image.hidden = false;
      el.image.src = hero.src;
      el.image.alt = hero.alt || title;
      return;
    }

    if (hero.type === 'promo') {
      showFallback(title, item.moduleIndex, item.lessonIndex);
      if (el.lessonType) el.lessonType.textContent = 'Welcome video';
      return;
    }

    showFallback(title, item.moduleIndex, item.lessonIndex);
  }

  function renderSection(section) {
    if (!section) return '';
    var html = '<section class="ci-section">';
    html += '<h3 class="ci-section__title">' + esc(section.title || 'Section') + '</h3>';

    if (section.type === 'objectives' || (section.bullets && section.bullets.length)) {
      html += '<ul>';
      (section.bullets || []).forEach(function (bullet) {
        html += '<li>' + esc(bullet) + '</li>';
      });
      html += '</ul>';
    }

    if (section.paragraphs && section.paragraphs.length) {
      section.paragraphs.forEach(function (p) {
        html += '<p>' + esc(p) + '</p>';
      });
    }

    if (section.type === 'scripts' || (section.scripts && section.scripts.length)) {
      html += '<ul class="ci-scripts">';
      (section.scripts || []).forEach(function (line) {
        html += '<li>' + esc(line) + '</li>';
      });
      html += '</ul>';
    }

    if (section.type === 'downloads' || (section.downloads && section.downloads.length)) {
      html += '<ul class="ci-downloads">';
      (section.downloads || []).forEach(function (file) {
        html +=
          '<li><a class="ci-download" href="' +
          esc(file.href || '#') +
          '">' +
          '<span class="ci-download__label">' +
          esc(file.label || 'Download') +
          '</span>' +
          (file.description
            ? '<span class="ci-download__desc">' + esc(file.description) + '</span>'
            : '') +
          '</a></li>';
      });
      html += '</ul>';
    }

    if (section.reflectionLead) {
      html += '<p>' + esc(section.reflectionLead) + '</p>';
    }

    html += '</section>';
    return html;
  }

  function renderBody(lesson) {
    if (!el.lessonBody) return;
    var sections = lesson.sections || [];
    if (!sections.length && lesson.readScript && lesson.readScript.length) {
      sections = lesson.readScript.map(function (block) {
        return {
          title: block.title,
          paragraphs: block.paragraphs
        };
      });
    }
    if (!sections.length) {
      el.lessonBody.innerHTML =
        '<section class="ci-section"><p>' +
        esc(lesson.summary || 'Lesson notes will appear here.') +
        '</p></section>';
      return;
    }
    el.lessonBody.innerHTML = sections.map(renderSection).join('');
  }

  function renderCurriculum() {
    if (!el.curriculum || !state.course) return;
    var html = '';
    (state.course.modules || []).forEach(function (module, mIndex) {
      var open = mIndex === state.moduleIndex ? ' is-open' : '';
      html += '<div class="ci-chapter' + open + '" data-module="' + mIndex + '">';
      html +=
        '<button type="button" class="ci-chapter__toggle" data-toggle-module="' +
        mIndex +
        '" aria-expanded="' +
        (mIndex === state.moduleIndex ? 'true' : 'false') +
        '">' +
        '<span><span class="ci-chapter__label">Chapter ' +
        (mIndex + 1) +
        '</span><span class="ci-chapter__title">' +
        esc(module.title) +
        '</span></span>' +
        '<svg class="ci-chapter__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
        '</button>';
      html += '<ul class="ci-chapter__lessons">';
      (module.lessons || []).forEach(function (lesson, lIndex) {
        var active =
          mIndex === state.moduleIndex && lIndex === state.lessonIndex ? ' is-active' : '';
        var complete = state.completed[lesson.id] ? ' is-complete' : '';
        var locked = isLessonLocked(lesson) ? ' is-locked' : '';
        html +=
          '<li><button type="button" class="ci-lesson-link' +
          active +
          complete +
          locked +
          '" data-module="' +
          mIndex +
          '" data-lesson="' +
          lIndex +
          '"' +
          (locked ? ' disabled' : '') +
          '>' +
          '<span class="ci-lesson-link__check" aria-hidden="true">✓</span>' +
          '<span><span class="ci-lesson-link__title">' +
          esc(lesson.title) +
          '</span><span class="ci-lesson-link__meta">' +
          esc(lesson.duration || 'Lesson') +
          (locked ? ' · Coming soon' : '') +
          '</span></span>' +
          '</button></li>';
      });
      html += '</ul></div>';
    });
    el.curriculum.innerHTML = html;
  }

  function updateNavButtons() {
    var index = currentFlatIndex();
    if (el.prev) el.prev.disabled = index <= 0;
    if (el.next) el.next.disabled = index >= state.flat.length - 1;
    var item = currentItem();
    var done = !!(item && state.completed[item.lesson.id]);
    if (el.complete) {
      el.complete.classList.toggle('is-complete', done);
      el.complete.disabled = !!(item && isLessonLocked(item.lesson));
    }
    if (el.completeLabel) {
      if (done && index >= state.flat.length - 1) el.completeLabel.textContent = 'Completed';
      else if (done) el.completeLabel.textContent = 'Continue';
      else el.completeLabel.textContent = 'Complete and continue';
    }
  }

  function renderLesson() {
    var item = currentItem();
    if (!item) return;
    var lesson = item.lesson;
    var module = item.module;

    if (el.moduleLabel) el.moduleLabel.textContent = module.title || 'Course';
    if (el.lessonTitle) el.lessonTitle.textContent = lesson.title || '';
    if (el.lessonSummary) el.lessonSummary.textContent = lesson.summary || '';
    if (el.lessonType) {
      el.lessonType.textContent =
        lesson.heroVisual && lesson.heroVisual.type === 'promo'
          ? 'Welcome video'
          : lesson.heroVisual && lesson.heroVisual.type === 'embed'
            ? 'Video lesson'
            : 'Lesson';
    }

    renderMedia(item);
    renderBody(lesson);
    renderCurriculum();
    updateNavButtons();
    updateProgress();
    updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goTo(moduleIndex, lessonIndex) {
    var module = state.course.modules[moduleIndex];
    if (!module || !module.lessons || !module.lessons[lessonIndex]) return;
    if (isLessonLocked(module.lessons[lessonIndex])) return;
    state.moduleIndex = moduleIndex;
    state.lessonIndex = lessonIndex;
    renderLesson();
    closeMobileSidebar();
  }

  function goRelative(delta) {
    var next = currentFlatIndex() + delta;
    if (next < 0 || next >= state.flat.length) return;
    var item = state.flat[next];
    goTo(item.moduleIndex, item.lessonIndex);
  }

  function markCompleteAndContinue() {
    var item = currentItem();
    if (!item || isLessonLocked(item.lesson)) return;
    var already = !!state.completed[item.lesson.id];
    if (!already) {
      state.completed[item.lesson.id] = true;
      saveCompleted();
      updateProgress();
    }
    var index = currentFlatIndex();
    if (index < state.flat.length - 1) {
      var next = state.flat[index + 1];
      goTo(next.moduleIndex, next.lessonIndex);
    } else {
      renderCurriculum();
      updateNavButtons();
    }
  }

  function openMobileSidebar() {
    document.body.classList.add('is-sidebar-open');
    document.body.classList.remove('is-sidebar-collapsed');
    if (el.overlay) el.overlay.hidden = false;
    if (el.sidebarToggle) el.sidebarToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileSidebar() {
    document.body.classList.remove('is-sidebar-open');
    if (el.overlay) el.overlay.hidden = true;
    if (window.matchMedia('(max-width: 960px)').matches) {
      if (el.sidebarToggle) el.sidebarToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleSidebar() {
    if (window.matchMedia('(max-width: 960px)').matches) {
      if (document.body.classList.contains('is-sidebar-open')) closeMobileSidebar();
      else openMobileSidebar();
      return;
    }
    document.body.classList.toggle('is-sidebar-collapsed');
    var open = !document.body.classList.contains('is-sidebar-collapsed');
    if (el.sidebarToggle) el.sidebarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function bindEvents() {
    if (el.sidebarToggle) el.sidebarToggle.addEventListener('click', toggleSidebar);
    if (el.overlay) el.overlay.addEventListener('click', closeMobileSidebar);
    if (el.prev) el.prev.addEventListener('click', function () { goRelative(-1); });
    if (el.next) el.next.addEventListener('click', function () { goRelative(1); });
    if (el.complete) el.complete.addEventListener('click', markCompleteAndContinue);

    if (el.curriculum) {
      el.curriculum.addEventListener('click', function (event) {
        var toggle = event.target.closest('[data-toggle-module]');
        if (toggle) {
          var chapter = toggle.closest('.ci-chapter');
          if (!chapter) return;
          var willOpen = !chapter.classList.contains('is-open');
          chapter.classList.toggle('is-open', willOpen);
          toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
          return;
        }
        var lessonBtn = event.target.closest('.ci-lesson-link[data-module][data-lesson]');
        if (!lessonBtn || lessonBtn.disabled) return;
        goTo(Number(lessonBtn.getAttribute('data-module')), Number(lessonBtn.getAttribute('data-lesson')));
      });
    }

    window.addEventListener('resize', function () {
      if (!window.matchMedia('(max-width: 960px)').matches) {
        document.body.classList.remove('is-sidebar-open');
        if (el.overlay) el.overlay.hidden = true;
      }
    });
  }

  function init() {
    if (!window.CourseExperienceCommon) return;
    var courseId = CourseExperienceCommon.getQueryParam('course') || DEFAULT_COURSE;
    var course = CourseExperienceCommon.getCourseById(courseId) || CourseExperienceCommon.getCourseById(DEFAULT_COURSE);
    if (!course) return;

    state.course = course;
    state.flat = flattenCourse(course);
    state.completed = loadCompleted(course.id);
    state.moduleIndex = Math.min(getQueryNumber('module', 0), Math.max(0, (course.modules || []).length - 1));
    var module = course.modules[state.moduleIndex] || course.modules[0];
    state.lessonIndex = Math.min(
      getQueryNumber('lesson', 0),
      Math.max(0, ((module && module.lessons) || []).length - 1)
    );

    if (el.courseTitle) el.courseTitle.textContent = course.title || 'Bright Talks Course';
    bindEvents();
    renderLesson();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
