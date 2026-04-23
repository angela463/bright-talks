/**
 * Bright Talks homepage promo: local image slides + layered music + voiceover.
 * Slides follow the voiceover clock; scene/caption lengths are smoothed to keep an even pace.
 */
(function () {
  'use strict';

  /* Promo audio tracks (paths are URI-encoded for spaces / punctuation) */
  var PROMO_MUSIC_SRC = encodeURI('audio files/Warm Windows, Open Minds.mp3');
  /** Homepage promo narration track. */
  var PROMO_VOICEOVER_SRC = encodeURI('audio files/Bright Talks v1.mp3');

  /* Promo photography: images/promo/ */
  var scenes = [
    {
      duration: 4000,
      image: 'images/promo/promo-01-family-tent.png',
      text: 'Some conversations matter more than others.'
    },
    {
      duration: 4000,
      image: 'images/promo/promo-02-family-bed.png',
      text: 'Kids are curious… and they’re learning from somewhere.'
    },
    {
      duration: 4000,
      image: 'images/promo/promo-03-hiking.png',
      text: 'But many parents don’t know how to start.'
    },
    {
      duration: 4000,
      image: 'images/promo/promo-04-classroom.png',
      text: 'What if those conversations started with you?'
    },
    {
      duration: 5000,
      image: 'images/promo/promo-05-tablet-learning.png',
      text:
        'Bright Talks helps you guide age appropriate conversations about bodies, boundaries, and safety.'
    },
    {
      duration: 4000,
      image: 'images/promo/promo-08-teen-desk.png',
      text: 'Build trust. Create safety. Stay connected.'
    },
    {
      duration: 4000,
      image: 'images/promo/promo-07-family-walk.png',
      text: 'So your child always has a safe place to ask.'
    },
    {
      duration: 5000,
      image: 'images/promo/promo-02-family-bed.png',
      text: 'Bright Talks. Start the conversation at home.'
    }
  ];

  var baseTotalMs = scenes.reduce(function (acc, s) {
    return acc + s.duration;
  }, 0);
  var totalMs = baseTotalMs;
  /**
   * Blend between "equal time per caption" and "speech-length weighted".
   * Higher values produce more even pacing across captions.
   */
  var EVEN_PACE_BLEND = 0.12;
  /** Preserve some original storyboard timing so pacing feels intentional. */
  var BASE_DURATION_BLEND = 0.58;

  var root = document.getElementById('promo-root');
  if (!root) return;

  var layerEls = root.querySelectorAll('[data-promo-layer]');
  var captionEl = root.querySelector('[data-promo-caption]');
  var bigPlay = document.getElementById('promo-big-play');
  var chrome = document.getElementById('promo-chrome');
  var toggleBtn = document.getElementById('promo-toggle');
  var iconPause = document.getElementById('promo-icon-pause');
  var iconPlay = document.getElementById('promo-icon-play');
  var fill = document.getElementById('promo-fill');
  var scrub = document.getElementById('promo-scrub');
  var elapsedEl = document.getElementById('promo-elapsed');
  var totalEl = document.getElementById('promo-total');
  var btnReplay = root.querySelector('[data-promo-replay]');
  var btnMute = root.querySelector('[data-promo-mute]');
  var muteSlash = btnMute ? btnMute.querySelector('.promo-volume-slash') : null;

  var idx = 0;
  var prevIdx = -1;
  var activeLayer = 0;
  var playing = false;
  var musicMuted = false;
  var slideTimer = null;
  var progressTick = null;
  var bgMusic = null;
  var voiceoverAudio = null;
  /** When resuming before voiceover exposes duration, seek once metadata is ready. */
  var pendingVoiceoverResumeMs = null;

  /** Wall time when the current slide started (for timeline). */
  var slideStartWallMs = 0;
  /** When paused, frozen position along the full timeline (ms). */
  var frozenElapsedMs = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fadeMs = prefersReducedMotion ? 180 : 900;

  function formatClock(seconds) {
    var s = Math.max(0, Math.floor(seconds));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function getSceneDuration(i) {
    var s = scenes[i];
    if (!s) return 0;
    return s._scaledMs != null && isFinite(s._scaledMs) ? s._scaledMs : s.duration;
  }

  function sumDurationsUpTo(i) {
    var t = 0;
    for (var j = 0; j < i; j++) {
      t += getSceneDuration(j);
    }
    return t;
  }

  function sceneIndexForElapsedMs(ms) {
    var n = scenes.length;
    if (n === 0) return 0;
    ms = Math.max(0, Math.min(ms, totalMs));
    for (var i = 0; i < n; i++) {
      var end = sumDurationsUpTo(i + 1);
      if (ms < end) return i;
    }
    return n - 1;
  }

  /** Keep the visible slide aligned with voiceover playback (avoids timer vs audio drift). */
  function syncSlideToVoiceover() {
    if (!playing || !voiceoverAudio) return;
    if (getVoiceoverDurationMs() <= 0) return;
    var elMs = getVoiceoverElapsedMs();
    var want = sceneIndexForElapsedMs(elMs);
    if (want !== idx) {
      applyScene(want, false);
    }
    clearSlideTimer();
  }

  function getVoiceoverDurationMs() {
    if (!voiceoverAudio || !voiceoverAudio.duration || !isFinite(voiceoverAudio.duration) || voiceoverAudio.duration <= 0) {
      return 0;
    }
    return voiceoverAudio.duration * 1000;
  }

  function getVoiceoverElapsedMs() {
    if (!voiceoverAudio || !isFinite(voiceoverAudio.currentTime)) return 0;
    return Math.min(totalMs, Math.max(0, voiceoverAudio.currentTime * 1000));
  }

  function seekVoiceoverToElapsedMs(ms) {
    if (!voiceoverAudio) return false;
    var d = getVoiceoverDurationMs();
    if (d <= 0) return false;
    ms = Math.max(0, Math.min(ms, d - 1));
    try {
      voiceoverAudio.currentTime = Math.min(Math.max(0, ms / 1000), Math.max(0, voiceoverAudio.duration - 0.05));
    } catch (eSeek) {}
    return true;
  }

  function estimateSpeechWeight(text) {
    if (!text) return 1;
    var cleaned = String(text).replace(/\s+/g, ' ').trim();
    if (!cleaned) return 1;
    var words = cleaned.split(' ').length;
    var ellipses = (cleaned.match(/\u2026|\.{3}/g) || []).length;
    var sentenceStops = (cleaned.match(/[.!?]/g) || []).length;
    var commas = (cleaned.match(/[,;:]/g) || []).length;
    // Words dominate; punctuation adds light pause weighting.
    return words + ellipses * 1.4 + sentenceStops * 0.55 + commas * 0.3;
  }

  function buildSmoothedSceneDurations(targetTotalMs) {
    var n = scenes.length;
    if (!n) return [];
    var equalShare = 1 / n;
    var baseTotal = baseTotalMs > 0 ? baseTotalMs : 1;
    var speechBlend = Math.max(0, 1 - EVEN_PACE_BLEND - BASE_DURATION_BLEND);
    var weights = [];
    var sumWeights = 0;
    for (var i = 0; i < n; i++) {
      var w = estimateSpeechWeight(scenes[i].text);
      weights.push(w);
      sumWeights += w;
    }
    if (sumWeights <= 0) sumWeights = n;

    var durations = [];
    var assigned = 0;
    for (var j = 0; j < n; j++) {
      var baseShare = scenes[j].duration / baseTotal;
      var weightedShare = weights[j] / sumWeights;
      var blendedShare =
        EVEN_PACE_BLEND * equalShare +
        BASE_DURATION_BLEND * baseShare +
        speechBlend * weightedShare;
      var d = Math.round(targetTotalMs * blendedShare);
      durations.push(d);
      assigned += d;
    }

    // Keep exact total to prevent drift in progress math.
    durations[n - 1] += targetTotalMs - assigned;
    return durations;
  }

  function applyVoiceoverTimingFromAudio() {
    var durMs = getVoiceoverDurationMs();
    if (!durMs) return;
    var scaledDurations = buildSmoothedSceneDurations(durMs);
    if (!scaledDurations.length) return;
    for (var si = 0; si < scenes.length; si++) {
      scenes[si]._scaledMs = scaledDurations[si];
    }
    totalMs = durMs;
    if (totalEl) totalEl.textContent = formatClock(totalMs / 1000);
  }

  function resetPromoTimingToDefaults() {
    for (var i = 0; i < scenes.length; i++) {
      delete scenes[i]._scaledMs;
    }
    totalMs = baseTotalMs;
    if (totalEl) totalEl.textContent = formatClock(totalMs / 1000);
  }

  function wireVoiceoverTimingReady(done) {
    if (!voiceoverAudio) {
      if (typeof done === 'function') done();
      return;
    }
    function metaReady() {
      return (
        voiceoverAudio.duration &&
        isFinite(voiceoverAudio.duration) &&
        voiceoverAudio.duration > 0
      );
    }
    var ran = false;
    function run() {
      if (ran || !metaReady()) return;
      ran = true;
      applyVoiceoverTimingFromAudio();
      if (pendingVoiceoverResumeMs != null) {
        if (seekVoiceoverToElapsedMs(pendingVoiceoverResumeMs)) {
          pendingVoiceoverResumeMs = null;
        }
      }
      if (playing) {
        voiceoverAudio.volume = musicMuted ? 0 : 1;
        voiceoverAudio.muted = musicMuted;
        var vp = voiceoverAudio.play();
        if (vp && vp.catch) vp.catch(function () {});
        syncSlideToVoiceover();
      }
      if (typeof done === 'function') done();
    }
    if (metaReady()) {
      run();
    } else {
      voiceoverAudio.addEventListener('loadedmetadata', run, { once: true });
    }
  }

  function getElapsedMs() {
    if (playing && voiceoverAudio) {
      return getVoiceoverElapsedMs();
    }
    if (playing) {
      var within = Date.now() - slideStartWallMs;
      var cap = getSceneDuration(idx);
      within = Math.min(within, cap);
      return Math.min(totalMs, sumDurationsUpTo(idx) + within);
    }
    if (frozenElapsedMs != null) {
      return Math.min(totalMs, frozenElapsedMs);
    }
    return sumDurationsUpTo(idx);
  }

  function updateProgressUi() {
    syncSlideToVoiceover();
    var ms = getElapsedMs();
    var pct = totalMs > 0 ? (ms / totalMs) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    if (scrub) scrub.setAttribute('aria-valuenow', String(Math.round(pct)));
    if (elapsedEl) elapsedEl.textContent = formatClock(ms / 1000);
    if (totalEl) totalEl.textContent = formatClock(totalMs / 1000);
  }

  function startProgressTicker() {
    stopProgressTicker();
    progressTick = window.setInterval(updateProgressUi, 100);
  }

  function stopProgressTicker() {
    if (progressTick != null) {
      window.clearInterval(progressTick);
      progressTick = null;
    }
  }

  function setTogglePlaying(isPlaying) {
    if (iconPause) iconPause.hidden = !isPlaying;
    if (iconPlay) iconPlay.hidden = isPlaying;
  }

  function setLayerImage(layerEl, path) {
    var img = layerEl.querySelector('.promo-bg__img');
    if (img) {
      img.src = path;
    } else {
      layerEl.style.backgroundImage = 'url("' + path.replace(/"/g, '\\"') + '")';
    }
  }

  function applySceneImage(i, forceReset) {
    if (forceReset) prevIdx = -1;
    if (!forceReset && i === prevIdx) return;
    if (prevIdx < 0) {
      setLayerImage(layerEls[0], scenes[i].image);
      layerEls[0].classList.add('is-visible');
      layerEls[1].classList.remove('is-visible');
      activeLayer = 0;
      prevIdx = i;
      return;
    }
    var next = 1 - activeLayer;
    var el = layerEls[next];
    var prev = layerEls[activeLayer];
    setLayerImage(el, scenes[i].image);
    el.classList.add('is-visible');
    prev.classList.remove('is-visible');
    activeLayer = next;
    prevIdx = i;
  }

  function applyCaption(i) {
    if (!captionEl) return;
    captionEl.textContent = scenes[i].text;
    captionEl.classList.remove('is-entering');
    void captionEl.offsetWidth;
    captionEl.classList.add('is-entering');
  }

  function applyScene(i, forceReset) {
    idx = Math.max(0, Math.min(scenes.length - 1, i));
    applySceneImage(idx, !!forceReset);
    applyCaption(idx);
    if (playing) {
      slideStartWallMs = Date.now();
    }
  }

  function clearSlideTimer() {
    if (slideTimer) {
      clearTimeout(slideTimer);
      slideTimer = null;
    }
  }

  function pauseAudio() {
    if (bgMusic) {
      bgMusic.pause();
    }
    if (voiceoverAudio) {
      voiceoverAudio.pause();
    }
  }

  function releaseAudio() {
    if (bgMusic) {
      bgMusic.pause();
      try {
        bgMusic.src = '';
      } catch (e) {}
      bgMusic = null;
    }
    if (voiceoverAudio) {
      voiceoverAudio.pause();
      try {
        voiceoverAudio.src = '';
      } catch (e2) {}
      voiceoverAudio = null;
    }
    pendingVoiceoverResumeMs = null;
    resetPromoTimingToDefaults();
  }

  function startAudio(afterTimingReady) {
    if (bgMusic) {
      bgMusic.loop = true;
      bgMusic.volume = musicMuted ? 0 : 0.18;
      bgMusic.muted = musicMuted;
      var pr = bgMusic.play();
      if (pr && pr.catch) pr.catch(function () {});
    } else {
      bgMusic = new Audio(PROMO_MUSIC_SRC);
      bgMusic.loop = true;
      bgMusic.volume = musicMuted ? 0 : 0.18;
      bgMusic.muted = musicMuted;
      var p = bgMusic.play();
      if (p && p.catch) p.catch(function () {});
    }

    if (voiceoverAudio) {
      wireVoiceoverTimingReady(afterTimingReady);
      return;
    }

    voiceoverAudio = new Audio(PROMO_VOICEOVER_SRC);
    voiceoverAudio.loop = false;
    voiceoverAudio.addEventListener('ended', function () {
      if (playing) stopSequence(true);
    });
    wireVoiceoverTimingReady(afterTimingReady);
  }

  function stopSequence(atEnd) {
    var ms;
    if (atEnd) {
      ms = totalMs;
    } else if (voiceoverAudio && isFinite(voiceoverAudio.currentTime)) {
      ms = getVoiceoverElapsedMs();
    } else {
      ms = getElapsedMs();
    }
    playing = false;
    frozenElapsedMs = ms;
    clearSlideTimer();
    stopProgressTicker();
    pauseAudio();

    if (atEnd) {
      if (bigPlay) bigPlay.hidden = false;
      if (chrome) chrome.hidden = true;
    } else {
      if (bigPlay) bigPlay.hidden = true;
      if (chrome) chrome.hidden = false;
    }

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.setAttribute('aria-label', 'Play');
    }
    setTogglePlaying(false);
    updateProgressUi();
  }

  function startSequence() {
    clearSlideTimer();
    stopProgressTicker();
    pendingVoiceoverResumeMs = null;
    playing = true;
    frozenElapsedMs = null;
    if (bigPlay) bigPlay.hidden = true;
    if (chrome) chrome.hidden = false;
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.setAttribute('aria-label', 'Pause');
    }
    setTogglePlaying(true);
    applyScene(0, true);
    startAudio(function afterPromoTiming() {
      startProgressTicker();
      updateProgressUi();
    });
  }

  function resumeSequence() {
    if (frozenElapsedMs != null && frozenElapsedMs >= totalMs - 20) return;
    var resumeAt = frozenElapsedMs != null ? frozenElapsedMs : sumDurationsUpTo(idx);
    playing = true;
    var elapsedInSlide = resumeAt - sumDurationsUpTo(idx);
    elapsedInSlide = Math.max(0, Math.min(elapsedInSlide, getSceneDuration(idx)));
    slideStartWallMs = Date.now() - elapsedInSlide;
    frozenElapsedMs = null;
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.setAttribute('aria-label', 'Pause');
    }
    setTogglePlaying(true);
    pendingVoiceoverResumeMs = resumeAt;
    if (seekVoiceoverToElapsedMs(resumeAt)) {
      pendingVoiceoverResumeMs = null;
    }
    startAudio();
    clearSlideTimer();
    startProgressTicker();
    updateProgressUi();
  }

  function syncMuteIcon() {
    if (!btnMute) return;
    btnMute.setAttribute('aria-label', musicMuted ? 'Unmute audio' : 'Mute audio');
    if (muteSlash) muteSlash.hidden = !musicMuted;
  }

  if (bigPlay) {
    bigPlay.addEventListener('click', function () {
      // Switch controls immediately so UI reflects playing intent on click.
      bigPlay.hidden = true;
      if (chrome) chrome.hidden = false;
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('aria-label', 'Pause');
      }
      setTogglePlaying(true);
      releaseAudio();
      frozenElapsedMs = null;
      startSequence();
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      if (playing) {
        stopSequence(false);
      } else {
        resumeSequence();
      }
    });
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', function () {
      clearSlideTimer();
      stopProgressTicker();
      playing = false;
      releaseAudio();
      frozenElapsedMs = null;
      startSequence();
    });
  }

  if (btnMute) {
    btnMute.addEventListener('click', function () {
      musicMuted = !musicMuted;
      btnMute.setAttribute('aria-pressed', musicMuted ? 'true' : 'false');
      syncMuteIcon();
      if (bgMusic) {
        bgMusic.muted = musicMuted;
        bgMusic.volume = musicMuted ? 0 : 0.18;
      }
      if (voiceoverAudio) {
        voiceoverAudio.muted = musicMuted;
        voiceoverAudio.volume = musicMuted ? 0 : 1;
      }
      if (playing && (bgMusic || voiceoverAudio)) {
        if (bgMusic) bgMusic.play().catch(function () {});
        if (voiceoverAudio) {
          var vpm = voiceoverAudio.play();
          if (vpm && vpm.catch) vpm.catch(function () {});
        }
      } else if (playing && (!bgMusic || !voiceoverAudio) && !musicMuted) {
        startAudio();
      }
    });
    syncMuteIcon();
  }

  document.documentElement.style.setProperty('--promo-fade-ms', fadeMs + 'ms');

  if (totalEl) totalEl.textContent = formatClock(totalMs / 1000);
  applyScene(0, true);
  updateProgressUi();
})();
