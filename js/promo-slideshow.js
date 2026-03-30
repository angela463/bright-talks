/**
 * Bright Talks homepage promo: local image slides + text overlays (MP3 only).
 */
(function () {
  'use strict';

  /* Instrumental track for the promo (path is URI-encoded for spaces / punctuation) */
  var PROMO_AUDIO_SRC = encodeURI('audio files/Warm Windows, Open Minds.mp3');

  /* All paths are local to the site so slides work offline, file://, and without third-party CDNs */
  var scenes = [
    {
      duration: 4000,
      image: 'images/home-hero-yellow-3.jpg',
      text: 'Some conversations matter more than others.'
    },
    {
      duration: 4000,
      image: 'images/home-hero-yellow-1.jpg',
      text: 'Kids are curious… and they’re learning from somewhere.'
    },
    {
      duration: 4000,
      image: 'images/home-hero-yellow-2.jpg',
      text: 'But many parents don’t know how to start.'
    },
    {
      duration: 4000,
      image: 'images/home-hero-yellow-3.jpg',
      text: 'What if those conversations started with you?'
    },
    {
      duration: 5000,
      image: 'images/home-hero-yellow-2.jpg',
      text:
        'Bright Talks helps you guide age appropriate conversations about bodies, boundaries, and safety.'
    },
    {
      duration: 4000,
      image: 'images/home-hero-yellow-1.jpg',
      text: 'Build trust. Create safety. Stay connected.'
    },
    {
      duration: 4000,
      image: 'images/home-hero-yellow-3.jpg',
      text: 'So your child always has a safe place to ask.'
    },
    {
      duration: 5000,
      image: 'images/home-hero-yellow-2.jpg',
      text: 'Bright Talks. Start the conversation at home.'
    }
  ];

  var root = document.getElementById('promo-root');
  if (!root) return;

  var layerEls = root.querySelectorAll('[data-promo-layer]');
  var captionEl = root.querySelector('[data-promo-caption]');
  var progressEl = root.querySelector('[data-promo-progress]');
  var btnPlay = root.querySelector('[data-promo-play]');
  var btnPause = root.querySelector('[data-promo-pause]');
  var btnReplay = root.querySelector('[data-promo-replay]');
  var btnMute = root.querySelector('[data-promo-mute]');
  var muteIconOn = btnMute ? btnMute.querySelector('.promo-mute-on') : null;
  var muteIconOff = btnMute ? btnMute.querySelector('.promo-mute-off') : null;

  var idx = 0;
  var prevIdx = -1;
  var activeLayer = 0;
  var playing = false;
  var musicMuted = false;
  var slideTimer = null;
  var bgAudio = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fadeMs = prefersReducedMotion ? 180 : 900;

  function setLayerImage(layerEl, path) {
    var img = layerEl.querySelector('.promo-bg__img');
    if (img) {
      img.src = path;
    } else {
      layerEl.style.backgroundImage = 'url("' + path.replace(/"/g, '\\"') + '")';
    }
  }

  function renderDots() {
    if (!progressEl) return;
    progressEl.innerHTML = scenes
      .map(function (_, i) {
        return (
          '<button type="button" class="promo-dot' +
          (i === idx ? ' is-active' : '') +
          '" data-promo-dot="' +
          i +
          '" aria-label="Slide ' +
          (i + 1) +
          ' of ' +
          scenes.length +
          '"></button>'
        );
      })
      .join('');
    progressEl.querySelectorAll('[data-promo-dot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-promo-dot'), 10);
        if (!isNaN(i)) jumpTo(i);
      });
    });
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
    renderDots();
  }

  function clearSlideTimer() {
    if (slideTimer) {
      clearTimeout(slideTimer);
      slideTimer = null;
    }
  }

  /** Pause the promo track without unloading (so Play resumes your file, not a fallback). */
  function pauseMusic() {
    if (bgAudio) {
      bgAudio.pause();
    }
  }

  /** Stop and unload audio (replay, or full reset). */
  function releaseMusic() {
    if (bgAudio) {
      bgAudio.pause();
      try {
        bgAudio.src = '';
      } catch (e) {}
      bgAudio = null;
    }
  }

  function startMusic() {
    if (bgAudio) {
      bgAudio.loop = true;
      bgAudio.volume = musicMuted ? 0 : 0.32;
      bgAudio.muted = musicMuted;
      var pr = bgAudio.play();
      if (pr && pr.catch) pr.catch(function () {});
      return;
    }
    bgAudio = new Audio(PROMO_AUDIO_SRC);
    bgAudio.loop = true;
    bgAudio.volume = musicMuted ? 0 : 0.32;
    bgAudio.muted = musicMuted;
    var p = bgAudio.play();
    if (p && p.catch) p.catch(function () {});
  }

  function advance() {
    if (!playing) return;
    if (idx >= scenes.length - 1) {
      stopSequence(true);
      return;
    }
    applyScene(idx + 1, false);
    scheduleAdvance();
  }

  function scheduleAdvance() {
    clearSlideTimer();
    if (!playing) return;
    slideTimer = setTimeout(advance, scenes[idx].duration);
  }

  function startSequence() {
    clearSlideTimer();
    playing = true;
    if (btnPlay) btnPlay.hidden = true;
    if (btnPause) btnPause.hidden = false;
    applyScene(0, true);
    startMusic();
    scheduleAdvance();
  }

  function stopSequence(atEnd) {
    playing = false;
    clearSlideTimer();
    if (!atEnd) {
      pauseMusic();
    }
    if (btnPlay) btnPlay.hidden = false;
    if (btnPause) btnPause.hidden = true;
  }

  function jumpTo(i) {
    if (i === idx) return;
    var wasPlaying = playing;
    clearSlideTimer();
    applyScene(i, false);
    if (wasPlaying) {
      playing = true;
      if (btnPlay) btnPlay.hidden = true;
      if (btnPause) btnPause.hidden = false;
      scheduleAdvance();
    }
  }

  function syncMuteIcons() {
    if (!btnMute) return;
    btnMute.setAttribute('aria-label', musicMuted ? 'Unmute music' : 'Mute music');
    if (muteIconOn) muteIconOn.hidden = musicMuted;
    if (muteIconOff) muteIconOff.hidden = !musicMuted;
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', function () {
      startSequence();
    });
  }
  if (btnPause) {
    btnPause.addEventListener('click', function () {
      stopSequence(false);
    });
  }
  if (btnReplay) {
    btnReplay.addEventListener('click', function () {
      clearSlideTimer();
      playing = false;
      releaseMusic();
      if (btnPlay) btnPlay.hidden = false;
      if (btnPause) btnPause.hidden = true;
      startSequence();
    });
  }
  if (btnMute) {
    btnMute.addEventListener('click', function () {
      musicMuted = !musicMuted;
      btnMute.setAttribute('aria-pressed', musicMuted ? 'true' : 'false');
      syncMuteIcons();
      if (bgAudio) {
        bgAudio.muted = musicMuted;
        bgAudio.volume = musicMuted ? 0 : 0.32;
      }
      if (playing && bgAudio) {
        bgAudio.play().catch(function () {});
      } else if (playing && !bgAudio && !musicMuted) {
        startMusic();
      }
    });
    syncMuteIcons();
  }

  document.documentElement.style.setProperty('--promo-fade-ms', fadeMs + 'ms');

  applyScene(0, true);
})();
