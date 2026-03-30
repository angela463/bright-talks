/**
 * Bright Talks homepage explainer: timed slides + optional browser voiceover.
 */
(function () {
  'use strict';

  var scenes = [
    {
      kicker: 'Bright Talks',
      main: 'When your child asks the big questions, you can answer with calm confidence.',
      sub: 'A warm, modern path for families.',
      narr:
        'Bright Talks is here for parents who want calm, confident conversations at home. It is warm, modern, and built around real family life.'
    },
    {
      kicker: 'What we help you do',
      main: 'Guide age-appropriate talks about growing up: bodies, boundaries, consent, and safety.',
      sub: 'Including sex education and other sensitive topics, in words that fit your child’s stage.',
      narr:
        'We help you guide age-appropriate talks about growing up, including bodies, boundaries, consent, and safety, and other sensitive topics, with language that fits your child’s age.'
    },
    {
      kicker: 'Why it matters',
      main: 'Trust grows when home feels like the safest place to ask.',
      sub: 'Connection first. Clarity follows.',
      narr:
        'When home feels like the safest place to ask questions, trust grows. Bright Talks is designed to strengthen connection, not to scare anyone.'
    },
    {
      kicker: 'How it feels',
      main: 'Short, practical support so you are never starting from zero.',
      sub: 'Less guesswork. More of your voice in the room.',
      narr:
        'You get short, practical support, so you are not starting from zero. Less guesswork, more of your own voice in the room.'
    },
    {
      kicker: 'For you',
      main: 'You do not have to be an expert. You only have to be willing.',
      sub: 'We walk beside parents and caregivers, one step at a time.',
      narr:
        'You do not have to be an expert. You only have to be willing. Bright Talks walks beside parents and caregivers, one step at a time.'
    },
    {
      kicker: 'Take the next step',
      main: 'Explore courses and bring these conversations home.',
      sub: 'Your child deserves a steady, loving guide. That guide can be you.',
      narr:
        'Explore the courses when you are ready, and bring these conversations home. Your child deserves a steady, loving guide, and that guide can be you.'
    }
  ];

  var root = document.getElementById('explainer-root');
  if (!root) return;

  var kickerEl = root.querySelector('[data-explainer-kicker]');
  var mainEl = root.querySelector('[data-explainer-main]');
  var subEl = root.querySelector('[data-explainer-sub]');
  var progressEl = root.querySelector('[data-explainer-progress]');
  var btnPlay = root.querySelector('[data-explainer-play]');
  var btnPause = root.querySelector('[data-explainer-pause]');
  var btnReplay = root.querySelector('[data-explainer-replay]');
  var btnMute = root.querySelector('[data-explainer-mute]');
  var statusEl = root.querySelector('[data-explainer-status]');

  var idx = 0;
  var playing = false;
  var muted = false;
  var currentUtter = null;
  var afterSpeechTimer = null;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function renderDots() {
    if (!progressEl) return;
    progressEl.innerHTML = scenes
      .map(function (_, i) {
        return (
          '<button type="button" class="explainer-dot' +
          (i === idx ? ' is-active' : '') +
          '" data-explainer-dot="' +
          i +
          '" aria-label="Scene ' +
          (i + 1) +
          ' of ' +
          scenes.length +
          '"></button>'
        );
      })
      .join('');
    progressEl.querySelectorAll('[data-explainer-dot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-explainer-dot'), 10);
        if (!isNaN(i)) jumpTo(i);
      });
    });
  }

  function applyScene(i) {
    idx = Math.max(0, Math.min(scenes.length - 1, i));
    var s = scenes[idx];
    if (kickerEl) {
      kickerEl.textContent = s.kicker;
      kickerEl.classList.remove('is-visible');
      void kickerEl.offsetWidth;
      kickerEl.classList.add('is-visible');
    }
    if (mainEl) {
      mainEl.textContent = s.main;
      mainEl.classList.remove('is-visible');
      void mainEl.offsetWidth;
      mainEl.classList.add('is-visible');
    }
    if (subEl) {
      subEl.textContent = s.sub;
      subEl.classList.remove('is-visible');
      void subEl.offsetWidth;
      subEl.classList.add('is-visible');
    }
    renderDots();
  }

  function pickVoice() {
    var voices = window.speechSynthesis.getVoices();
    var preferred =
      voices.find(function (v) {
        return /en(-|_)US|en(-|_)GB/i.test(v.lang) && /Samantha|Karen|Google US English|Microsoft Aria|Zira/i.test(v.name);
      }) ||
      voices.find(function (v) {
        return /^en/i.test(v.lang);
      });
    return preferred || null;
  }

  function speak(text, onend) {
    window.speechSynthesis.cancel();
    if (muted || !text) {
      if (typeof onend === 'function') onend();
      return;
    }
    if (!window.speechSynthesis) {
      if (typeof onend === 'function') onend();
      return;
    }
    var u = new SpeechSynthesisUtterance(text);
    u.rate = prefersReducedMotion ? 1 : 0.92;
    u.pitch = 1;
    u.volume = 1;
    var v = pickVoice();
    if (v) u.voice = v;
    u.onend = function () {
      currentUtter = null;
      if (typeof onend === 'function') onend();
    };
    u.onerror = function () {
      currentUtter = null;
      if (typeof onend === 'function') onend();
    };
    currentUtter = u;
    window.speechSynthesis.speak(u);
  }

  function clearTimers() {
    if (afterSpeechTimer) {
      clearTimeout(afterSpeechTimer);
      afterSpeechTimer = null;
    }
  }

  function advance() {
    if (!playing) return;
    if (idx >= scenes.length - 1) {
      stopSequence(true);
      return;
    }
    applyScene(idx + 1);
    runCurrentScene();
  }

  function runCurrentScene() {
    clearTimers();
    var s = scenes[idx];
    var pauseAfter = prefersReducedMotion ? 500 : 650;

    if (!playing) return;

    if (muted || !window.speechSynthesis) {
      afterSpeechTimer = setTimeout(advance, prefersReducedMotion ? 5000 : 7000);
      return;
    }

    speak(s.narr, function () {
      if (!playing) return;
      afterSpeechTimer = setTimeout(advance, pauseAfter);
    });
  }

  function startSequence() {
    window.speechSynthesis.cancel();
    clearTimers();
    playing = true;
    if (btnPlay) btnPlay.hidden = true;
    if (btnPause) btnPause.hidden = false;
    setStatus('Playing');
    applyScene(0);
    runCurrentScene();
  }

  function stopSequence(atEnd) {
    playing = false;
    clearTimers();
    window.speechSynthesis.cancel();
    if (btnPlay) btnPlay.hidden = false;
    if (btnPause) btnPause.hidden = true;
    setStatus(atEnd ? 'Finished. Replay anytime.' : 'Paused');
  }

  function jumpTo(i) {
    var wasPlaying = playing;
    stopSequence(false);
    applyScene(i);
    if (wasPlaying) {
      playing = true;
      if (btnPlay) btnPlay.hidden = true;
      if (btnPause) btnPause.hidden = false;
      runCurrentScene();
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
      applyScene(0);
      startSequence();
    });
  }
  if (btnMute) {
    btnMute.addEventListener('click', function () {
      muted = !muted;
      btnMute.setAttribute('aria-pressed', muted ? 'true' : 'false');
      btnMute.textContent = muted ? 'Unmute voice' : 'Mute voice';
      window.speechSynthesis.cancel();
      if (playing) runCurrentScene();
    });
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', function () {
      pickVoice();
    });
  }

  applyScene(0);
  setStatus('Press play to start. Narration uses your browser’s voice.');
})();
