/* course-player-v2.js */
(function () {
  'use strict';

  var common = window.CourseExperienceCommon;
  if (!common) return;

  var courseId = common.getQueryParam('course') || '';
  var course = common.getCourseById(courseId) || common.getCourses()[0];
  if (!course) return;

  var moduleIndex = Number(common.getQueryParam('module') || 0);
  var lessonIndex = Number(common.getQueryParam('lesson') || 0);
  var navOpen = true;

  if (common.getQueryParam('module') === null && common.getQueryParam('lesson') === null) {
    moduleIndex = 0;
    lessonIndex = 0;
  }

  var el = {
    body: document.body,
    preloader: document.getElementById('player-v2-preloader'),
    offline: document.getElementById('player-v2-offline'),
    error: document.getElementById('player-v2-error'),
    nav: document.getElementById('player-v2-curriculum'),
    toggleNav: document.getElementById('player-v2-nav-toggle'),
    title: document.getElementById('player-v2-course-title'),
    lessonDefault: document.getElementById('player-v2-lesson-default'),
    lessonSplit: document.getElementById('player-v2-lesson-split'),
    lessonTitle: document.getElementById('player-v2-lesson-title'),
    splitLessonTitle: document.getElementById('player-v2-split-lesson-title'),
    lessonMeta: document.getElementById('player-v2-lesson-meta'),
    lessonSummary: document.getElementById('player-v2-lesson-summary'),
    lessonSections: document.getElementById('player-v2-lesson-sections'),
    heroVisual: document.getElementById('player-v2-hero-visual'),
    heroSource: document.getElementById('player-v2-hero-source'),
    heroImage: document.getElementById('player-v2-hero-image'),
    audioSection: document.querySelector('.player-v2-audio'),
    footer: document.querySelector('.player-v2-footer'),
    progressFill: document.getElementById('player-v2-progress-fill'),
    prev: document.getElementById('player-v2-prev'),
    next: document.getElementById('player-v2-next'),
    complete: document.getElementById('player-v2-complete'),
    audio: document.getElementById('player-v2-audio'),
    playPause: document.getElementById('player-v2-play-pause'),
    seek: document.getElementById('player-v2-seek'),
    time: document.getElementById('player-v2-time'),
    speed: document.getElementById('player-v2-speed'),
    transcript: document.getElementById('player-v2-transcript'),
    transcriptToggle: document.getElementById('player-v2-transcript-toggle'),
    listenCta: document.getElementById('player-v2-listen-cta')
  };

  function escText(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getCurrentModule() {
    return course.modules[moduleIndex] || course.modules[0];
  }

  function getCurrentLesson() {
    var mod = getCurrentModule();
    return (mod.lessons[lessonIndex] || mod.lessons[0]);
  }

  function clampPosition() {
    if (moduleIndex < 0) moduleIndex = 0;
    if (moduleIndex > course.modules.length - 1) moduleIndex = course.modules.length - 1;
    var mod = getCurrentModule();
    if (lessonIndex < 0) lessonIndex = 0;
    if (lessonIndex > mod.lessons.length - 1) lessonIndex = mod.lessons.length - 1;
  }

  function absoluteLessonIndex() {
    var idx = 0;
    for (var i = 0; i < moduleIndex; i++) idx += course.modules[i].lessons.length;
    idx += lessonIndex;
    return idx;
  }

  function isSplitLesson(lesson) {
    return lesson && lesson.layout === 'split-right' && Array.isArray(lesson.sections) && lesson.sections.length > 0;
  }

  function buildSectionsHtml(lesson) {
    var sections = lesson.sections;
    if (!sections) return '';
    return sections.map(function (sec, i) {
      var sid = 'player-v2-sec-' + i;
      var h = '<section class="player-v2-section-card" aria-labelledby="' + sid + '">';
      h += '<h3 id="' + sid + '" class="player-v2-section-card__title">' + escText(sec.title) + '</h3>';

      if (sec.type === 'objectives' && sec.bullets && sec.bullets.length) {
        h += '<ul class="player-v2-section-card__list">';
        sec.bullets.forEach(function (b) {
          h += '<li>' + escText(b) + '</li>';
        });
        h += '</ul>';
      }

      if (sec.paragraphs && sec.paragraphs.length) {
        sec.paragraphs.forEach(function (p) {
          h += '<p class="player-v2-section-card__p">' + escText(p) + '</p>';
        });
      }

      if (sec.type === 'discussion') {
        if (sec.reflectionLead) {
          h += '<p class="player-v2-section-card__reflection-lead">' + escText(sec.reflectionLead) + '</p>';
        }
        if (sec.reflectionPlaceholder != null) {
          var tid = 'player-v2-reflect-' + i;
          h += '<label class="player-v2-section-card__label" for="' + tid + '">Your notes (optional)</label>';
          h += '<textarea id="' + tid + '" class="player-v2-section-card__textarea" rows="4" placeholder="' +
            escText(sec.reflectionPlaceholder) + '"></textarea>';
        }
      }

      h += '</section>';
      return h;
    }).join('');
  }

  function applyHeroVisual(lesson) {
    var hv = lesson && lesson.heroVisual;
    if (!el.heroVisual || !el.heroSource || !el.heroImage) return;

    if (!hv || !hv.src) {
      el.heroVisual.hidden = false;
      el.heroImage.hidden = true;
      return;
    }

    if (hv.type === 'image') {
      el.heroVisual.hidden = true;
      el.heroVisual.pause();
      el.heroImage.hidden = false;
      el.heroImage.src = hv.src;
      el.heroImage.alt = hv.alt || 'Lesson illustration';
    } else {
      el.heroImage.hidden = true;
      el.heroVisual.hidden = false;
      if (el.heroSource.getAttribute('src') !== hv.src) {
        el.heroSource.setAttribute('src', hv.src);
        el.heroVisual.load();
      }
      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        el.heroVisual.removeAttribute('autoplay');
        el.heroVisual.pause();
      } else {
        el.heroVisual.setAttribute('autoplay', '');
        el.heroVisual.play().catch(function () {});
      }
    }
  }

  function renderCurriculum() {
    var html = course.modules.map(function (module, mIndex) {
      var items = module.lessons.map(function (lesson, lIndex) {
        var active = mIndex === moduleIndex && lIndex === lessonIndex ? ' is-active' : '';
        return '' +
          '<button class="player-v2-nav-lesson' + active + '" data-module="' + mIndex + '" data-lesson="' + lIndex + '">' +
          '  <strong>' + escText(lesson.title) + '</strong>' +
          '  <span>' + escText(lesson.duration) + '</span>' +
          '</button>';
      }).join('');

      return '' +
        '<section class="player-v2-nav-module">' +
        '  <h3>' + escText(module.title) + '</h3>' +
        '  <p>' + escText(module.objective) + '</p>' +
        '  <div class="player-v2-nav-lessons">' + items + '</div>' +
        '</section>';
    }).join('');

    el.nav.innerHTML = html;
    Array.prototype.forEach.call(el.nav.querySelectorAll('.player-v2-nav-lesson'), function (btn) {
      btn.addEventListener('click', function () {
        moduleIndex = Number(btn.getAttribute('data-module'));
        lessonIndex = Number(btn.getAttribute('data-lesson'));
        render();
      });
    });
  }

  function formatTime(totalSeconds) {
    var seconds = Math.max(0, Math.floor(totalSeconds || 0));
    var mins = Math.floor(seconds / 60);
    var rem = seconds % 60;
    return mins + ':' + String(rem).padStart(2, '0');
  }

  function updateAudioUI() {
    var current = el.audio.currentTime || 0;
    var duration = el.audio.duration || 0;
    var percent = duration > 0 ? Math.round((current / duration) * 100) : 0;
    el.seek.value = percent;
    el.time.textContent = formatTime(current) + ' / ' + formatTime(duration);
    var isPlaying = !el.audio.paused;
    el.playPause.classList.toggle('is-playing', isPlaying);
    el.playPause.setAttribute('aria-label', isPlaying ? 'Pause audio' : 'Play audio');
  }

  function bindAudioEvents() {
    el.audio.addEventListener('timeupdate', updateAudioUI);
    el.audio.addEventListener('loadedmetadata', updateAudioUI);
    el.audio.addEventListener('error', function () {
      el.error.hidden = false;
    });

    el.playPause.addEventListener('click', function () {
      if (el.audio.paused) {
        el.audio.play().catch(function () { el.error.hidden = false; });
      } else {
        el.audio.pause();
      }
      updateAudioUI();
    });

    el.listenCta.addEventListener('click', function () {
      el.audio.play().catch(function () { el.error.hidden = false; });
      updateAudioUI();
    });

    el.seek.addEventListener('input', function () {
      if (!el.audio.duration) return;
      el.audio.currentTime = (Number(el.seek.value) / 100) * el.audio.duration;
    });

    el.speed.addEventListener('change', function () {
      el.audio.playbackRate = Number(el.speed.value);
    });

    el.transcriptToggle.addEventListener('click', function () {
      var isHidden = el.transcript.hidden;
      el.transcript.hidden = !isHidden;
      el.transcriptToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  function goToPrevious() {
    if (lessonIndex > 0) {
      lessonIndex -= 1;
    } else if (moduleIndex > 0) {
      moduleIndex -= 1;
      lessonIndex = getCurrentModule().lessons.length - 1;
    }
    render();
  }

  function goToNext() {
    var mod = getCurrentModule();
    if (lessonIndex < mod.lessons.length - 1) {
      lessonIndex += 1;
    } else if (moduleIndex < course.modules.length - 1) {
      moduleIndex += 1;
      lessonIndex = 0;
    }
    render();
  }

  function markComplete() {
    var total = common.flattenLessons(course).length;
    var current = absoluteLessonIndex() + 1;
    var pct = Math.round((current / total) * 100);
    common.setCourseProgress(course.id, pct);
    goToNext();
  }

  function render() {
    clampPosition();
    var module = getCurrentModule();
    var lesson = getCurrentLesson();
    var all = common.flattenLessons(course);
    var currentAbs = absoluteLessonIndex() + 1;
    var pct = Math.round((currentAbs / all.length) * 100);
    var split = isSplitLesson(lesson);

    history.replaceState({}, '', 'course-player-v2.html?course=' + encodeURIComponent(course.id) +
      '&module=' + moduleIndex + '&lesson=' + lessonIndex);

    el.title.textContent = course.title;
    el.lessonMeta.textContent = module.title + ' · ' + lesson.duration + ' · Lesson ' + currentAbs + ' of ' + all.length;
    el.lessonMeta.hidden = false;

    el.lessonDefault.hidden = split;
    el.lessonSplit.hidden = !split;

    if (split) {
      el.splitLessonTitle.textContent = lesson.title;
      el.lessonSections.innerHTML = buildSectionsHtml(lesson);
      applyHeroVisual(lesson);
    } else {
      if (el.heroVisual) el.heroVisual.pause();
      el.lessonTitle.textContent = lesson.title;
      el.lessonSummary.textContent = lesson.summary;
    }

    el.progressFill.style.width = pct + '%';
    el.audio.src = lesson.audio.audioUrl;
    el.transcript.textContent = lesson.audio.transcript;
    el.error.hidden = lesson.audio.status !== 'failed';

    renderCurriculum();
    updateAudioUI();
  }

  function setOnlineState() {
    var offline = !navigator.onLine;
    el.body.classList.toggle('is-offline', offline);
    el.offline.hidden = !offline;
  }

  function setNavState() {
    el.body.classList.toggle('player-v2-nav-collapsed', !navOpen);
  }

  function init() {
    setOnlineState();
    setNavState();

    setTimeout(function () {
      el.preloader.classList.add('is-hidden');
    }, 900);

    window.addEventListener('online', setOnlineState);
    window.addEventListener('offline', setOnlineState);

    el.toggleNav.addEventListener('click', function () {
      navOpen = !navOpen;
      setNavState();
    });

    el.prev.addEventListener('click', goToPrevious);
    el.next.addEventListener('click', goToNext);
    el.complete.addEventListener('click', markComplete);

    bindAudioEvents();
    render();
  }

  init();
})();
