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
  var navOpen = window.innerWidth > 960;
  var lessonMode = 'watch';
  var toastTimer = null;
  var splashFadeTimer = null;
  var splashFallbackTimer = null;
  var outroTimer = null;
  var splashSequenceId = 0;
  var embedMessageBound = false;
  var bunnyPlayer = null;
  var embedIsPlaying = false;
  var embedPendingPlay = false;
  var talk1Phase = 'idle';
  var talk1MainDurationSec = 354;
  var talk1EmbedCurrentSec = 0;
  var talk1ProgressTimer = null;
  var talk1Volume = 1;
  var talk1Muted = false;
  var talk1Seeking = false;
  var introSplashLessonKey = '';
  var userStartedEmbed = false;
  var welcomePromoInstance = null;
  var introPlaybackStarted = false;
  var introPlaybackPaused = false;
  var introRevealRemainingMs = 0;
  var introRevealTimerStartedAt = 0;
  var waveHeights = Array.from({ length: 54 }, function (_, i) {
    return 5 + Math.round(Math.abs(Math.sin(i * 0.55 + 1)) * 20) + (i % 4) * 3;
  });

  if (common.getQueryParam('module') === null && common.getQueryParam('lesson') === null) {
    var entry = course.playerEntry || { module: 0, lesson: 0 };
    moduleIndex = entry.module;
    lessonIndex = entry.lesson;
  }

  if (course.id === 'bt-foundations-early-years' &&
      moduleIndex === 2 && lessonIndex === 2) {
    moduleIndex = 0;
    lessonIndex = 0;
  }

  var el = {
    body: document.body,
    preloader: document.getElementById('player-v2-preloader'),
    offline: document.getElementById('player-v2-offline'),
    error: document.getElementById('player-v2-error'),
    nav: document.getElementById('player-v2-curriculum'),
    burger: document.getElementById('player-v2-burger'),
    overlay: document.getElementById('player-v2-overlay'),
    drawerClose: document.getElementById('player-v2-drawer-close'),
    toggleNav: document.getElementById('player-v2-nav-toggle'),
    title: document.getElementById('player-v2-course-title'),
    lessonPanel: document.getElementById('player-v2-lesson-panel'),
    legacyCanvas: document.getElementById('player-v2-legacy-canvas'),
    lessonDefault: document.getElementById('player-v2-lesson-default'),
    sidebarDefault: document.getElementById('player-v2-sidebar-default'),
    sidebarLessonSlot: document.getElementById('player-v2-sidebar-lesson-slot'),
    moduleLabel: document.getElementById('player-v2-module-label'),
    mainLessonTitle: document.getElementById('player-v2-main-lesson-title'),
    pills: document.getElementById('player-v2-pills'),
    intro: document.getElementById('player-v2-intro'),
    callout: document.getElementById('player-v2-callout'),
    lessonTitle: document.getElementById('player-v2-lesson-title'),
    lessonSummary: document.getElementById('player-v2-lesson-summary'),
    lessonSections: document.getElementById('player-v2-lesson-sections'),
    heroVisual: document.getElementById('player-v2-hero-visual'),
    heroEmbed: document.getElementById('player-v2-hero-embed'),
    heroSource: document.getElementById('player-v2-hero-source'),
    heroImage: document.getElementById('player-v2-hero-image'),
    welcomePromoRoot: document.getElementById('player-v2-promo-root'),
    titleSplash: document.getElementById('player-v2-title-splash'),
    titleSplashLogo: document.getElementById('player-v2-title-splash-logo'),
    titleSplashSeries: document.getElementById('player-v2-title-splash-series'),
    titleSplashKicker: document.getElementById('player-v2-title-splash-kicker'),
    titleSplashTitle: document.getElementById('player-v2-title-splash-title'),
    outroSplash: document.getElementById('player-v2-outro-splash'),
    outroSplashSeries: document.getElementById('player-v2-outro-splash-series'),
    outroSplashKicker: document.getElementById('player-v2-outro-splash-kicker'),
    outroSplashTitle: document.getElementById('player-v2-outro-splash-title'),
    outroSplashSubtitle: document.getElementById('player-v2-outro-splash-subtitle'),
    splashAudio: document.getElementById('player-v2-splash-audio'),
    outroAudio: document.getElementById('player-v2-outro-audio'),
    videoStage: document.querySelector('.player-v2-video-stage'),
    videoAwaiting: null,
    videoPlay: null,
    videoBarPause: document.getElementById('player-v2-video-bar-pause'),
    videoBarRestart: document.getElementById('player-v2-video-bar-restart'),
    videoBarPlay: document.getElementById('player-v2-video-bar-play'),
    videoSeek: document.getElementById('player-v2-video-seek'),
    videoTime: document.getElementById('player-v2-video-time'),
    videoBarMute: document.getElementById('player-v2-video-bar-mute'),
    videoBarVolume: document.getElementById('player-v2-video-bar-volume'),
    videoBarVolumeWrap: document.getElementById('player-v2-video-bar-volume-wrap'),
    videoBarFullscreen: document.getElementById('player-v2-video-bar-fullscreen'),
    videoNowTitle: document.getElementById('player-v2-video-now-title'),
    sidebarCourseNav: document.getElementById('player-v2-sidebar-course-nav'),
    progressFill: document.getElementById('player-v2-progress-fill'),
    progressCount: document.getElementById('player-v2-progress-count'),
    progressMeta: document.getElementById('player-v2-progress-meta'),
    progressCopy: document.getElementById('player-v2-progress-copy'),
    listenPanel: document.getElementById('player-v2-listen-panel'),
    listenPlay: document.getElementById('player-v2-listen-play'),
    listenTitle: document.getElementById('player-v2-listen-title'),
    waveform: document.getElementById('player-v2-waveform'),
    seekTrack: document.getElementById('player-v2-seek-track'),
    seekFill: document.getElementById('player-v2-seek-fill'),
    seekKnob: document.getElementById('player-v2-seek-knob'),
    readPlay: document.getElementById('player-v2-read-play'),
    readAudioTitle: document.getElementById('player-v2-read-audio-title'),
    readWaveform: document.getElementById('player-v2-read-waveform'),
    readSeekTrack: document.getElementById('player-v2-read-seek-track'),
    readSeekFill: document.getElementById('player-v2-read-seek-fill'),
    readSeekKnob: document.getElementById('player-v2-read-seek-knob'),
    readTime: document.getElementById('player-v2-read-time'),
    readPanel: document.getElementById('player-v2-read-panel'),
    readTranscript: document.getElementById('player-v2-read-transcript'),
    playingBadge: document.getElementById('player-v2-playing-badge'),
    embedCenterPlay: document.getElementById('player-v2-embed-center-play'),
    embedPlayShield: document.getElementById('player-v2-embed-play-shield'),
    toast: document.getElementById('player-v2-toast'),
    lessonPosition: document.getElementById('player-v2-lesson-position'),
    prev: document.getElementById('player-v2-prev'),
    next: document.getElementById('player-v2-next'),
    complete: document.getElementById('player-v2-complete'),
    audio: document.getElementById('player-v2-audio'),
    time: document.getElementById('player-v2-time'),
    modeTabs: document.querySelectorAll('.player-v2-mode-tabs__btn'),
    contentCard: document.getElementById('player-v2-content-card')
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
    clampToAvailableLesson();
  }

  function isLessonSoon(lesson) {
    return !!(lesson && lesson.availability === 'soon');
  }

  function isLessonReady(lesson) {
    return !!(lesson && lesson.availability === 'ready');
  }

  function clampToAvailableLesson() {
    if (!isLessonSoon(getCurrentLesson())) return;
    var items = flattenItems();
    for (var i = 0; i < items.length; i++) {
      if (!isLessonSoon(items[i].lessonData)) {
        moduleIndex = items[i].module;
        lessonIndex = items[i].lesson;
        return;
      }
    }
  }

  function findAdjacentAvailableLesson(direction) {
    var items = flattenItems();
    var current = absoluteLessonIndex();
    var step = direction > 0 ? 1 : -1;
    for (var i = current + step; i >= 0 && i < items.length; i += step) {
      if (!isLessonSoon(items[i].lessonData)) {
        return { module: items[i].module, lesson: items[i].lesson };
      }
    }
    return null;
  }

  function absoluteLessonIndex() {
    var idx = 0;
    for (var i = 0; i < moduleIndex; i++) idx += course.modules[i].lessons.length;
    idx += lessonIndex;
    return idx;
  }

  function encodeMediaPath(path) {
    var raw = String(path || '');
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.split('/').map(function (part) {
      return encodeURIComponent(part);
    }).join('/');
  }

  function ensureLessonAudio(lesson) {
    if (!el.audio || !lesson || !lesson.audio || !lesson.audio.audioUrl) return;
    var src = encodeMediaPath(lesson.audio.audioUrl);
    var current = el.audio.currentSrc || el.audio.src || '';
    if (current.indexOf(encodeURIComponent(lesson.audio.audioUrl.split('/').pop())) === -1) {
      el.audio.src = src;
      el.audio.load();
    }
  }

  function isPromoWelcome(lesson) {
    return !!(lesson && lesson.heroVisual && lesson.heroVisual.type === 'promo');
  }

  function pauseWelcomePromo() {
    if (welcomePromoInstance && welcomePromoInstance.pause) welcomePromoInstance.pause();
  }

  function hideWelcomePromo() {
    pauseWelcomePromo();
    if (el.welcomePromoRoot) el.welcomePromoRoot.hidden = true;
    if (el.videoStage) el.videoStage.classList.remove('is-welcome-promo');
  }

  function mountWelcomePromo() {
    if (!el.welcomePromoRoot || !window.BrightTalksPromoSlideshow) return;
    if (!welcomePromoInstance) {
      welcomePromoInstance = window.BrightTalksPromoSlideshow.mount(el.welcomePromoRoot);
    }
  }

  function applyPromoHero(lesson) {
    resetHeroEmbed();
    if (el.heroVisual) {
      el.heroVisual.pause();
      el.heroVisual.hidden = true;
    }
    if (el.heroImage) {
      el.heroImage.hidden = true;
      el.heroImage.removeAttribute('src');
    }
    if (el.heroEmbed) el.heroEmbed.hidden = true;
    if (el.videoStage) {
      el.videoStage.classList.remove('is-embed-mode', 'is-image-mode', 'is-no-video', 'is-welcome-video');
      el.videoStage.classList.add('is-welcome-promo');
    }
    if (el.welcomePromoRoot) el.welcomePromoRoot.hidden = false;
    mountWelcomePromo();
    updateVideoControlsState();
  }

  function syncWelcomeVisual(lesson, narrationPlaying) {
    if (!isWelcomeLesson(lesson) || !el.heroVisual || !el.heroImage) return;
    var poster = lesson.heroVisual && lesson.heroVisual.poster;
    if (poster) {
      el.heroImage.hidden = false;
      el.heroImage.src = encodeMediaPath(poster);
      el.heroImage.alt = '';
    } else {
      el.heroImage.hidden = true;
      el.heroImage.removeAttribute('src');
    }
    el.heroVisual.hidden = false;
    configureHeroVideoPlayback(lesson);
    if (narrationPlaying) {
      el.heroVisual.play().catch(function () {});
      return;
    }
    try {
      el.heroVisual.currentTime = 0;
    } catch (err) {}
    el.heroVisual.pause();
  }

  function playWelcomeNarration(lesson) {
    ensureLessonAudio(lesson);
    syncWelcomeVisual(lesson, true);
    if (!el.audio) return;
    if (el.error) el.error.hidden = true;
    var playAttempt = el.audio.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {
        if (el.error) el.error.hidden = false;
      });
    }
  }

  function pauseWelcomeNarration() {
    var lesson = getCurrentLesson();
    if (el.audio) el.audio.pause();
    syncWelcomeVisual(lesson, false);
  }

  function resetWelcomeNarration(lesson) {
    pauseWelcomeNarration();
    if (el.audio) {
      ensureLessonAudio(lesson);
      el.audio.currentTime = 0;
    }
    if (el.heroVisual && !el.heroVisual.hidden) {
      el.heroVisual.currentTime = 0;
    }
    updateVideoUI();
  }

  function setWelcomeVideoStage(lesson) {
    if (!el.videoStage) return;
    var welcome = isWelcomeLesson(lesson);
    el.videoStage.classList.toggle('is-welcome-video', welcome);
    if (el.heroEmbed) {
      el.heroEmbed.hidden = welcome;
      if (welcome) {
        el.heroEmbed.classList.remove('is-visible');
        el.heroEmbed.classList.add('is-splash-hidden');
        el.heroEmbed.removeAttribute('src');
      }
    }
  }

  function videoMimeFromSrc(src) {
    if (/\.mov$/i.test(src)) return 'video/quicktime';
    if (/\.webm$/i.test(src)) return 'video/webm';
    return 'video/mp4';
  }

  function getHeroSplash(lesson) {
    var hv = lesson && lesson.heroVisual;
    return hv && hv.splash ? hv.splash : null;
  }

  function isEmbedLesson(lesson) {
    return !!(lesson && lesson.heroVisual && lesson.heroVisual.type === 'embed');
  }

  function isTalk1Lesson(lesson) {
    return !!(lesson && lesson.id === 'lesson-1-bodies');
  }

  function parseDurationToSeconds(label) {
    var raw = String(label || '').trim();
    if (!raw) return 0;
    var parts = raw.split(':').map(function (part) {
      return Number(part);
    });
    if (parts.some(function (n) { return Number.isNaN(n); })) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  }

  function getTalk1IntroDurationSec(lesson) {
    return getIntroDurationMs(getHeroSplash(lesson)) / 1000;
  }

  function getTalk1TotalDurationSec(lesson) {
    return getTalk1IntroDurationSec(lesson) + talk1MainDurationSec;
  }

  function stopTalk1ProgressPolling() {
    if (talk1ProgressTimer) {
      clearInterval(talk1ProgressTimer);
      talk1ProgressTimer = null;
    }
  }

  function startTalk1ProgressPolling() {
    if (!isTalk1Lesson(getCurrentLesson())) return;
    stopTalk1ProgressPolling();
    talk1ProgressTimer = setInterval(function () {
      var lesson = getCurrentLesson();
      if (!isTalk1Lesson(lesson)) return;
      if (talk1Phase === 'intro' && el.splashAudio && !el.splashAudio.paused) {
        updateTalk1VideoUI();
        return;
      }
      if (talk1Phase !== 'main' || !bunnyPlayer) return;
      if (bunnyPlayer.getCurrentTime) {
        bunnyPlayer.getCurrentTime(function (seconds) {
          talk1EmbedCurrentSec = Number(seconds) || 0;
          updateTalk1VideoUI();
        });
      }
    }, 250);
  }

  function resetTalk1PlayerState() {
    talk1Phase = 'idle';
    talk1EmbedCurrentSec = 0;
    talk1Seeking = false;
    stopTalk1ProgressPolling();
  }

  function syncTalk1PlayerChrome(lesson) {
    var active = isTalk1Lesson(lesson);
    if (el.videoStage) el.videoStage.classList.toggle('is-talk1-player', active);
    if (el.videoBarVolumeWrap) el.videoBarVolumeWrap.hidden = !active;
    if (el.videoBarFullscreen) el.videoBarFullscreen.hidden = !active;
    if (el.videoBarRestart) el.videoBarRestart.hidden = active;
    if (active) {
      talk1MainDurationSec = parseDurationToSeconds(lesson.audio && lesson.audio.duration) || 354;
      applyTalk1Volume();
      hideTalk1EmbedOverlays();
      updateTalk1VideoUI();
    } else {
      resetTalk1PlayerState();
    }
  }

  function applyTalk1Volume() {
    var level = talk1Muted ? 0 : talk1Volume;
    if (el.splashAudio) el.splashAudio.volume = level;
    if (el.videoBarVolume) el.videoBarVolume.value = String(Math.round(talk1Volume * 100));
    if (el.videoBarMute) {
      el.videoBarMute.setAttribute('aria-pressed', talk1Muted ? 'true' : 'false');
      el.videoBarMute.setAttribute('aria-label', talk1Muted ? 'Unmute' : 'Mute');
      var iconVol = el.videoBarMute.querySelector('.player-v2-video-bar__icon-volume');
      var iconMuted = el.videoBarMute.querySelector('.player-v2-video-bar__icon-muted');
      if (iconVol) iconVol.hidden = talk1Muted;
      if (iconMuted) iconMuted.hidden = !talk1Muted;
    }
    if (!bunnyPlayer) return;
    if (talk1Muted) {
      if (bunnyPlayer.mute) bunnyPlayer.mute();
      else if (bunnyPlayer.setVolume) bunnyPlayer.setVolume(0);
      return;
    }
    if (bunnyPlayer.unmute) bunnyPlayer.unmute();
    else if (bunnyPlayer.setVolume) bunnyPlayer.setVolume(Math.round(talk1Volume * 100));
  }

  function getTalk1CurrentTimeSec(lesson) {
    if (talk1Phase === 'main' || talk1Phase === 'ended') {
      return getTalk1IntroDurationSec(lesson) + talk1EmbedCurrentSec;
    }
    if (talk1Phase === 'intro' && el.splashAudio) {
      return el.splashAudio.currentTime || 0;
    }
    return 0;
  }

  function isTalk1Playing() {
    if (talk1Phase === 'intro') return introPlaybackStarted && !introPlaybackPaused;
    if (talk1Phase === 'main') return embedIsPlaying;
    return false;
  }

  function updateTalk1VideoUI() {
    var lesson = getCurrentLesson();
    if (!isTalk1Lesson(lesson)) return;
    var total = getTalk1TotalDurationSec(lesson);
    var current = getTalk1CurrentTimeSec(lesson);
    var percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;
    if (el.videoSeek && !talk1Seeking) {
      el.videoSeek.disabled = false;
      el.videoSeek.hidden = false;
      el.videoSeek.value = String(percent);
    }
    if (el.videoTime) {
      el.videoTime.textContent = formatTime(current) + ' / ' + formatTime(total);
    }
    var playing = isTalk1Playing();
    setTransportBtn(el.videoBarPlay, !playing);
    setTransportBtn(el.videoBarPause, playing);
    setTransportBtn(el.videoBarRestart, true);
    updateVideoControlsState();
  }

  function hideTalk1EmbedOverlays() {
    if (el.embedCenterPlay) {
      el.embedCenterPlay.hidden = true;
      el.embedCenterPlay.setAttribute('hidden', '');
    }
    if (el.embedPlayShield) {
      el.embedPlayShield.hidden = true;
      el.embedPlayShield.setAttribute('hidden', '');
    }
  }

  function getTalk1EmbedParams(forPlayback) {
    return {
      autoplay: forPlayback ? 'true' : 'false',
      loop: 'false',
      muted: forPlayback ? 'false' : 'true',
      preload: 'true',
      responsive: 'true',
      playerjs: 'true',
      compactControls: 'true'
    };
  }

  function revealTalk1EmbedWhenPlaying() {
    if (!isTalk1Lesson(getCurrentLesson())) return;
    if (el.heroEmbed) {
      el.heroEmbed.classList.remove('is-splash-hidden');
      el.heroEmbed.classList.add('is-visible');
    }
    if (el.videoStage) {
      el.videoStage.classList.add('is-embed-started', 'is-embed-playing');
      el.videoStage.classList.remove('is-talk1-embed-booting', 'is-embed-awaiting-play');
    }
    hideTalk1EmbedOverlays();
    updateTalk1VideoUI();
  }

  function autoPlayTalk1MainVideo() {
    var lesson = getCurrentLesson();
    if (!isTalk1Lesson(lesson)) return;
    talk1Phase = 'main';
    userStartedEmbed = true;
    embedPendingPlay = true;
    hideTalk1EmbedOverlays();
    if (el.videoStage) {
      el.videoStage.classList.add('is-embed-mode', 'is-embed-visible', 'is-talk1-embed-booting');
      el.videoStage.classList.remove('is-embed-awaiting-play');
    }
    if (el.heroEmbed) {
      el.heroEmbed.classList.add('is-splash-hidden');
      el.heroEmbed.classList.remove('is-visible');
      var nextSrc = embedSrcWithParams(lesson.heroVisual.src, getTalk1EmbedParams(true));
      if (el.heroEmbed.src !== nextSrc) {
        destroyBunnyPlayer();
        el.heroEmbed.src = nextSrc;
        el.heroEmbed.onload = function () {
          setupBunnyPlayer();
        };
      } else if (!bunnyPlayer) {
        setupBunnyPlayer();
      }
    }
    playEmbedVideo();
    applyTalk1Volume();
    startTalk1ProgressPolling();
    updateTalk1VideoUI();
    setTimeout(function () {
      if (!isTalk1Lesson(getCurrentLesson())) return;
      if (talk1Phase !== 'main') return;
      if (!el.videoStage || !el.videoStage.classList.contains('is-talk1-embed-booting')) return;
      revealTalk1EmbedWhenPlaying();
    }, 2500);
  }

  function seekTalk1Unified(ratio) {
    var lesson = getCurrentLesson();
    if (!isTalk1Lesson(lesson)) return;
    var introSec = getTalk1IntroDurationSec(lesson);
    var total = getTalk1TotalDurationSec(lesson);
    var target = Math.max(0, Math.min(total, ratio * total));

    if (target < introSec) {
      talk1Phase = 'intro';
      talk1EmbedCurrentSec = 0;
      pauseEmbedVideo();
      if (el.heroEmbed) {
        el.heroEmbed.classList.add('is-splash-hidden');
        el.heroEmbed.classList.remove('is-visible');
      }
      if (el.videoStage) {
        el.videoStage.classList.add('is-splash-active');
        el.videoStage.classList.remove('is-splash-reveal', 'is-embed-playing');
      }
      showTitleSplash();
      if (el.splashAudio) {
        el.splashAudio.currentTime = target;
        if (isTalk1Playing()) el.splashAudio.play().catch(function () {});
      }
      introPlaybackStarted = true;
      return;
    }

    talk1Phase = 'main';
    hideTitleSplash();
    if (el.videoStage) el.videoStage.classList.remove('is-splash-active', 'is-splash-reveal', 'is-talk1-embed-booting');
    userStartedEmbed = true;
    talk1EmbedCurrentSec = Math.max(0, target - introSec);
    hideTalk1EmbedOverlays();

    function seekEmbed() {
      if (!bunnyPlayer || !bunnyPlayer.setCurrentTime) return;
      bunnyPlayer.setCurrentTime(talk1EmbedCurrentSec);
      applyTalk1Volume();
      if (isTalk1Playing()) {
        bunnyPlayer.play();
        revealTalk1EmbedWhenPlaying();
      } else {
        revealTalk1EmbedWhenPlaying();
      }
    }

    if (!bunnyPlayer) {
      ensureEmbedLoaded(lesson);
      setupBunnyPlayer();
      setTimeout(seekEmbed, 400);
    } else {
      seekEmbed();
    }
  }

  function toggleTalk1Fullscreen() {
    if (!el.videoStage) return;
    var doc = document;
    var active = doc.fullscreenElement || doc.webkitFullscreenElement;
    if (!active) {
      var req = el.videoStage.requestFullscreen || el.videoStage.webkitRequestFullscreen;
      if (req) req.call(el.videoStage);
      return;
    }
    var exit = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (exit) exit.call(doc);
  }

  function embedSrcWithParams(baseSrc, overrides) {
    var parts = String(baseSrc || '').split('?');
    var params = new URLSearchParams(parts[1] || '');
    Object.keys(overrides || {}).forEach(function (key) {
      params.set(key, overrides[key]);
    });
    return parts[0] + '?' + params.toString();
  }

  function parseEmbedEvent(data) {
    if (!data) return '';
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (err) {
        return data === 'ended' ? 'ended' : '';
      }
    }
    if (typeof data !== 'object') return '';
    if (data.event === 'ended' || data.event === 'finish') return 'ended';
    if (data.event === 'play') return 'play';
    if (data.event === 'pause') return 'pause';
    return '';
  }

  function setSplashSeriesText(node, value) {
    if (!node) return;
    var text = String(value || '').trim();
    node.textContent = text;
    node.hidden = !text;
  }

  function clearOutroTimers() {
    if (outroTimer) {
      clearTimeout(outroTimer);
      outroTimer = null;
    }
  }

  function resetHeroEmbed() {
    if (!el.heroEmbed) return;
    bunnyPlayer = null;
    embedIsPlaying = false;
    embedPendingPlay = false;
    userStartedEmbed = false;
    el.heroEmbed.classList.add('is-splash-hidden');
    el.heroEmbed.classList.remove('is-visible');
    el.heroEmbed.removeAttribute('src');
    if (el.videoStage) {
      el.videoStage.classList.remove(
        'is-embed-mode',
        'is-embed-visible',
        'is-embed-playing',
        'is-embed-awaiting-play',
        'is-embed-started'
      );
    }
  }

  function setTransportBtn(btn, enabled) {
    if (!btn) return;
    btn.disabled = !enabled;
    btn.classList.toggle('is-disabled', !enabled);
    btn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
  }

  function shouldShowVideoControls(lesson) {
    if (lessonMode !== 'watch' || !lesson) return false;
    if (isTalk1Lesson(lesson)) return true;
    if (isPromoWelcome(lesson)) return false;
    if (el.videoStage && el.videoStage.classList.contains('is-outro-active')) return false;
    if (isEmbedLesson(lesson) || getHeroSplash(lesson)) return true;
    if (isWelcomeLesson(lesson) && el.heroImage && !el.heroImage.hidden) return true;
    return !!(el.heroVisual && !el.heroVisual.hidden);
  }

  function updateVideoControlsState() {
    var lesson = getCurrentLesson();
    if (isPromoWelcome(lesson)) {
      if (el.playingBadge) el.playingBadge.hidden = true;
      if (el.videoStage) el.videoStage.classList.remove('is-transport-bar-visible');
      return;
    }
    var splashActive = !!(el.videoStage && el.videoStage.classList.contains('is-splash-active'));
    var splashReveal = !!(el.videoStage && el.videoStage.classList.contains('is-splash-reveal'));
    var outroActive = !!(el.videoStage && el.videoStage.classList.contains('is-outro-active'));
    var isEmbed = isEmbedLesson(lesson);
    var showControls = shouldShowVideoControls(lesson);

    if (el.videoStage) {
      el.videoStage.classList.toggle('is-transport-bar-visible', showControls);
    }

    if (!showControls) {
      if (el.playingBadge) el.playingBadge.hidden = true;
      return;
    }

    var isPlaying = false;
    if (splashActive && !splashReveal) {
      isPlaying = introPlaybackStarted && !introPlaybackPaused;
    } else if (isEmbed) {
      isPlaying = embedIsPlaying;
    } else if (isWelcomeLesson(lesson)) {
      isPlaying = !!(el.audio && !el.audio.paused);
    } else if (el.heroVisual && !el.heroVisual.hidden) {
      isPlaying = !el.heroVisual.paused;
    }

    setTransportBtn(el.videoBarPlay, !isPlaying);
    setTransportBtn(el.videoBarPause, isPlaying);
    setTransportBtn(el.videoBarRestart, true);

    var embedVisible = !!(el.videoStage && el.videoStage.classList.contains('is-embed-visible'));
    var embedStarted = userStartedEmbed || embedIsPlaying;
    var showEmbedFrame = embedStarted || (embedVisible && !splashActive && !outroActive);
    var showEmbedCenterPlay = isEmbed &&
      !splashActive &&
      !outroActive &&
      embedVisible &&
      showEmbedFrame &&
      !isPlaying &&
      !userStartedEmbed;
    var showWelcomeCenterPlay = isWelcomeLesson(lesson) &&
      !isEmbed &&
      !splashActive &&
      !outroActive &&
      lessonMode === 'watch' &&
      el.audio &&
      el.audio.paused;
    var showCenterPlay = showEmbedCenterPlay || showWelcomeCenterPlay;
    if (isTalk1Lesson(lesson)) {
      showCenterPlay = false;
      hideTalk1EmbedOverlays();
    }

    if (el.embedCenterPlay) el.embedCenterPlay.hidden = !showCenterPlay;
    if (el.embedPlayShield) el.embedPlayShield.hidden = !showCenterPlay;
    if (el.videoBarPlay) el.videoBarPlay.hidden = !!showCenterPlay;

    if (isEmbed && el.videoStage) {
      el.videoStage.classList.toggle('is-embed-playing', isPlaying && (!splashActive || splashReveal));
      el.videoStage.classList.toggle('is-embed-awaiting-play', !isPlaying && !splashActive && !outroActive);
      el.videoStage.classList.toggle('is-embed-started', showEmbedFrame);
    }

    if (el.playingBadge) el.playingBadge.hidden = !isPlaying || splashActive;
  }

  function setVideoTransportUI() {
    updateVideoControlsState();
  }

  function updateSplashTransportUI() {
    updateVideoControlsState();
  }

  function updateEmbedVideoUI() {
    if (!isEmbedLesson(getCurrentLesson())) return;
    if (isTalk1Lesson(getCurrentLesson())) {
      updateTalk1VideoUI();
      return;
    }
    updateVideoControlsState();
    if (el.videoSeek) {
      el.videoSeek.disabled = true;
      el.videoSeek.hidden = true;
    }
    if (el.videoTime) el.videoTime.textContent = '';
  }

  function destroyBunnyPlayer() {
    bunnyPlayer = null;
    embedIsPlaying = false;
    embedPendingPlay = false;
    userStartedEmbed = false;
  }

  function pauseEmbedIfAutostarted() {
    if (isTalk1Lesson(getCurrentLesson())) return;
    if (!bunnyPlayer || userStartedEmbed) return;
    try {
      bunnyPlayer.pause();
    } catch (err) {}
    embedIsPlaying = false;
    updateEmbedVideoUI();
  }

  function unmuteAndPlayEmbed() {
    if (!bunnyPlayer) return;
    if (isTalk1Lesson(getCurrentLesson())) {
      applyTalk1Volume();
    } else {
      if (bunnyPlayer.supports && bunnyPlayer.supports('method', 'unmute')) {
        bunnyPlayer.unmute();
      } else if (typeof bunnyPlayer.unmute === 'function') {
        bunnyPlayer.unmute();
      }
      if (bunnyPlayer.supports && bunnyPlayer.supports('method', 'setVolume')) {
        bunnyPlayer.setVolume(100);
      }
    }
    bunnyPlayer.play();
  }

  function setupBunnyPlayer() {
    if (!el.heroEmbed || !el.heroEmbed.src) return;
    if (typeof window.playerjs === 'undefined' || !window.playerjs.Player) {
      setTimeout(setupBunnyPlayer, 200);
      return;
    }
    var shouldPlay = embedPendingPlay;
    bunnyPlayer = null;
    embedIsPlaying = false;
    bunnyPlayer = new window.playerjs.Player(el.heroEmbed);
    bunnyPlayer.on('ready', function () {
      pauseEmbedIfAutostarted();
      if (isTalk1Lesson(getCurrentLesson()) && bunnyPlayer.getDuration) {
        bunnyPlayer.getDuration(function (duration) {
          if (duration > 0) talk1MainDurationSec = duration;
          updateTalk1VideoUI();
        });
      }
      updateEmbedVideoUI();
      if (userStartedEmbed && (shouldPlay || embedPendingPlay)) {
        embedPendingPlay = false;
        unmuteAndPlayEmbed();
      }
    });
    bunnyPlayer.on('play', function () {
      if (!userStartedEmbed) {
        pauseEmbedIfAutostarted();
        return;
      }
      embedIsPlaying = true;
      if (isTalk1Lesson(getCurrentLesson())) {
        revealTalk1EmbedWhenPlaying();
        talk1Phase = 'main';
      }
      updateEmbedVideoUI();
    });
    bunnyPlayer.on('pause', function () {
      if (!userStartedEmbed) {
        pauseEmbedIfAutostarted();
        return;
      }
      embedIsPlaying = false;
      updateEmbedVideoUI();
    });
    bunnyPlayer.on('ended', function () {
      embedIsPlaying = false;
      if (isTalk1Lesson(getCurrentLesson())) talk1Phase = 'ended';
      updateEmbedVideoUI();
    });
    if (isTalk1Lesson(getCurrentLesson())) {
      bunnyPlayer.on('timeupdate', function (data) {
        if (talk1Phase !== 'main') return;
        if (data && typeof data.seconds === 'number') {
          talk1EmbedCurrentSec = data.seconds;
        }
        updateTalk1VideoUI();
      });
    }
  }

  function playEmbedVideo() {
    userStartedEmbed = true;
    if (el.embedCenterPlay) el.embedCenterPlay.hidden = true;
    if (el.embedPlayShield) el.embedPlayShield.hidden = true;
    if (!bunnyPlayer) {
      embedPendingPlay = true;
      setupBunnyPlayer();
      return;
    }
    unmuteAndPlayEmbed();
  }

  function pauseEmbedVideo() {
    if (!bunnyPlayer) return;
    bunnyPlayer.pause();
  }

  function lessonVisualKey(lesson) {
    return course.id + ':' + ((lesson && lesson.id) || '');
  }

  function isIntroSplashActive(lesson) {
    return !!(el.videoStage &&
      el.videoStage.classList.contains('is-splash-active') &&
      introSplashLessonKey === lessonVisualKey(lesson));
  }

  function showTitleSplash() {
    if (!el.titleSplash) return;
    el.titleSplash.removeAttribute('hidden');
    el.titleSplash.classList.add('is-active');
  }

  function hideTitleSplash() {
    if (!el.titleSplash) return;
    el.titleSplash.setAttribute('hidden', '');
    el.titleSplash.classList.remove('is-active');
  }

  function ensureEmbedLoaded(lesson) {
    if (!el.heroEmbed || !lesson || !lesson.heroVisual) return;
    if (el.videoStage) {
      el.videoStage.classList.remove('is-image-mode', 'is-no-video');
      el.videoStage.classList.add('is-embed-mode');
    }
    el.heroEmbed.classList.add('is-splash-hidden');
    el.heroEmbed.classList.remove('is-visible');
    var embedParams = isTalk1Lesson(lesson)
      ? getTalk1EmbedParams(false)
      : {
        autoplay: 'false',
        loop: 'false',
        muted: 'true',
        preload: 'true',
        responsive: 'true',
        playerjs: 'true'
      };
    var nextSrc = embedSrcWithParams(lesson.heroVisual.src, embedParams);
    if (el.heroEmbed.src !== nextSrc) {
      el.heroEmbed.src = nextSrc;
      el.heroEmbed.onload = function () {
        setupBunnyPlayer();
      };
    } else if (!bunnyPlayer) {
      setupBunnyPlayer();
    }
  }

  function revealEmbedPlayer() {
    if (!el.heroEmbed) return;
    el.heroEmbed.classList.remove('is-splash-hidden');
    el.heroEmbed.classList.add('is-visible');
    if (el.videoStage) el.videoStage.classList.add('is-embed-visible');
    updateEmbedVideoUI();
  }

  function applyEmbedHero(lesson) {
    if (!el.heroEmbed || !el.heroVisual || !el.heroImage || !lesson || !lesson.heroVisual) return;

    userStartedEmbed = false;
    embedIsPlaying = false;

    el.heroImage.hidden = true;
    el.heroImage.removeAttribute('src');
    el.heroVisual.pause();
    el.heroVisual.hidden = true;

    if (el.videoStage) {
      el.videoStage.classList.remove('is-embed-visible', 'is-embed-playing', 'is-embed-awaiting-play', 'is-embed-started');
    }

    ensureEmbedLoaded(lesson);

    var splashConfig = getHeroSplash(lesson);
    if (splashConfig) prepareSplashAudio(splashConfig);

    if (splashConfig && lessonMode === 'watch') {
      if (!isIntroSplashActive(lesson)) {
        startTitleSplash(lesson);
      }
      return;
    }

    revealEmbedPlayer();
  }

  function mountHeroEmbed(lesson) {
    applyEmbedHero(lesson);
  }

  function cancelOutroSplash() {
    clearOutroTimers();
    if (el.outroAudio) {
      el.outroAudio.pause();
      el.outroAudio.removeAttribute('src');
    }
    if (el.outroSplash) el.outroSplash.hidden = true;
    if (el.videoStage) el.videoStage.classList.remove('is-outro-active', 'is-outro-reveal');
    if (el.heroEmbed) el.heroEmbed.classList.remove('is-splash-hidden');
  }

  function clearSplashTimers() {
    if (splashFadeTimer) {
      clearTimeout(splashFadeTimer);
      splashFadeTimer = null;
    }
    if (splashFallbackTimer) {
      clearTimeout(splashFallbackTimer);
      splashFallbackTimer = null;
    }
  }

  function cancelTitleSplash() {
    clearSplashTimers();
    introPlaybackStarted = false;
    introPlaybackPaused = false;
    introRevealRemainingMs = 0;
    introRevealTimerStartedAt = 0;
    introSplashLessonKey = '';
    if (el.splashAudio) {
      el.splashAudio.pause();
      el.splashAudio.removeAttribute('src');
    }
    hideTitleSplash();
    if (el.videoStage) {
      el.videoStage.classList.remove('is-splash-active', 'is-splash-reveal', 'is-transport-bar-visible');
    }
    if (el.heroVisual) el.heroVisual.classList.remove('is-splash-hidden');
    if (el.heroEmbed) {
      el.heroEmbed.classList.add('is-splash-hidden');
      el.heroEmbed.classList.remove('is-visible');
    }
    cancelOutroSplash();
    updateVideoControlsState();
  }

  function finishIntroSplash(sequenceId) {
    if (sequenceId !== splashSequenceId) return;
    var lesson = getCurrentLesson();
    if (el.splashAudio) el.splashAudio.pause();
    introPlaybackStarted = false;
    introPlaybackPaused = false;
    introSplashLessonKey = '';
    hideTitleSplash();
    if (el.videoStage) el.videoStage.classList.remove('is-splash-active', 'is-splash-reveal');
    if (isEmbedLesson(lesson)) {
      if (isTalk1Lesson(lesson)) {
        autoPlayTalk1MainVideo();
      } else {
        revealEmbedPlayer();
        updateEmbedVideoUI();
      }
      return;
    }
    updateVideoUI();
  }

  function preloadHeroEmbed(lesson) {
    if (!el.heroEmbed || !lesson || !lesson.heroVisual) return;
    if (el.videoStage) el.videoStage.classList.add('is-embed-mode');
    el.heroEmbed.classList.add('is-splash-hidden');
    el.heroEmbed.classList.remove('is-visible');
    el.heroEmbed.src = embedSrcWithParams(lesson.heroVisual.src, {
      autoplay: 'false',
      loop: 'false',
      muted: 'true',
      preload: 'true',
      responsive: 'true',
      playerjs: 'true'
    });
  }

  function revealHeroEmbed(lesson) {
    if (!el.heroEmbed || !lesson || !lesson.heroVisual) return;
    if (!el.heroEmbed.src) {
      preloadHeroEmbed(lesson);
    }
    el.heroEmbed.classList.remove('is-splash-hidden');
    el.heroEmbed.classList.add('is-visible');
    if (el.videoStage) {
      el.videoStage.classList.add('is-embed-mode', 'is-embed-visible');
    }
  }

  function prepareSplashAudio(splash) {
    if (!splash || !splash.introAudio || !el.splashAudio) return;
    var src = encodeMediaPath(splash.introAudio);
    var track = splash.introAudio;
    var current = el.splashAudio.currentSrc || el.splashAudio.src || '';
    if (!current || current.indexOf(track) === -1) {
      el.splashAudio.src = src;
      el.splashAudio.preload = 'auto';
      el.splashAudio.load();
      return;
    }
    el.splashAudio.preload = 'auto';
    if (el.splashAudio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      el.splashAudio.load();
    }
  }

  function playSplashAudioNow(fromStart) {
    if (!el.splashAudio || !el.splashAudio.src) return;
    if (fromStart) el.splashAudio.currentTime = 0;

    function tryPlay() {
      var attempt = el.splashAudio.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (el.splashAudio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
      return;
    }

    tryPlay();
    el.splashAudio.addEventListener('loadeddata', function onLoadedData() {
      el.splashAudio.removeEventListener('loadeddata', onLoadedData);
      if (el.splashAudio.paused) tryPlay();
    }, { once: true });
  }

  function updateSplashAudioUI() {
    if (isTalk1Lesson(getCurrentLesson())) updateTalk1VideoUI();
    else updateSplashTransportUI();
  }

  function clearIntroRevealTimer() {
    if (splashFallbackTimer) {
      clearTimeout(splashFallbackTimer);
      splashFallbackTimer = null;
    }
  }

  function scheduleIntroReveal(sequenceId, delayMs) {
    clearIntroRevealTimer();
    introRevealRemainingMs = delayMs;
    introRevealTimerStartedAt = Date.now();
    splashFallbackTimer = setTimeout(function () {
      if (sequenceId !== splashSequenceId) return;
      beginTitleSplashReveal(sequenceId);
    }, delayMs);
  }

  function pauseIntroPlayback() {
    if (!introPlaybackStarted || introPlaybackPaused) return;
    clearIntroRevealTimer();
    var elapsed = Date.now() - introRevealTimerStartedAt;
    introRevealRemainingMs = Math.max(0, introRevealRemainingMs - elapsed);
    if (el.splashAudio) el.splashAudio.pause();
    introPlaybackPaused = true;
    updateSplashAudioUI();
  }

  function resumeIntroPlayback(sequenceId) {
    if (!introPlaybackStarted || !introPlaybackPaused) return;
    playSplashAudioNow(false);
    introPlaybackPaused = false;
    scheduleIntroReveal(sequenceId, introRevealRemainingMs);
    updateSplashAudioUI();
  }

  function restartIntroSplash() {
    clearSplashTimers();
    introPlaybackStarted = false;
    introPlaybackPaused = false;
    introRevealRemainingMs = 0;
    introRevealTimerStartedAt = 0;
    if (el.splashAudio) {
      el.splashAudio.pause();
      el.splashAudio.currentTime = 0;
    }
    if (el.videoStage) el.videoStage.classList.remove('is-splash-reveal');
    updateSplashAudioUI();
  }

  function startIntroPlayback(sequenceId) {
    if (sequenceId !== splashSequenceId || introPlaybackStarted) return;

    var lesson = getCurrentLesson();
    var splash = getHeroSplash(lesson);
    if (!splash) return;

    introPlaybackStarted = true;
    introPlaybackPaused = false;
    var introDurationMs = getIntroDurationMs(splash);

    prepareSplashAudio(splash);
    playSplashAudioNow(true);
    scheduleIntroReveal(sequenceId, introDurationMs);
    if (isTalk1Lesson(lesson)) {
      talk1Phase = 'intro';
      startTalk1ProgressPolling();
    }
    updateSplashAudioUI();
  }

  function toggleIntroPlayback(sequenceId) {
    if (!introPlaybackStarted) {
      startIntroPlayback(sequenceId);
      return;
    }
    if (introPlaybackPaused) resumeIntroPlayback(sequenceId);
    else pauseIntroPlayback();
  }

  function handleVideoRestartClick(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    var lesson = getCurrentLesson();
    if (el.videoStage && el.videoStage.classList.contains('is-splash-active')) {
      restartIntroSplash();
      return;
    }
    if (isEmbedLesson(lesson)) {
      restartEmbedTalk(lesson);
      return;
    }
    if (!el.heroVisual || el.heroVisual.hidden) return;
    if (isWelcomeLesson(lesson)) {
      resetWelcomeNarration(lesson);
      return;
    }
    el.heroVisual.pause();
    el.heroVisual.currentTime = 0;
    if (getHeroSplash(lesson)) {
      if (startTitleSplash(lesson)) {
        startIntroPlayback(splashSequenceId);
      }
      return;
    }
    configureHeroVideoPlayback(lesson);
    var playAttempt = el.heroVisual.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {
        if (!isWelcomeLesson(lesson)) return;
        el.heroVisual.muted = true;
        el.heroVisual.play().catch(function () {});
      });
    }
    updateVideoUI();
  }

  function bindPressFeedback(btn) {
    if (!btn) return;
    function pressOn() {
      btn.classList.add('is-pressed');
    }
    function pressOff() {
      btn.classList.remove('is-pressed');
    }
    btn.addEventListener('mousedown', pressOn);
    btn.addEventListener('mouseup', pressOff);
    btn.addEventListener('mouseleave', pressOff);
    btn.addEventListener('touchstart', pressOn, { passive: true });
    btn.addEventListener('touchend', pressOff);
    btn.addEventListener('touchcancel', pressOff);
  }

  function beginTitleSplashReveal(sequenceId) {
    if (sequenceId !== splashSequenceId) return;
    if (!el.videoStage) return;
    var lesson = getCurrentLesson();
    if (el.splashAudio) el.splashAudio.pause();
    el.videoStage.classList.add('is-splash-reveal');

    if (isEmbedLesson(lesson)) {
      updateVideoControlsState();
      splashFadeTimer = setTimeout(function () {
        finishIntroSplash(sequenceId);
      }, 900);
      return;
    }

    introPlaybackStarted = false;
    introPlaybackPaused = false;
    updateVideoControlsState();

    if (!el.heroVisual) return;
    el.heroVisual.classList.remove('is-splash-hidden');
    el.heroVisual.muted = false;
    var playAttempt = el.heroVisual.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {
        el.heroVisual.muted = true;
        el.heroVisual.play().catch(function () {});
      });
    }
    splashFadeTimer = setTimeout(function () {
      finishIntroSplash(sequenceId);
    }, 1400);
  }

  function populateSplashCard(seriesEl, kickerEl, titleEl, splash, lesson) {
    setSplashSeriesText(seriesEl, splash.series);
    if (kickerEl) kickerEl.textContent = splash.kicker || 'Talk';
    if (titleEl) titleEl.textContent = splash.title || displayLessonTitle(lesson.title);
    if (el.titleSplashLogo) {
      if (splash.logoSrc) {
        el.titleSplashLogo.src = encodeMediaPath(splash.logoSrc);
        el.titleSplashLogo.removeAttribute('hidden');
      } else {
        el.titleSplashLogo.setAttribute('hidden', '');
        el.titleSplashLogo.removeAttribute('src');
      }
    }
  }

  function getIntroDurationMs(splash) {
    var duration = Number(splash && splash.introDurationMs);
    return duration > 0 ? duration : 7000;
  }

  function startOutroSplash(lesson) {
    var splash = getHeroSplash(lesson);
    var outro = splash && splash.outro;
    if (!outro || !el.outroSplash || el.outroSplash.hidden === false) return;

    cancelOutroSplash();
    populateSplashCard(
      el.outroSplashSeries,
      el.outroSplashKicker,
      el.outroSplashTitle,
      outro,
      lesson
    );
    if (el.outroSplashSubtitle) {
      el.outroSplashSubtitle.textContent = outro.subtitle || 'Thanks for watching';
    }

    if (el.heroEmbed) el.heroEmbed.classList.add('is-splash-hidden');
    el.outroSplash.hidden = false;
    if (el.videoStage) {
      el.videoStage.classList.add('is-outro-active');
      el.videoStage.classList.remove('is-outro-reveal');
    }
    if (el.playingBadge) el.playingBadge.hidden = true;
    setTransportBtn(el.videoBarPlay, false);
    setTransportBtn(el.videoBarPause, false);
    setTransportBtn(el.videoBarRestart, false);

    function finishOutro() {
      if (el.videoStage) el.videoStage.classList.add('is-outro-reveal');
      outroTimer = setTimeout(function () {
        cancelOutroSplash();
      }, 1400);
    }

    if (outro.outroAudio && el.outroAudio) {
      el.outroAudio.src = encodeMediaPath(outro.outroAudio);
      el.outroAudio.currentTime = 0;
      el.outroAudio.load();
      el.outroAudio.addEventListener('ended', finishOutro, { once: true });
      el.outroAudio.addEventListener('error', finishOutro, { once: true });
      var outroPlay = el.outroAudio.play();
      if (outroPlay && typeof outroPlay.catch === 'function') {
        outroPlay.catch(finishOutro);
      }
      outroTimer = setTimeout(function () {
        if (!el.outroAudio.paused) return;
        finishOutro();
      }, 12000);
      return;
    }

    outroTimer = setTimeout(finishOutro, 4200);
  }

  function startTitleSplash(lesson) {
    var splash = getHeroSplash(lesson);
    if (!splash || !el.titleSplash) return false;

    cancelTitleSplash();
    ++splashSequenceId;
    introSplashLessonKey = lessonVisualKey(lesson);

    populateSplashCard(
      el.titleSplashSeries,
      el.titleSplashKicker,
      el.titleSplashTitle,
      splash,
      lesson
    );

    showTitleSplash();
    introPlaybackStarted = false;
    introPlaybackPaused = false;
    introRevealRemainingMs = 0;
    introRevealTimerStartedAt = 0;
    if (el.videoStage) el.videoStage.classList.add('is-splash-active');
    if (el.heroVisual) el.heroVisual.classList.add('is-splash-hidden');
    if (el.heroEmbed) {
      el.heroEmbed.classList.add('is-splash-hidden');
      el.heroEmbed.classList.remove('is-visible');
    }
    ensureEmbedLoaded(lesson);

    prepareSplashAudio(splash);
    updateVideoControlsState();

    return true;
  }

  function bindEmbedMessages() {
    if (embedMessageBound) return;
    embedMessageBound = true;
    window.addEventListener('message', function (event) {
      if (event.origin !== 'https://player.mediadelivery.net') return;
      var lesson = getCurrentLesson();
      if (!isEmbedLesson(lesson)) return;
      var evt = parseEmbedEvent(event.data);
      if (evt === 'play') {
        if (!userStartedEmbed) {
          pauseEmbedIfAutostarted();
          return;
        }
        embedIsPlaying = true;
        if (isTalk1Lesson(lesson)) revealTalk1EmbedWhenPlaying();
        updateEmbedVideoUI();
      }
      if (evt === 'pause') {
        embedIsPlaying = false;
        updateEmbedVideoUI();
      }
      if (evt === 'ended') {
        embedIsPlaying = false;
        if (isTalk1Lesson(lesson)) talk1Phase = 'ended';
        updateEmbedVideoUI();
        if (!isTalk1Lesson(lesson)) startOutroSplash(lesson);
      }
    });
  }

  function flattenItems() {
    var items = [];
    course.modules.forEach(function (module, mIndex) {
      (module.lessons || []).forEach(function (lesson, lIndex) {
        items.push({ module: mIndex, lesson: lIndex, lessonData: lesson });
      });
    });
    return items;
  }

  function isSplitLesson(lesson) {
    return lesson && lesson.layout === 'split-right' && Array.isArray(lesson.sections) && lesson.sections.length > 0;
  }

  function displayLessonTitle(title) {
    var t = String(title || '');
    if (/^welcome video$/i.test(t.trim())) return 'Welcome Video';
    return t;
  }

  function sidebarTitleHtml(title) {
    if (/^welcome video$/i.test(String(title || '').trim())) {
      return '<span class="player-v2-lesson-card__title">Welcome Video</span>';
    }
    var match = /^(?:Lesson|Talk)\s+(\d+):\s*(.+)$/i.exec(String(title || ''));
    if (!match) {
      return '<span class="player-v2-lesson-card__title">' + escText(title) + '</span>';
    }
    return '<span class="player-v2-lesson-card__title">' +
      '<span class="player-v2-hand-accent">Talk ' + escText(match[1]) + ':</span> ' +
      escText(match[2].trim()) + '</span>';
  }

  function mainTitleHtml(title) {
    if (/^welcome video$/i.test(String(title || '').trim())) {
      return '<span class="player-v2-hand-accent">Welcome Video</span>';
    }
    var match = /^(Talk)\s+(\d+):\s*(.+)$/i.exec(String(title || ''));
    if (match) {
      return '<span class="player-v2-hand-accent">Talk ' + escText(match[2]) + ':</span> ' + escText(match[3]);
    }
    return escText(title);
  }

  function truncate(str, len) {
    var s = String(str || '');
    if (s.length <= len) return s;
    return s.slice(0, len - 1).trim() + '…';
  }

  function parseDurationMinutes(duration) {
    var raw = String(duration || '').trim();
    var m = /^(\d+)\s*m/i.exec(raw);
    if (m) return Number(m[1]);
    var parts = raw.split(':');
    if (parts.length === 2) return Number(parts[0]) + (Number(parts[1]) >= 30 ? 1 : 0);
    return 0;
  }

  function totalCourseMinutes() {
    return flattenItems().reduce(function (sum, item) {
      return sum + parseDurationMinutes(item.lessonData.duration);
    }, 0);
  }

  function doneLessonCount(progressPct, total) {
    return Math.max(0, Math.min(total, Math.round((progressPct / 100) * total)));
  }

  function buildSectionsHtml(lesson) {
    var sections = lesson.sections;
    if (!sections) return '';
    return sections.map(function (sec, i) {
      if (sec.type === 'objectives') return '';

      var sid = 'player-v2-sec-' + i;
      var h = '<section class="player-v2-section-card" aria-labelledby="' + sid + '">';
      h += '<h3 id="' + sid + '" class="player-v2-section-card__title">' + escText(sec.title) + '</h3>';

      if (sec.paragraphs && sec.paragraphs.length) {
        sec.paragraphs.forEach(function (p) {
          h += '<p class="player-v2-section-card__p">' + escText(p) + '</p>';
        });
      }

      if (sec.bullets && sec.bullets.length && sec.type !== 'objectives') {
        h += '<ul class="player-v2-section-card__list">';
        sec.bullets.forEach(function (b) {
          h += '<li>' + escText(b) + '</li>';
        });
        h += '</ul>';
      }

      if (sec.type === 'downloads' && sec.downloads && sec.downloads.length) {
        h += '<div class="player-v2-downloads">';
        sec.downloads.forEach(function (dl) {
          var isPlaceholder = !dl.href || dl.href.charAt(0) === '#';
          h += '<a class="player-v2-download-btn' + (isPlaceholder ? ' is-placeholder' : '') + '" href="' +
            escText(dl.href || '#') + '"' + (isPlaceholder ? ' aria-disabled="true"' : '') + '>' +
            '<span class="player-v2-download-btn__label">' + escText(dl.label) + '</span>';
          if (dl.description) {
            h += '<span class="player-v2-download-btn__desc">' + escText(dl.description) + '</span>';
          }
          h += '</a>';
        });
        h += '</div>';
      }

      if (sec.type === 'scripts' && sec.scripts && sec.scripts.length) {
        h += '<ul class="player-v2-section-card__scripts">';
        sec.scripts.forEach(function (line) {
          h += '<li>' + escText(line) + '</li>';
        });
        h += '</ul>';
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

  function progressCopyMessage(done, total) {
    if (done === 0) return "Whenever you're ready, start with the welcome.";
    if (done >= total) return "All done. You've got this, and so does your little one.";
    if (done === 1) return 'Welcome complete. Talk 1 is ready to start.';
    if (done >= total - 1) return "Just one to go. You're nearly there.";
    return "You're well on your way. Keep it relaxed.";
  }

  function showCompleteToast(doneCount) {
    var total = flattenItems().length;
    var msgs = [
      "Lovely. That's one talk done.",
      'Nicely done. Small talks, big difference.',
      "You're building real momentum now.",
      'Look at you go. Keep it gentle.',
      'Almost there. Your child is lucky to have you.'
    ];
    var msg = doneCount >= total
      ? 'You did it. Every talk complete.'
      : (msgs[Math.min(doneCount, msgs.length) - 1] || msgs[0]);

    if (!el.toast) return;
    el.toast.innerHTML =
      '<span class="player-v2-toast__icon" aria-hidden="true">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '</span>' +
      '<span>' + escText(msg) + '</span>';
    el.toast.hidden = false;

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      if (el.toast) el.toast.hidden = true;
    }, 3200);
  }

  function buildWaveform() {
    var html = waveHeights.map(function (h) {
      return '<span style="height:' + h + 'px"></span>';
    }).join('');
    if (el.waveform) el.waveform.innerHTML = html;
    if (el.readWaveform) el.readWaveform.innerHTML = html;
    updateWaveformProgress();
  }

  function paintWaveform(container) {
    if (!container || !el.audio) return;
    var duration = el.audio.duration || 0;
    var current = el.audio.currentTime || 0;
    var pct = duration > 0 ? current / duration : 0;
    var bars = container.querySelectorAll('span');
    var total = bars.length;
    Array.prototype.forEach.call(bars, function (bar, i) {
      var filled = ((i + 0.5) / total) <= pct;
      bar.style.background = filled ? '#E08B3C' : '#E7CBA3';
    });
  }

  function updateWaveformProgress() {
    paintWaveform(el.waveform);
    paintWaveform(el.readWaveform);
  }

  function updateSeekTrack(track, fill, knob, percent) {
    var pct = Math.max(0, Math.min(100, percent));
    if (fill) fill.style.width = pct + '%';
    if (knob) knob.style.left = pct + '%';
    if (track) track.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function seekAudioToRatio(ratio) {
    if (!el.audio || !el.audio.duration) return;
    var clamped = Math.max(0, Math.min(1, ratio));
    el.audio.currentTime = clamped * el.audio.duration;
    updateAudioUI();
  }

  function seekAudioFromEvent(track, clientX) {
    if (!track) return;
    var rect = track.getBoundingClientRect();
    if (!rect.width) return;
    seekAudioToRatio((clientX - rect.left) / rect.width);
  }

  function toggleAudioPlayback() {
    if (!el.audio) return;
    var lesson = getCurrentLesson();
    if (el.audio.paused) {
      ensureLessonAudio(lesson);
      if (el.heroVisual) el.heroVisual.pause();
      el.audio.play().catch(function () { if (el.error) el.error.hidden = false; });
    } else {
      el.audio.pause();
    }
    updateAudioUI();
  }

  function setAudioPlayButtons(isPlaying) {
    [el.listenPlay, el.readPlay].forEach(function (btn) {
      if (!btn) return;
      btn.classList.toggle('is-playing', isPlaying);
      btn.setAttribute('aria-label', isPlaying ? 'Pause audio' : 'Play audio');
    });
  }

  function renderReadTranscript(lesson) {
    if (!el.readTranscript) return;
    if (lesson.readScript && lesson.readScript.length) {
      el.readTranscript.innerHTML =
        '<div class="player-v2-read-script">' +
        lesson.readScript.map(function (sec, i) {
          var sid = 'player-v2-read-sec-' + i;
          var h = '<section class="player-v2-section-card player-v2-section-card--read" aria-labelledby="' + sid + '">';
          h += '<h3 id="' + sid + '" class="player-v2-section-card__title">' + escText(sec.title) + '</h3>';
          (sec.paragraphs || []).forEach(function (p) {
            h += '<p class="player-v2-section-card__p">' + escText(p) + '</p>';
          });
          h += '</section>';
          return h;
        }).join('') +
        '</div>';
      return;
    }
    var transcript = lesson.audio && lesson.audio.transcript;
    if (!transcript) {
      el.readTranscript.innerHTML = '<p>Transcript is not available for this talk yet.</p>';
      return;
    }
    if (Array.isArray(transcript)) {
      el.readTranscript.innerHTML = transcript.map(function (p) {
        return '<p>' + escText(p) + '</p>';
      }).join('');
      return;
    }
    el.readTranscript.innerHTML = '<p>' + escText(transcript) + '</p>';
  }

  function updateCompleteButton(progressPct, totalLessons) {
    if (!el.complete) return;
    var absIdx = absoluteLessonIndex();
    var done = doneLessonCount(progressPct, totalLessons);
    var isComplete = absIdx < done;
    el.complete.classList.toggle('is-complete', isComplete);
    var textEl = el.complete.querySelector('.player-v2-lesson-toolbar__complete-text');
    if (textEl) textEl.textContent = isComplete ? 'Completed' : 'Mark complete';
  }

  function renderCallout(lesson) {
    if (!el.callout) return;
    var objectives = (lesson.sections || []).filter(function (s) {
      return s.type === 'objectives' && s.bullets && s.bullets.length;
    })[0];

    if (!objectives) {
      el.callout.hidden = true;
      el.callout.innerHTML = '';
      return;
    }

    el.callout.hidden = false;
    el.callout.innerHTML =
      '<h3 class="player-v2-callout__title">In this talk, you&rsquo;ll&hellip;</h3>' +
      '<ul class="player-v2-callout__list">' +
      objectives.bullets.map(function (b) {
        return '<li>' + escText(b) + '</li>';
      }).join('') +
      '</ul>';
  }

  function renderProgressCard(all, progressPct) {
    var total = all.length;
    var done = doneLessonCount(progressPct, total);
    var mins = totalCourseMinutes();

    if (el.progressFill) {
      el.progressFill.style.width = progressPct + '%';
      var bar = el.progressFill.parentElement;
      if (bar) {
        bar.setAttribute('aria-valuenow', String(progressPct));
        bar.setAttribute('aria-valuemax', '100');
      }
    }
    if (el.progressCount) el.progressCount.textContent = done + ' of ' + total;
    if (el.progressMeta) {
      el.progressMeta.textContent = mins + ' min of talks · ' + total + ' lessons';
    }
    if (el.progressCopy) {
      el.progressCopy.textContent = progressCopyMessage(done, total);
    }
  }

  function lessonStatusBadgeHtml(lesson, isDone) {
    if (isDone) {
      return '<span class="player-v2-lesson-card__completed">Completed</span>';
    }
    if (isLessonSoon(lesson)) {
      return '<span class="player-v2-lesson-card__badge player-v2-lesson-card__badge--soon">Coming soon</span>';
    }
    if (isLessonReady(lesson)) {
      return '<span class="player-v2-lesson-card__badge player-v2-lesson-card__badge--ready">Ready to start</span>';
    }
    return '';
  }

  function renderSidebarCourseNav(all, progressPct) {
    if (!el.sidebarCourseNav) return;
    var done = doneLessonCount(progressPct, all.length);

    el.sidebarCourseNav.innerHTML = all.map(function (entry, index) {
      var lesson = entry.lessonData;
      var active = entry.module === moduleIndex && entry.lesson === lessonIndex;
      var isDone = index < done;
      var soon = isLessonSoon(lesson);
      var isWelcome = /^welcome video$/i.test(String(lesson.title || '').trim());
      var cls = 'player-v2-lesson-card' +
        (active ? ' is-active' : '') +
        (isDone ? ' is-done' : '') +
        (isWelcome ? ' is-welcome' : '') +
        (soon ? ' is-soon' : '');

      return '' +
        '<button type="button" class="' + cls + '" data-module="' + entry.module + '" data-lesson="' + entry.lesson + '"' +
          (soon ? ' disabled aria-disabled="true"' : '') + '>' +
          '<span class="player-v2-lesson-card__ring" aria-hidden="true"></span>' +
          '<span class="player-v2-lesson-card__body">' +
            sidebarTitleHtml(lesson.title) +
            '<span class="player-v2-lesson-card__subtitle">' + escText(truncate(lesson.summary, 72)) + '</span>' +
            lessonStatusBadgeHtml(lesson, isDone) +
          '</span>' +
          '<span class="player-v2-lesson-card__duration">' + escText(lesson.duration) + '</span>' +
        '</button>';
    }).join('');
  }

  function renderPills(lesson) {
    if (!el.pills) return;
    var pills = ['<span class="player-v2-pill">' + escText(lesson.duration) + '</span>'];
    if (/welcome/i.test(lesson.title)) {
      pills.push('<span class="player-v2-pill player-v2-pill--soft">&#9825; No perfect script needed</span>');
    } else {
      pills.push('<span class="player-v2-pill player-v2-pill--soft">Parent-led pace</span>');
    }
    el.pills.innerHTML = pills.join('');
  }

  function renderCurriculum() {
    if (!el.nav) return;
    var html = course.modules.map(function (module, mIndex) {
      var items = module.lessons.map(function (lesson, lIndex) {
        var active = mIndex === moduleIndex && lIndex === lessonIndex ? ' is-active' : '';
        var soon = isLessonSoon(lesson);
        var disabledAttr = soon ? ' disabled aria-disabled="true"' : '';
        var soonLabel = soon ? ' · Coming soon' : '';
        return '' +
          '<button class="player-v2-nav-lesson' + active + (soon ? ' is-soon' : '') + '" data-module="' + mIndex + '" data-lesson="' + lIndex + '"' + disabledAttr + '>' +
          '  <strong>' + escText(lesson.title) + soonLabel + '</strong>' +
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
        if (btn.disabled || btn.classList.contains('is-soon')) return;
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
    if (!el.audio) return;
    var current = el.audio.currentTime || 0;
    var duration = el.audio.duration || 0;
    var percent = duration > 0 ? (current / duration) * 100 : 0;
    var timeLabel = formatTime(current) + ' / ' + formatTime(duration);
    if (el.time) el.time.textContent = timeLabel;
    if (el.readTime) el.readTime.textContent = timeLabel;
    updateSeekTrack(el.seekTrack, el.seekFill, el.seekKnob, percent);
    updateSeekTrack(el.readSeekTrack, el.readSeekFill, el.readSeekKnob, percent);
    setAudioPlayButtons(!el.audio.paused);
    updateWaveformProgress();
  }

  function updateVideoUI() {
    var lesson = getCurrentLesson();
    if (isEmbedLesson(lesson)) {
      updateEmbedVideoUI();
      return;
    }
    var welcome = isWelcomeLesson(lesson);
    if ((!el.heroVisual || el.heroVisual.hidden) && !(welcome && el.heroImage && !el.heroImage.hidden)) return;
    var welcome = isWelcomeLesson(lesson);
    if (el.videoSeek) {
      el.videoSeek.hidden = false;
      el.videoSeek.disabled = false;
    }
    var current = welcome && el.audio ? (el.audio.currentTime || 0) : (el.heroVisual.currentTime || 0);
    var duration = welcome && el.audio && el.audio.duration
      ? el.audio.duration
      : (el.heroVisual.duration || 0);
    var percent = duration > 0 ? Math.round((current / duration) * 100) : 0;
    if (el.videoSeek) el.videoSeek.value = percent;
    if (el.videoTime) {
      el.videoTime.textContent = formatTime(current) + ' / ' + formatTime(duration);
    }
    updateVideoControlsState();
  }

  function isWelcomeLesson(lesson) {
    return /^welcome video$/i.test(String((lesson && lesson.title) || '').trim());
  }

  function configureHeroVideoPlayback(lesson) {
    if (!el.heroVisual) return;
    var welcome = isWelcomeLesson(lesson);
    var hasSplash = !!getHeroSplash(lesson);
    el.heroVisual.muted = hasSplash || welcome;
    el.heroVisual.loop = !!welcome;
    if (welcome) {
      el.heroVisual.setAttribute('muted', '');
      el.heroVisual.setAttribute('loop', '');
      el.heroVisual.setAttribute('playsinline', '');
      el.heroVisual.setAttribute('webkit-playsinline', '');
    } else {
      el.heroVisual.removeAttribute('loop');
    }
  }

  function restartEmbedTalk(lesson) {
    pauseEmbedVideo();
    resetTalk1PlayerState();
    if (el.heroEmbed) {
      el.heroEmbed.classList.add('is-splash-hidden');
      el.heroEmbed.classList.remove('is-visible');
      el.heroEmbed.removeAttribute('src');
    }
    destroyBunnyPlayer();
    if (el.videoStage) {
      el.videoStage.classList.remove('is-embed-visible', 'is-embed-playing', 'is-embed-awaiting-play', 'is-embed-started');
    }
    cancelOutroSplash();
    startTitleSplash(lesson);
  }

  function handleVideoPlayClick(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (el.videoBarPlay && e && e.currentTarget === el.videoBarPlay && el.videoBarPlay.disabled) return;
    var lesson = getCurrentLesson();
    if (isTalk1Lesson(lesson)) {
      if (el.videoStage && el.videoStage.classList.contains('is-splash-active')) {
        if (!introPlaybackStarted) {
          talk1Phase = 'intro';
          startIntroPlayback(splashSequenceId);
        } else if (introPlaybackPaused) {
          resumeIntroPlayback(splashSequenceId);
        }
        updateTalk1VideoUI();
        return;
      }
      if (talk1Phase === 'main' || talk1Phase === 'ended') {
        talk1Phase = 'main';
        playEmbedVideo();
        startTalk1ProgressPolling();
        updateTalk1VideoUI();
        return;
      }
    }
    if (el.videoStage && el.videoStage.classList.contains('is-splash-active')) {
      if (!introPlaybackStarted) startIntroPlayback(splashSequenceId);
      else if (introPlaybackPaused) resumeIntroPlayback(splashSequenceId);
      return;
    }
    if (isEmbedLesson(lesson)) {
      playEmbedVideo();
      return;
    }
    if (isWelcomeLesson(lesson) &&
        ((el.heroVisual && !el.heroVisual.hidden) || (el.heroImage && !el.heroImage.hidden))) {
      playWelcomeNarration(lesson);
      if (el.embedCenterPlay) el.embedCenterPlay.hidden = true;
      if (el.embedPlayShield) el.embedPlayShield.hidden = true;
      updateVideoUI();
      return;
    }
    if (!el.heroVisual || el.heroVisual.hidden || !el.heroVisual.paused) return;
    if (getHeroSplash(lesson) && el.videoStage && el.videoStage.classList.contains('is-splash-active')) {
      beginTitleSplashReveal(splashSequenceId);
      return;
    }
    var playAttempt = el.heroVisual.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {
        updateVideoUI();
      });
    }
    updateVideoUI();
  }

  function handleVideoPauseClick() {
    if (el.videoBarPause && el.videoBarPause.disabled) return;
    var lesson = getCurrentLesson();
    if (isTalk1Lesson(lesson)) {
      if (talk1Phase === 'intro' || (el.videoStage && el.videoStage.classList.contains('is-splash-active'))) {
        pauseIntroPlayback();
        updateTalk1VideoUI();
        return;
      }
      if (talk1Phase === 'main') {
        pauseEmbedVideo();
        updateTalk1VideoUI();
        return;
      }
    }
    if (el.videoStage && el.videoStage.classList.contains('is-splash-active')) {
      pauseIntroPlayback();
      return;
    }
    if (isEmbedLesson(lesson)) {
      pauseEmbedVideo();
      return;
    }
    if (isWelcomeLesson(lesson)) {
      pauseWelcomeNarration();
      updateVideoUI();
      return;
    }
    if (!el.heroVisual || el.heroVisual.hidden) return;
    el.heroVisual.pause();
    updateVideoUI();
  }

  function toggleHeroVideo() {
    var lesson = getCurrentLesson();
    if (isEmbedLesson(lesson)) {
      if (embedIsPlaying) pauseEmbedVideo();
      else playEmbedVideo();
      return;
    }
    if (!el.heroVisual || el.heroVisual.hidden) return;
    if (getHeroSplash(lesson) && el.videoStage && el.videoStage.classList.contains('is-splash-active')) {
      beginTitleSplashReveal(splashSequenceId);
      return;
    }
    var welcome = isWelcomeLesson(lesson);

    if (welcome) {
      if (el.audio && el.audio.paused) playWelcomeNarration(lesson);
      else pauseWelcomeNarration();
      updateVideoUI();
      return;
    }

    if (el.heroVisual.paused) {
      var playAttempt = el.heroVisual.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {
          updateVideoUI();
        });
      }
    } else {
      el.heroVisual.pause();
    }
    updateVideoUI();
  }

  function setLessonMode(mode) {
    lessonMode = mode;
    el.body.classList.remove('player-v2-mode-watch', 'player-v2-mode-listen', 'player-v2-mode-read');
    el.body.classList.add('player-v2-mode-' + mode);

    Array.prototype.forEach.call(el.modeTabs || [], function (btn) {
      var active = btn.getAttribute('data-mode') === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (el.listenPanel) el.listenPanel.hidden = mode !== 'listen';
    if (el.readPanel) el.readPanel.hidden = mode !== 'read';

    var lesson = getCurrentLesson();

    if (mode === 'read') {
      cancelTitleSplash();
      pauseWelcomePromo();
      if (el.heroVisual) el.heroVisual.pause();
      if (el.readAudioTitle) el.readAudioTitle.textContent = displayLessonTitle(lesson.title);
      buildWaveform();
      renderReadTranscript(lesson);
      updateVideoUI();
      updateAudioUI();
      return;
    }

    if (mode === 'listen') {
      cancelTitleSplash();
      pauseWelcomePromo();
      if (el.heroVisual) el.heroVisual.pause();
      if (isWelcomeLesson(lesson) && el.audio) el.audio.pause();
      if (el.listenTitle) el.listenTitle.textContent = displayLessonTitle(lesson.title);
      buildWaveform();
      updateVideoUI();
      updateAudioUI();
      return;
    }

    if (el.audio) el.audio.pause();
    updateAudioUI();

    if (isEmbedLesson(lesson)) {
      if (!isIntroSplashActive(lesson) &&
          el.videoStage &&
          !el.videoStage.classList.contains('is-embed-visible') &&
          !el.videoStage.classList.contains('is-splash-active')) {
        applyEmbedHero(lesson);
      }
      updateEmbedVideoUI();
    } else if (
      (el.heroVisual && !el.heroVisual.hidden) ||
      (isWelcomeLesson(lesson) && el.heroImage && !el.heroImage.hidden)
    ) {
      if (isWelcomeLesson(lesson) && el.heroImage && !el.heroImage.hidden) {
        updateVideoControlsState();
      } else if (getHeroSplash(lesson)) {
        if (el.heroVisual.currentTime > 0.15) {
          cancelTitleSplash();
          configureHeroVideoPlayback(lesson);
          el.heroVisual.muted = false;
          el.heroVisual.play().catch(function () {});
          updateVideoUI();
        } else if (!el.videoStage || !el.videoStage.classList.contains('is-splash-active')) {
          forceHeroVideo(lesson.heroVisual.src, lesson);
        }
      } else {
        playHeroVideoWhenReady(lesson);
      }
      updateVideoUI();
    } else {
      updateVideoControlsState();
    }
  }

  function playHeroVideoWhenReady(lesson) {
    if (!el.heroVisual || el.heroVisual.hidden) return;
    if (getHeroSplash(lesson)) return;
    configureHeroVideoPlayback(lesson);

    if (isWelcomeLesson(lesson)) {
      function showPosterFrame() {
        syncWelcomeVisual(lesson, false);
        updateVideoUI();
      }
      if (el.heroVisual.readyState >= 1) showPosterFrame();
      else {
        el.heroVisual.addEventListener('loadeddata', function onData() {
          el.heroVisual.removeEventListener('loadeddata', onData);
          showPosterFrame();
        });
      }
      return;
    }

    function tryPlay() {
      el.heroVisual.setAttribute('playsinline', '');
      el.heroVisual.setAttribute('webkit-playsinline', '');
      var p = el.heroVisual.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          updateVideoUI();
        });
      }
      updateVideoUI();
    }

    if (el.heroVisual.readyState >= 2) {
      tryPlay();
    } else {
      el.heroVisual.addEventListener('loadeddata', function onData() {
        el.heroVisual.removeEventListener('loadeddata', onData);
        tryPlay();
      });
      tryPlay();
    }
  }

  function forceHeroEmbed(src, lesson) {
    mountHeroEmbed(lesson);
  }

  function forceHeroVideo(src, lesson) {
    if (!el.heroVisual || !el.heroSource || !el.heroImage) return;

    resetHeroEmbed();

    el.heroImage.hidden = true;
    el.heroImage.removeAttribute('src');
    el.heroVisual.hidden = false;
    el.heroVisual.classList.remove('is-splash-hidden', 'is-embed-preview');
    if (el.videoStage) {
      el.videoStage.classList.remove('is-image-mode', 'is-no-video', 'is-embed-mode');
      setWelcomeVideoStage(lesson);
    }

    el.heroVisual.pause();
    el.heroVisual.currentTime = 0;
    el.heroSource.src = encodeMediaPath(src);
    el.heroSource.type = videoMimeFromSrc(src);
    var poster = lesson && lesson.heroVisual && lesson.heroVisual.poster;
    if (poster) {
      el.heroVisual.setAttribute('poster', encodeMediaPath(poster));
    } else {
      el.heroVisual.removeAttribute('poster');
    }
    el.heroVisual.load();
    configureHeroVideoPlayback(lesson);

    if (getHeroSplash(lesson) && lessonMode === 'watch') {
      startTitleSplash(lesson);
      return;
    }

    cancelTitleSplash();
    playHeroVideoWhenReady(lesson);
  }

  function applyHeroVisual(lesson) {
    if (!isPromoWelcome(lesson)) hideWelcomePromo();
    if (!isIntroSplashActive(lesson)) {
      cancelTitleSplash();
    }
    var hv = lesson && lesson.heroVisual;
    if (!el.heroVisual || !el.heroSource || !el.heroImage) return;

    if (hv && hv.type === 'promo') {
      applyPromoHero(lesson);
      return;
    }

    if (!hv || !hv.src) {
      if (el.videoStage) el.videoStage.classList.add('is-no-video');
      forceHeroVideo(el.heroSource.src || 'videos/hero-home-loop.mp4', lesson);
      return;
    }

    if (hv.type === 'image') {
      resetHeroEmbed();
      setWelcomeVideoStage(lesson);
      el.heroVisual.pause();
      el.heroVisual.hidden = true;
      el.heroImage.hidden = false;
      el.heroImage.src = hv.src;
      el.heroImage.alt = hv.alt || 'Talk illustration';
      if (el.videoStage) {
        el.videoStage.classList.add('is-image-mode');
        el.videoStage.classList.remove('is-embed-mode');
      }
      return;
    }

    if (hv.type === 'embed') {
      applyEmbedHero(lesson);
      return;
    }

    resetHeroEmbed();
    if (el.videoStage) el.videoStage.classList.remove('is-embed-mode');
    forceHeroVideo(hv.src, lesson);
  }

  function bindSeekControl(track) {
    if (!track) return;

    function onPointer(clientX) {
      seekAudioFromEvent(track, clientX);
    }

    track.addEventListener('click', function (e) {
      onPointer(e.clientX);
    });

    track.addEventListener('keydown', function (e) {
      if (!el.audio || !el.audio.duration) return;
      var step = 5;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekAudioToRatio(((el.audio.currentTime / el.audio.duration) * 100 + step) / 100);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekAudioToRatio(((el.audio.currentTime / el.audio.duration) * 100 - step) / 100);
      }
    });
  }

  function bindWaveformSeek(wave) {
    if (!wave) return;
    wave.addEventListener('click', function (e) {
      seekAudioFromEvent(wave, e.clientX);
    });
    wave.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        seekAudioFromEvent(wave, wave.getBoundingClientRect().left + wave.offsetWidth / 2);
      }
    });
  }

  function bindAudioEvents() {
    if (!el.audio) return;

    el.audio.addEventListener('timeupdate', function () {
      updateAudioUI();
      if (lessonMode === 'watch' && isWelcomeLesson(getCurrentLesson())) updateVideoUI();
    });
    el.audio.addEventListener('loadedmetadata', function () {
      updateAudioUI();
      if (lessonMode === 'watch' && isWelcomeLesson(getCurrentLesson())) updateVideoUI();
    });
    el.audio.addEventListener('play', function () {
      updateAudioUI();
      if (lessonMode === 'watch' && isWelcomeLesson(getCurrentLesson())) updateVideoUI();
    });
    el.audio.addEventListener('pause', function () {
      updateAudioUI();
      if (lessonMode === 'watch' && isWelcomeLesson(getCurrentLesson())) updateVideoUI();
    });
    el.audio.addEventListener('error', function () {
      if (el.error) el.error.hidden = false;
    });

    if (el.listenPlay) el.listenPlay.addEventListener('click', toggleAudioPlayback);
    if (el.readPlay) el.readPlay.addEventListener('click', toggleAudioPlayback);

    bindSeekControl(el.seekTrack);
    bindSeekControl(el.readSeekTrack);
    bindWaveformSeek(el.waveform);
    bindWaveformSeek(el.readWaveform);
  }

  function bindVideoEvents() {
    if (!el.heroVisual) return;

    el.heroVisual.addEventListener('timeupdate', updateVideoUI);
    el.heroVisual.addEventListener('loadedmetadata', updateVideoUI);
    el.heroVisual.addEventListener('play', updateVideoUI);
    el.heroVisual.addEventListener('pause', updateVideoUI);

    if (el.videoBarPlay) el.videoBarPlay.addEventListener('click', handleVideoPlayClick);
    if (el.videoBarPause) el.videoBarPause.addEventListener('click', handleVideoPauseClick);

    if (el.embedCenterPlay) {
      bindPressFeedback(el.embedCenterPlay);
      el.embedCenterPlay.addEventListener('click', function (e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        handleVideoPlayClick(e);
      });
    }

    if (el.videoSeek) {
      el.videoSeek.addEventListener('input', function () {
        var lesson = getCurrentLesson();
        if (isTalk1Lesson(lesson)) {
          talk1Seeking = true;
          var total = getTalk1TotalDurationSec(lesson);
          var current = (Number(el.videoSeek.value) / 100) * total;
          if (el.videoTime) {
            el.videoTime.textContent = formatTime(current) + ' / ' + formatTime(total);
          }
          return;
        }
        if (isWelcomeLesson(lesson) && el.audio && el.audio.duration) {
          el.audio.currentTime = (Number(el.videoSeek.value) / 100) * el.audio.duration;
          updateVideoUI();
          return;
        }
        if (!el.heroVisual.duration) return;
        el.heroVisual.currentTime = (Number(el.videoSeek.value) / 100) * el.heroVisual.duration;
      });
      el.videoSeek.addEventListener('change', function () {
        var lesson = getCurrentLesson();
        if (isTalk1Lesson(lesson)) {
          seekTalk1Unified(Number(el.videoSeek.value) / 100);
          talk1Seeking = false;
          updateTalk1VideoUI();
        }
      });
    }

    if (el.splashAudio) {
      el.splashAudio.addEventListener('timeupdate', function () {
        if (isTalk1Lesson(getCurrentLesson()) && talk1Phase === 'intro') {
          updateTalk1VideoUI();
        }
      });
    }

    if (el.videoBarMute) {
      el.videoBarMute.addEventListener('click', function () {
        if (!isTalk1Lesson(getCurrentLesson())) return;
        talk1Muted = !talk1Muted;
        applyTalk1Volume();
      });
    }

    if (el.videoBarVolume) {
      el.videoBarVolume.addEventListener('input', function () {
        if (!isTalk1Lesson(getCurrentLesson())) return;
        talk1Volume = Math.max(0, Math.min(1, Number(el.videoBarVolume.value) / 100));
        if (talk1Volume > 0) talk1Muted = false;
        applyTalk1Volume();
      });
    }

    if (el.videoBarFullscreen) {
      el.videoBarFullscreen.addEventListener('click', function (e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        if (!isTalk1Lesson(getCurrentLesson())) return;
        toggleTalk1Fullscreen();
      });
    }

    document.addEventListener('fullscreenchange', function () {
      if (!isTalk1Lesson(getCurrentLesson()) || !el.videoBarFullscreen) return;
      var active = !!(document.fullscreenElement || document.webkitFullscreenElement);
      el.videoBarFullscreen.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    });
  }

  function bindModeTabs() {
    Array.prototype.forEach.call(el.modeTabs || [], function (btn) {
      btn.addEventListener('click', function () {
        setLessonMode(btn.getAttribute('data-mode'));
      });
    });
  }

  function goToPrevious() {
    var target = findAdjacentAvailableLesson(-1);
    if (!target) return;
    moduleIndex = target.module;
    lessonIndex = target.lesson;
    render();
  }

  function goToNext() {
    var target = findAdjacentAvailableLesson(1);
    if (!target) return false;
    moduleIndex = target.module;
    lessonIndex = target.lesson;
    render();
    return true;
  }

  function markComplete() {
    var all = flattenItems();
    var total = all.length;
    var absIdx = absoluteLessonIndex();
    var progressPct = common.resolveProgress(course);
    var done = doneLessonCount(progressPct, total);
    var wasDone = absIdx < done;

    if (wasDone) {
      var newDone = absIdx;
      var unmarkPct = total > 0 ? Math.round((newDone / total) * 100) : 0;
      common.setCourseProgress(course.id, unmarkPct);
      render();
      return;
    }

    var pct = Math.round(((absIdx + 1) / total) * 100);
    common.setCourseProgress(course.id, pct);
    showCompleteToast(doneLessonCount(pct, total));

    if (absIdx < total - 1 && goToNext()) {
      return;
    }
    render();
  }

  function navigateToLesson(m, l) {
    moduleIndex = Number(m);
    lessonIndex = Number(l);
    clampPosition();
    if (window.innerWidth <= 960) {
      navOpen = false;
      setNavState();
    }
    render();
  }

  function render() {
    clampPosition();
    var module = getCurrentModule();
    var lesson = getCurrentLesson();
    var all = flattenItems();
    var currentAbs = absoluteLessonIndex() + 1;
    var progressPct = common.resolveProgress(course);
    var split = isSplitLesson(lesson);

    history.replaceState({}, '', 'course-player-v2.html?course=' + encodeURIComponent(course.id) +
      '&module=' + moduleIndex + '&lesson=' + lessonIndex);

    if (el.title) el.title.textContent = course.title;

    if (split) {
      el.body.classList.add('player-v2-is-split-lesson');
      if (el.lessonPanel) el.lessonPanel.hidden = false;
      if (el.legacyCanvas) el.legacyCanvas.hidden = true;
      if (el.sidebarDefault) el.sidebarDefault.hidden = true;
      if (el.sidebarLessonSlot) el.sidebarLessonSlot.hidden = false;

      renderProgressCard(all, progressPct);
      renderSidebarCourseNav(all, progressPct);

      if (el.moduleLabel) el.moduleLabel.textContent = module.title;
      if (el.mainLessonTitle) el.mainLessonTitle.innerHTML = mainTitleHtml(lesson.title);
      if (el.videoNowTitle) {
        el.videoNowTitle.textContent = displayLessonTitle(lesson.title);
      }
      if (el.listenTitle) el.listenTitle.textContent = displayLessonTitle(lesson.title);
      if (el.readAudioTitle) el.readAudioTitle.textContent = displayLessonTitle(lesson.title);
      renderPills(lesson);
      if (el.intro) el.intro.textContent = lesson.summary;
      renderCallout(lesson);
      if (el.lessonSections) el.lessonSections.innerHTML = buildSectionsHtml(lesson);
      if (el.lessonPosition) {
        el.lessonPosition.textContent = 'Lesson ' + currentAbs + ' of ' + all.length;
      }
      if (el.prev) {
        el.prev.disabled = currentAbs <= 1;
        el.prev.classList.toggle('is-disabled', currentAbs <= 1);
      }
      if (el.next) {
        el.next.disabled = currentAbs >= all.length;
        el.next.classList.toggle('is-disabled', currentAbs >= all.length);
      }
      updateCompleteButton(progressPct, all.length);

      applyHeroVisual(lesson);
      syncTalk1PlayerChrome(lesson);

      if (el.audio && lesson.audio && lesson.audio.audioUrl) {
        if (el.error) el.error.hidden = true;
        ensureLessonAudio(lesson);
        el.audio.addEventListener('loadedmetadata', function () {
          if (el.error) el.error.hidden = true;
          updateAudioUI();
        }, { once: true });
      }
      renderReadTranscript(lesson);
      if (el.error) el.error.hidden = !lesson.audio || lesson.audio.status !== 'failed';

      updateAudioUI();
      updateVideoUI();
      setLessonMode(lessonMode);

      window.scrollTo(0, 0);
    } else {
      el.body.classList.remove('player-v2-is-split-lesson');
      if (el.lessonPanel) el.lessonPanel.hidden = true;
      if (el.legacyCanvas) el.legacyCanvas.hidden = false;
      if (el.sidebarDefault) el.sidebarDefault.hidden = false;
      if (el.sidebarLessonSlot) el.sidebarLessonSlot.hidden = true;
      if (el.heroVisual) el.heroVisual.pause();
      if (el.lessonTitle) el.lessonTitle.textContent = lesson.title;
      if (el.lessonSummary) el.lessonSummary.textContent = lesson.summary;
      renderCurriculum();
    }
  }

  function setOnlineState() {
    var offline = !navigator.onLine;
    el.body.classList.toggle('is-offline', offline);
    if (el.offline) el.offline.hidden = !offline;
  }

  function setNavState() {
    el.body.classList.toggle('player-v2-nav-collapsed', !navOpen);
    if (el.overlay) {
      el.overlay.setAttribute('aria-hidden', navOpen ? 'true' : 'false');
    }
  }

  function toggleNav() {
    navOpen = !navOpen;
    setNavState();
  }

  function closeNav() {
    navOpen = false;
    setNavState();
  }

  function init() {
    setOnlineState();
    setNavState();
    bindEmbedMessages();

    if (el.splashAudio) {
      el.splashAudio.addEventListener('play', updateSplashAudioUI);
      el.splashAudio.addEventListener('pause', updateSplashAudioUI);
    }

    if (el.videoBarRestart) {
      bindPressFeedback(el.videoBarRestart);
      el.videoBarRestart.addEventListener('click', handleVideoRestartClick);
    }
    if (el.videoBarPlay) bindPressFeedback(el.videoBarPlay);
    if (el.videoBarPause) bindPressFeedback(el.videoBarPause);

    setTimeout(function () {
      if (el.preloader) el.preloader.classList.add('is-hidden');
    }, 900);

    window.addEventListener('online', setOnlineState);
    window.addEventListener('offline', setOnlineState);

    window.addEventListener('resize', function () {
      navOpen = window.innerWidth > 960;
      setNavState();
    });

    if (el.burger) el.burger.addEventListener('click', toggleNav);
    if (el.toggleNav) el.toggleNav.addEventListener('click', toggleNav);
    if (el.overlay) el.overlay.addEventListener('click', closeNav);
    if (el.drawerClose) el.drawerClose.addEventListener('click', closeNav);

    if (el.toast) {
      el.toast.addEventListener('click', function () {
        el.toast.hidden = true;
        if (toastTimer) clearTimeout(toastTimer);
      });
    }

    if (el.prev) el.prev.addEventListener('click', goToPrevious);
    if (el.next) el.next.addEventListener('click', goToNext);
    if (el.complete) el.complete.addEventListener('click', markComplete);

    if (el.sidebarCourseNav) {
      el.sidebarCourseNav.addEventListener('click', function (e) {
        var lessonBtn = e.target.closest('.player-v2-lesson-card[data-lesson]');
        if (!lessonBtn || lessonBtn.disabled || lessonBtn.classList.contains('is-soon')) return;
        if (lessonBtn.hasAttribute('data-module')) {
          e.preventDefault();
          navigateToLesson(
            lessonBtn.getAttribute('data-module'),
            lessonBtn.getAttribute('data-lesson')
          );
        }
      });
    }

    bindAudioEvents();
    bindVideoEvents();
    bindModeTabs();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      if (lessonMode === 'watch' && el.heroVisual && !el.heroVisual.hidden) {
        playHeroVideoWhenReady(getCurrentLesson());
      }
    });

    document.addEventListener('click', function (e) {
      var dl = e.target.closest('.player-v2-download-btn.is-placeholder');
      if (dl) e.preventDefault();
    });

    render();
  }

  init();
})();
