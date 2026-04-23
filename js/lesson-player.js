(function () {
  'use strict';

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function lessonTitle(lesson) {
    return typeof lesson === 'string' ? lesson : (lesson && lesson.title) || 'Lesson';
  }

  function lessonUnlocked(lesson, lessonIdx) {
    if (!lesson || typeof lesson !== 'object' || lesson.unlocked !== true) return false;
    // Only the first lesson in a module is publicly playable (even if data flags more).
    return lessonIdx === 0;
  }

  function lessonArtwork(idx) {
    var art = [
      'images/pexels-max-fischer-5212331.jpg',
      'images/pexels-emma-bauso-1183828-2253879.jpg',
      'images/pexels-julia-m-cameron-4144531.jpg',
      'images/pexels-antonius-ferret-5274618.jpg',
      'images/pexels-karola-g-5478103.jpg',
      'images/pexels-julia-m-cameron-4144230.jpg',
      'images/pexels-bohlemedia-963713.jpg',
      'images/pexels-olgalioncat-7245594.jpg'
    ];
    return art[idx % art.length];
  }

  function posterForLesson(lesson, idx) {
    if (typeof lesson === 'object' && lesson && lesson.video && lesson.video.youtubeId) {
      return 'https://img.youtube.com/vi/' + String(lesson.video.youtubeId) + '/hqdefault.jpg';
    }
    return lessonArtwork(idx);
  }

  function formatClock(seconds) {
    var s = Math.max(0, Math.floor(seconds));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  /** Wall-clock length of the on-page playback animation (ms). */
  var DEMO_PLAYBACK_MS = 16000;

  var courses = window.BRIGHT_TALKS_COURSES || [];

  function init() {
    var errEl = document.getElementById('lesson-player-error');
    var rootEl = document.getElementById('lesson-player-root');
    if (!errEl || !rootEl) return;

    var courseId = qs('course') || '';
    var moduleIdx = parseInt(qs('module') || '0', 10);
    var lessonIdx = parseInt(qs('lesson') || '0', 10);

    var course = courses.find(function (c) {
      return c.id === courseId;
    });
    if (!course) {
      errEl.hidden = false;
      return;
    }

    var modules = course.modules || [];
    var mod = modules[moduleIdx];
    if (!mod) {
      errEl.hidden = false;
      return;
    }

    var lessons = mod.lessons || [];
    var lesson = lessons[lessonIdx];
    if (lesson == null) {
      errEl.hidden = false;
      return;
    }

    var title = lessonTitle(lesson);
    var unlocked = lessonUnlocked(lesson, lessonIdx);
    var durationMin =
      typeof lesson === 'object' && lesson && lesson.durationMinutes != null
        ? lesson.durationMinutes
        : 8;
    var durationSec = durationMin * 60;
    var moduleHref =
      'module-detail.html?course=' + encodeURIComponent(course.id) + '&module=' + moduleIdx;
    var courseHref = 'course-detail.html?course=' + encodeURIComponent(course.id);

    document.title = title + ' · Bright Talks';

    errEl.hidden = true;
    rootEl.hidden = false;

    var bcCourse = document.getElementById('lesson-bc-course');
    var bcModule = document.getElementById('lesson-bc-module');
    if (bcCourse) {
      bcCourse.href = courseHref;
      bcCourse.textContent = course.title || 'Course';
    }
    if (bcModule) {
      bcModule.href = moduleHref;
      bcModule.textContent = mod.title || 'Module';
    }
    var bcLesson = document.getElementById('lesson-bc-lesson');
    if (bcLesson) bcLesson.textContent = title;

    var chipCourse = document.getElementById('lesson-player-course-chip');
    var chipAge = document.getElementById('lesson-player-age-chip');
    var chipNum = document.getElementById('lesson-player-lesson-chip');
    if (chipCourse) chipCourse.textContent = course.title || 'Course';
    if (chipAge) chipAge.textContent = course.ageGroup || '';
    if (chipNum) chipNum.textContent = 'Lesson ' + (lessonIdx + 1) + ' of ' + lessons.length;

    var h1 = document.getElementById('lesson-player-title');
    if (h1) h1.textContent = title;

    var summaryEl = document.getElementById('lesson-player-summary');
    if (summaryEl) {
      if (typeof lesson === 'object' && lesson && lesson.summary) {
        summaryEl.textContent = lesson.summary;
        summaryEl.hidden = false;
      } else {
        summaryEl.textContent = '';
        summaryEl.hidden = true;
      }
    }

    var backMod = document.getElementById('lesson-player-back-module');
    if (backMod) backMod.href = moduleHref;

    var posterEl = document.getElementById('lesson-sim-poster');
    if (posterEl) {
      posterEl.style.backgroundImage = "url('" + posterForLesson(lesson, lessonIdx) + "')";
    }

    var lockedEl = document.getElementById('lesson-sim-locked');
    var backLocked = document.getElementById('lesson-sim-back-locked');
    var bigPlay = document.getElementById('lesson-sim-big-play');
    var simRoot = document.getElementById('lesson-sim');
    if (backLocked) {
      backLocked.href = moduleHref;
    }

    if (!unlocked) {
      if (simRoot) simRoot.classList.add('lesson-sim--locked');
      if (lockedEl) lockedEl.hidden = false;
      if (bigPlay) bigPlay.hidden = true;
      return;
    }

    if (simRoot) simRoot.classList.add('lesson-sim--unlocked');
    if (lockedEl) lockedEl.hidden = true;

    var ambient = document.getElementById('lesson-sim-ambient');
    var controls = document.getElementById('lesson-sim-controls');
    var fill = document.getElementById('lesson-sim-fill');
    var progressBar = document.getElementById('lesson-sim-progress');
    var elapsedEl = document.getElementById('lesson-sim-elapsed');
    var totalEl = document.getElementById('lesson-sim-total');
    var toggleBtn = document.getElementById('lesson-sim-toggle');
    var iconPause = document.getElementById('lesson-sim-icon-pause');
    var iconPlay = document.getElementById('lesson-sim-icon-play');
    var endedPanel = document.getElementById('lesson-sim-ended');

    function setTogglePlaying(isPlaying) {
      if (iconPause) iconPause.hidden = !isPlaying;
      if (iconPlay) iconPlay.hidden = isPlaying;
    }
    var replayBtn = document.getElementById('lesson-sim-replay');

    if (totalEl) totalEl.textContent = formatClock(durationSec);

    var timerId = null;
    var elapsedMs = 0;
    var playing = false;
    var ended = false;

    function setProgressUi(t) {
      var pct = Math.min(100, Math.max(0, t * 100));
      if (fill) fill.style.width = pct + '%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
      if (elapsedEl) elapsedEl.textContent = formatClock(t * durationSec);
    }

    function teardownTimer() {
      if (timerId != null) {
        clearInterval(timerId);
        timerId = null;
      }
    }

    function finishPlayback() {
      playing = false;
      ended = true;
      teardownTimer();
      setProgressUi(1);
      if (posterEl) posterEl.removeAttribute('data-playing');
      if (ambient) ambient.hidden = true;
      if (controls) controls.hidden = true;
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.setAttribute('aria-label', 'Play');
        setTogglePlaying(false);
      }
      if (endedPanel) endedPanel.hidden = false;
      if (bigPlay) bigPlay.hidden = true;
    }

    function tick() {
      elapsedMs += 100;
      var t = elapsedMs / DEMO_PLAYBACK_MS;
      if (t >= 1) {
        finishPlayback();
        return;
      }
      setProgressUi(t);
    }

    function startPlayback() {
      if (ended) {
        ended = false;
        elapsedMs = 0;
        setProgressUi(0);
      }
      playing = true;
      if (ambient) ambient.hidden = false;
      if (posterEl) posterEl.setAttribute('data-playing', 'true');
      if (bigPlay) bigPlay.hidden = true;
      if (endedPanel) endedPanel.hidden = true;
      if (controls) controls.hidden = false;
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('aria-label', 'Pause');
        setTogglePlaying(true);
      }
      teardownTimer();
      timerId = setInterval(tick, 100);
    }

    function pausePlayback() {
      playing = false;
      teardownTimer();
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.setAttribute('aria-label', 'Play');
        setTogglePlaying(false);
      }
    }

    function resumePlayback() {
      if (ended) return;
      playing = true;
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('aria-label', 'Pause');
        setTogglePlaying(true);
      }
      timerId = setInterval(tick, 100);
    }

    if (bigPlay) {
      bigPlay.addEventListener('click', function () {
        if (!ended) startPlayback();
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        if (ended) return;
        if (playing) pausePlayback();
        else resumePlayback();
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', function () {
        ended = false;
        elapsedMs = 0;
        setProgressUi(0);
        if (endedPanel) endedPanel.hidden = true;
        if (posterEl) posterEl.removeAttribute('data-playing');
        if (ambient) ambient.hidden = true;
        if (bigPlay) bigPlay.hidden = false;
        if (controls) controls.hidden = true;
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-pressed', 'false');
          toggleBtn.setAttribute('aria-label', 'Play');
        }
        setTogglePlaying(false);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
