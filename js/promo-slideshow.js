/**
 * Bright Talks homepage promo: image slides, text overlays, optional MP3 or Web Audio pad.
 */
(function () {
  'use strict';

  var U = 'https://images.unsplash.com';
  var scenes = [
    {
      duration: 4000,
      image: 'images/home-hero-yellow-3.jpg',
      text: 'Some conversations matter more than others.'
    },
    {
      duration: 4000,
      image: U + '/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1920&q=82',
      text: 'Kids are curious… and they’re learning from somewhere.'
    },
    {
      duration: 4000,
      image: U + '/photo-1604881991720-f57add518bed?auto=format&fit=crop&w=1920&q=82',
      text: 'But many parents don’t know how to start.'
    },
    {
      duration: 4000,
      image: U + '/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1920&q=82',
      text: 'What if those conversations started with you?'
    },
    {
      duration: 5000,
      image: 'images/home-hero-yellow-2.jpg',
      text:
        'Bright Talks helps you guide age-appropriate conversations about bodies, boundaries, and safety.'
    },
    {
      duration: 4000,
      image: U + '/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1920&q=82',
      text: 'Build trust. Create safety. Stay connected.'
    },
    {
      duration: 4000,
      image: U + '/photo-1609220258503-2e9e5e29e1d5?auto=format&fit=crop&w=1920&q=82',
      text: 'So your child always has a safe place to ask.'
    },
    {
      duration: 5000,
      image: U + '/photo-1542037104757-49f0a0fae2fd?auto=format&fit=crop&w=1920&q=82',
      text: 'Bright Talks — Start the conversation at home.'
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
  var statusEl = root.querySelector('[data-promo-status]');

  var idx = 0;
  var prevIdx = -1;
  var activeLayer = 0;
  var playing = false;
  var musicMuted = false;
  var slideTimer = null;
  var bgAudio = null;
  var padStop = null;
  var audioCtx = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fadeMs = prefersReducedMotion ? 180 : 900;

  function setStatus(t) {
    if (statusEl) statusEl.textContent = t;
  }

  function imgUrl(path) {
    return 'url("' + path.replace(/"/g, '\\"') + '")';
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
      layerEls[0].style.backgroundImage = imgUrl(scenes[i].image);
      layerEls[0].classList.add('is-visible');
      layerEls[1].classList.remove('is-visible');
      activeLayer = 0;
      prevIdx = i;
      return;
    }
    var next = 1 - activeLayer;
    var el = layerEls[next];
    var prev = layerEls[activeLayer];
    el.style.backgroundImage = imgUrl(scenes[i].image);
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

  function stopPad() {
    if (typeof padStop === 'function') {
      padStop();
      padStop = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.suspend();
      } catch (e) {}
    }
  }

  function stopMusic() {
    if (bgAudio) {
      bgAudio.pause();
      bgAudio.src = '';
      bgAudio = null;
    }
    stopPad();
  }

  function startWebPad() {
    if (padStop || musicMuted) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var o1 = audioCtx.createOscillator();
      var o2 = audioCtx.createOscillator();
      var o3 = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 720;
      o1.type = 'sine';
      o2.type = 'sine';
      o3.type = 'sine';
      o1.frequency.value = 196;
      o2.frequency.value = 246.94;
      o3.frequency.value = 293.66;
      g.gain.value = 0.018;
      o1.connect(filter);
      o2.connect(filter);
      o3.connect(filter);
      filter.connect(g);
      g.connect(audioCtx.destination);
      o1.start();
      o2.start();
      o3.start();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(function () {});
      }
      padStop = function () {
        try {
          o1.stop();
          o2.stop();
          o3.stop();
        } catch (e) {}
        try {
          g.disconnect();
          filter.disconnect();
        } catch (e) {}
      };
    } catch (e) {
      padStop = null;
    }
  }

  function startMusic() {
    stopMusic();
    bgAudio = new Audio('audio/promo-ambient.mp3');
    bgAudio.loop = true;
    bgAudio.volume = musicMuted ? 0 : 0.32;
    bgAudio.muted = musicMuted;
    function usePad() {
      bgAudio = null;
      if (!musicMuted) startWebPad();
    }
    bgAudio.addEventListener('error', usePad, { once: true });
    var p = bgAudio.play();
    if (p && p.catch) p.catch(usePad);
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
    setStatus('Playing');
    applyScene(0, true);
    startMusic();
    scheduleAdvance();
  }

  function stopSequence(atEnd) {
    playing = false;
    clearSlideTimer();
    stopMusic();
    if (btnPlay) btnPlay.hidden = false;
    if (btnPause) btnPause.hidden = true;
    setStatus(atEnd ? 'Finished. Replay anytime.' : 'Paused');
  }

  function jumpTo(i) {
    if (i === idx) return;
    var wasPlaying = playing;
    clearSlideTimer();
    if (wasPlaying) stopMusic();
    applyScene(i, false);
    if (wasPlaying) {
      playing = true;
      if (btnPlay) btnPlay.hidden = true;
      if (btnPause) btnPause.hidden = false;
      startMusic();
      scheduleAdvance();
    }
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
      stopSequence(false);
      startSequence();
    });
  }
  if (btnMute) {
    btnMute.addEventListener('click', function () {
      musicMuted = !musicMuted;
      btnMute.setAttribute('aria-pressed', musicMuted ? 'true' : 'false');
      btnMute.textContent = musicMuted ? 'Unmute music' : 'Mute music';
      if (bgAudio) {
        bgAudio.muted = musicMuted;
        bgAudio.volume = musicMuted ? 0 : 0.32;
      }
      if (musicMuted) {
        stopPad();
      } else if (playing) {
        if (bgAudio) {
          bgAudio.play().catch(function () {});
        } else {
          startWebPad();
        }
      }
    });
  }

  document.documentElement.style.setProperty('--promo-fade-ms', fadeMs + 'ms');

  applyScene(0, true);
  setStatus('Press play for slides and soft music (add audio/promo-ambient.mp3 for richer sound).');
})();
