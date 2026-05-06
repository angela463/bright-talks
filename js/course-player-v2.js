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

  var el = {
    body: document.body,
    preloader: document.getElementById('player-v2-preloader'),
    offline: document.getElementById('player-v2-offline'),
    error: document.getElementById('player-v2-error'),
    nav: document.getElementById('player-v2-curriculum'),
    toggleNav: document.getElementById('player-v2-nav-toggle'),
    title: document.getElementById('player-v2-course-title'),
    lessonTitle: document.getElementById('player-v2-lesson-title'),
    lessonMeta: document.getElementById('player-v2-lesson-meta'),
    lessonSummary: document.getElementById('player-v2-lesson-summary'),
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

  function renderCurriculum() {
    var html = course.modules.map(function (module, mIndex) {
      var items = module.lessons.map(function (lesson, lIndex) {
        var active = mIndex === moduleIndex && lIndex === lessonIndex ? ' is-active' : '';
        return '' +
          '<button class="player-v2-nav-lesson' + active + '" data-module="' + mIndex + '" data-lesson="' + lIndex + '">' +
          '  <strong>' + lesson.title + '</strong>' +
          '  <span>' + lesson.duration + '</span>' +
          '</button>';
      }).join('');

      return '' +
        '<section class="player-v2-nav-module">' +
        '  <h3>' + module.title + '</h3>' +
        '  <p>' + module.objective + '</p>' +
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
    el.playPause.textContent = el.audio.paused ? 'Play' : 'Pause';
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

    history.replaceState({}, '', 'course-player-v2.html?course=' + encodeURIComponent(course.id) + '&module=' + moduleIndex + '&lesson=' + lessonIndex);

    el.title.textContent = course.title;
    el.lessonTitle.textContent = lesson.title;
    el.lessonMeta.textContent = module.title + ' · ' + lesson.duration + ' · Lesson ' + currentAbs + ' of ' + all.length;
    el.lessonSummary.textContent = lesson.summary;
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
