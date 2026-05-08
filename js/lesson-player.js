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

  /* Keep pool in sync with js/platform.js lessonArtwork (still images, not YouTube frames). */
  function lessonArtwork(moduleIdx, lessonIdx) {
    var art = [
      'images/pexels-max-fischer-5212331.jpg',
      'images/pexels-emma-bauso-1183828-2253879.jpg',
      'images/pexels-julia-m-cameron-4144531.jpg',
      'images/pexels-antonius-ferret-5274618.jpg',
      'images/pexels-karola-g-5478103.jpg',
      'images/pexels-julia-m-cameron-4144230.jpg',
      'images/pexels-bohlemedia-963713.jpg',
      'images/pexels-olgalioncat-7245594.jpg',
      'images/pexels-freestockpro-316820.jpg',
      'images/pexels-ketut-subiyanto-4473441.jpg',
      'images/how-it-works-family.jpg',
      'images/pexels-turgay-koca-405356598-14919198.jpg',
      'images/pexels-vittoriostaffolani-655674.jpg',
      'images/pexels-hngstrm-1939485.jpg',
      'images/pexels-tima-miroshnichenko-5813804.jpg',
      'images/pexels-silverkblack-20459167.jpg',
      'images/pexels-vlada-karpovich-4609085.jpg',
      'images/pexels-fernanda-da-silva-lopes-2055473628-29208526.jpg',
      'images/pexels-zhmkhv-3373282-5511203.jpg',
      'images/images-portraits/pexels-ilayda0700-36593091.jpg',
      'images/images-portraits/pexels-alaxmatias-28513050.jpg',
      'images/images-portraits/pexels-spencphoto-36646353.jpg',
      'images/images-portraits/pexels-konrads-photo-36215318.jpg',
      'images/pexels-cottonbro-6668315.jpg',
      'images/pexels-diva-26419303.jpg',
      'images/pexels-mikhail-nilov-6893360.jpg',
      'images/pexels-sanaan-3075945.jpg',
      'images/pexels-karola-g-6958470.jpg',
      'images/pexels-artempodrez-6951903.jpg',
      'images/promo/promo-01-family-tent.png',
      'images/promo/promo-02-family-bed.png',
      'images/promo/promo-03-hiking.png',
      'images/promo/promo-04-classroom.png',
      'images/promo/promo-05-tablet-learning.png',
      'images/promo/promo-07-family-walk.png',
      'images/promo/promo-08-teen-desk.png'
    ];
    var i = ((moduleIdx || 0) * 37 + (lessonIdx || 0)) % art.length;
    return art[i];
  }

  function posterForLesson(moduleIdx, lessonIdx) {
    return lessonArtwork(moduleIdx, lessonIdx);
  }

  function formatClock(seconds) {
    var s = Math.max(0, Math.floor(seconds));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function estimateNarrationSeconds(text, rate) {
    var wordCount = (text.match(/\S+/g) || []).length;
    var wordsPerMinute = 155;
    var minutes = wordCount / (wordsPerMinute * Math.max(0.7, rate || 1));
    return Math.max(1, Math.round(minutes * 60));
  }

  function extractNarrationText() {
    var parts = [];
    var title = document.getElementById('lesson-player-title');
    var parentIntro = document.querySelector('.lesson-preview-card__intro');
    var bodyParagraphs = document.querySelectorAll('.lesson-preview-copy p');
    var cta = document.querySelector('.lesson-preview-paywall__text');

    if (title && title.textContent) parts.push(title.textContent.trim());
    if (parentIntro && parentIntro.textContent) parts.push(parentIntro.textContent.trim());

    Array.prototype.forEach.call(bodyParagraphs, function (p) {
      if (p && p.textContent) parts.push(p.textContent.trim());
    });

    if (cta && cta.textContent) parts.push(cta.textContent.trim());

    return parts.join('\n\n').replace(/\s+/g, ' ').trim();
  }

  function choosePreferredVoice(voices) {
    if (!voices || !voices.length) return null;
    var preferredNames = [
      'female',
      'woman',
      'samantha',
      'karen',
      'victoria',
      'google us english',
      'jenny',
      'aria',
      'emma'
    ];

    function scoreVoice(v) {
      var name = (v.name || '').toLowerCase();
      var lang = (v.lang || '').toLowerCase();
      var score = 0;

      if (lang.indexOf('en-us') === 0) score += 30;
      else if (lang.indexOf('en') === 0) score += 15;

      preferredNames.forEach(function (needle, idx) {
        if (name.indexOf(needle) !== -1) score += 20 - idx;
      });

      if (v.default) score += 4;
      return score;
    }

    var englishVoices = voices.filter(function (v) {
      return String(v.lang || '').toLowerCase().indexOf('en') === 0;
    });
    var pool = englishVoices.length ? englishVoices : voices.slice();

    pool.sort(function (a, b) {
      return scoreVoice(b) - scoreVoice(a);
    });

    return pool[0] || null;
  }

  function createNarrationController(config) {
    var synth = window.speechSynthesis;
    var canNarrate = !!(synth && window.SpeechSynthesisUtterance);
    var state = {
      isPlaying: false,
      isPaused: false,
      utterance: null,
      selectedVoice: null,
      elapsedSec: 0,
      estimatedSec: estimateNarrationSeconds(config.text, config.getRate()),
      progressTimer: null
    };

    function clearProgressTimer() {
      if (state.progressTimer != null) {
        clearInterval(state.progressTimer);
        state.progressTimer = null;
      }
    }

    function updateProgressUI() {
      var percent = state.estimatedSec > 0 ? Math.round((state.elapsedSec / state.estimatedSec) * 100) : 0;
      config.progress.value = String(Math.max(0, Math.min(100, percent)));
      config.time.textContent = formatClock(state.elapsedSec) + ' / ' + formatClock(state.estimatedSec);
    }

    function setPlayingVisual(playing) {
      config.iconPlay.hidden = playing;
      config.iconPause.hidden = !playing;
      config.playBtn.setAttribute('aria-label', playing ? 'Pause narration' : 'Play narration');
    }

    function setStatus(msg) {
      config.status.textContent = msg;
    }

    function startProgressTimer() {
      clearProgressTimer();
      state.progressTimer = setInterval(function () {
        if (!state.isPlaying) return;
        state.elapsedSec = Math.min(state.elapsedSec + 1, state.estimatedSec);
        updateProgressUI();
      }, 1000);
    }

    function stopAndReset() {
      clearProgressTimer();
      if (synth && (state.isPlaying || state.isPaused)) synth.cancel();
      state.isPlaying = false;
      state.isPaused = false;
      state.elapsedSec = 0;
      state.estimatedSec = estimateNarrationSeconds(config.text, config.getRate());
      setPlayingVisual(false);
      updateProgressUI();
      setStatus('Narration ready');
    }

    function buildUtterance() {
      var utterance = new SpeechSynthesisUtterance(config.text);
      utterance.pitch = 1.1;
      utterance.rate = config.getRate();
      utterance.volume = 1;
      if (state.selectedVoice) utterance.voice = state.selectedVoice;

      utterance.onstart = function () {
        state.isPlaying = true;
        state.isPaused = false;
        setPlayingVisual(true);
        setStatus('Narrating...');
        startProgressTimer();
      };
      utterance.onpause = function () {
        state.isPaused = true;
        state.isPlaying = false;
        setPlayingVisual(false);
        setStatus('Narration paused');
      };
      utterance.onresume = function () {
        state.isPaused = false;
        state.isPlaying = true;
        setPlayingVisual(true);
        setStatus('Narrating...');
      };
      utterance.onend = function () {
        clearProgressTimer();
        state.isPlaying = false;
        state.isPaused = false;
        state.elapsedSec = state.estimatedSec;
        setPlayingVisual(false);
        updateProgressUI();
        setStatus('Narration finished');
      };
      utterance.onerror = function () {
        clearProgressTimer();
        state.isPlaying = false;
        state.isPaused = false;
        setPlayingVisual(false);
        setStatus('Narration unavailable right now');
      };

      state.utterance = utterance;
      return utterance;
    }

    function applyVoices() {
      if (!canNarrate) return false;
      var voices = synth.getVoices() || [];
      state.selectedVoice = choosePreferredVoice(voices);
      return !!voices.length;
    }

    function playOrPause() {
      if (!canNarrate) return;
      if (state.isPlaying) {
        synth.pause();
        return;
      }
      if (state.isPaused) {
        synth.resume();
        return;
      }
      if (!state.selectedVoice && !(synth.getVoices() || []).length) {
        config.fallback.hidden = false;
        setStatus('No speech voice available on this device');
        return;
      }

      state.elapsedSec = 0;
      state.estimatedSec = estimateNarrationSeconds(config.text, config.getRate());
      updateProgressUI();
      synth.cancel();
      synth.speak(buildUtterance());
    }

    function bindEvents() {
      config.playBtn.addEventListener('click', playOrPause);
      config.speed.addEventListener('change', function () {
        var wasPlaying = state.isPlaying || state.isPaused;
        var priorSec = state.elapsedSec;
        stopAndReset();
        state.elapsedSec = priorSec;
        state.estimatedSec = estimateNarrationSeconds(config.text, config.getRate());
        updateProgressUI();
        if (wasPlaying) playOrPause();
      });
      config.progress.addEventListener('input', function () {
        var targetSec = Math.round((Number(config.progress.value) / 100) * state.estimatedSec);
        state.elapsedSec = targetSec;
        updateProgressUI();
        if (state.isPlaying || state.isPaused) {
          stopAndReset();
          playOrPause();
        }
      });
      config.transcriptToggle.addEventListener('click', function () {
        var isHidden = config.transcript.hidden;
        config.transcript.hidden = !isHidden;
        config.transcriptToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });
      window.addEventListener('beforeunload', stopAndReset);
    }

    var hasVoices = applyVoices();
    if (canNarrate && !hasVoices) {
      window.speechSynthesis.onvoiceschanged = function () {
        applyVoices();
      };
    }
    bindEvents();
    updateProgressUI();
    config.transcript.textContent = config.text;
    if (!canNarrate) {
      setStatus('Narration unavailable');
      return { available: false, stop: stopAndReset };
    }
    return { available: true, stop: stopAndReset };
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

    var narrationText = extractNarrationText();
    if (typeof lesson === 'object' && lesson) {
      lesson.narrationText = lesson.narrationText || narrationText;
      lesson.transcript = lesson.transcript || lesson.narrationText;
      lesson.audioStatus = lesson.audioStatus || 'ready';
      lesson.preferredVoice = lesson.preferredVoice || 'light-bright-female';
    }

    var narrationUi = {
      wrapper: document.querySelector('.lesson-narration'),
      playBtn: document.getElementById('lesson-narration-play'),
      progress: document.getElementById('lesson-narration-progress'),
      time: document.getElementById('lesson-narration-time'),
      speed: document.getElementById('lesson-narration-speed'),
      transcriptToggle: document.getElementById('lesson-narration-transcript-toggle'),
      transcript: document.getElementById('lesson-narration-transcript'),
      fallback: document.getElementById('lesson-narration-fallback'),
      status: document.getElementById('lesson-narration-status'),
      iconPlay: document.getElementById('lesson-narration-icon-play'),
      iconPause: document.getElementById('lesson-narration-icon-pause')
    };

    if (
      narrationUi.wrapper &&
      narrationUi.playBtn &&
      narrationUi.progress &&
      narrationUi.time &&
      narrationUi.speed &&
      narrationUi.transcriptToggle &&
      narrationUi.transcript &&
      narrationUi.fallback &&
      narrationUi.status &&
      narrationUi.iconPlay &&
      narrationUi.iconPause
    ) {
      var narrationController = createNarrationController({
        text: (lesson && lesson.narrationText) || narrationText,
        playBtn: narrationUi.playBtn,
        progress: narrationUi.progress,
        time: narrationUi.time,
        speed: narrationUi.speed,
        transcriptToggle: narrationUi.transcriptToggle,
        transcript: narrationUi.transcript,
        fallback: narrationUi.fallback,
        status: narrationUi.status,
        iconPlay: narrationUi.iconPlay,
        iconPause: narrationUi.iconPause,
        getRate: function () {
          return Number(narrationUi.speed.value || 0.95);
        }
      });

      if (!narrationController.available) {
        narrationUi.fallback.hidden = false;
        narrationUi.playBtn.disabled = true;
        narrationUi.progress.disabled = true;
        narrationUi.speed.disabled = true;
      }
    }

    var backMod = document.getElementById('lesson-player-back-module');
    if (backMod) backMod.href = moduleHref;

    var posterEl = document.getElementById('lesson-sim-poster');
    if (posterEl) {
      posterEl.style.backgroundImage = "url('" + posterForLesson(moduleIdx, lessonIdx) + "')";
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
