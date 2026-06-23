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
    heroSource: document.getElementById('player-v2-hero-source'),
    heroImage: document.getElementById('player-v2-hero-image'),
    videoStage: document.querySelector('.player-v2-video-stage'),
    videoPlay: document.getElementById('player-v2-video-play'),
    videoPlaySmall: document.getElementById('player-v2-video-play-small'),
    videoSeek: document.getElementById('player-v2-video-seek'),
    videoTime: document.getElementById('player-v2-video-time'),
    videoNowTitle: document.getElementById('player-v2-video-now-title'),
    sidebarCourseNav: document.getElementById('player-v2-sidebar-course-nav'),
    audioPanel: document.getElementById('player-v2-audio-panel'),
    footer: document.querySelector('.player-v2-footer'),
    progressFill: document.getElementById('player-v2-progress-fill'),
    progressCount: document.getElementById('player-v2-progress-count'),
    progressMeta: document.getElementById('player-v2-progress-meta'),
    lessonPosition: document.getElementById('player-v2-lesson-position'),
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
    listenCta: document.getElementById('player-v2-listen-cta'),
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
  }

  function absoluteLessonIndex() {
    var idx = 0;
    for (var i = 0; i < moduleIndex; i++) idx += course.modules[i].lessons.length;
    idx += lessonIndex;
    return idx;
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
      el.progressMeta.textContent = mins + ' min of talks, ' + total + ' lessons';
    }
  }

  function renderSidebarCourseNav(all, progressPct) {
    if (!el.sidebarCourseNav) return;
    var done = doneLessonCount(progressPct, all.length);

    el.sidebarCourseNav.innerHTML = all.map(function (entry, index) {
      var lesson = entry.lessonData;
      var active = entry.module === moduleIndex && entry.lesson === lessonIndex;
      var isDone = index < done;
      var isWelcome = /^welcome video$/i.test(String(lesson.title || '').trim());
      var cls = 'player-v2-lesson-card' +
        (active ? ' is-active' : '') +
        (isDone ? ' is-done' : '') +
        (isWelcome ? ' is-welcome' : '');

      return '' +
        '<button type="button" class="' + cls + '" data-module="' + entry.module + '" data-lesson="' + entry.lesson + '">' +
          '<span class="player-v2-lesson-card__ring" aria-hidden="true"></span>' +
          '<span class="player-v2-lesson-card__body">' +
            sidebarTitleHtml(lesson.title) +
            '<span class="player-v2-lesson-card__subtitle">' + escText(truncate(lesson.summary, 72)) + '</span>' +
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
    if (!el.audio) return;
    var current = el.audio.currentTime || 0;
    var duration = el.audio.duration || 0;
    var percent = duration > 0 ? Math.round((current / duration) * 100) : 0;
    if (el.seek) el.seek.value = percent;
    if (el.time) el.time.textContent = formatTime(current) + ' / ' + formatTime(duration);
    var isPlaying = !el.audio.paused;
    if (el.playPause) {
      el.playPause.classList.toggle('is-playing', isPlaying);
      el.playPause.setAttribute('aria-label', isPlaying ? 'Pause audio' : 'Play audio');
    }
  }

  function updateVideoUI() {
    if (!el.heroVisual || el.heroVisual.hidden) return;
    var current = el.heroVisual.currentTime || 0;
    var duration = el.heroVisual.duration || 0;
    var percent = duration > 0 ? Math.round((current / duration) * 100) : 0;
    if (el.videoSeek) el.videoSeek.value = percent;
    if (el.videoTime) {
      el.videoTime.textContent = formatTime(current) + ' / ' + formatTime(duration);
    }
    var isPlaying = !el.heroVisual.paused;
    if (el.videoPlay) el.videoPlay.classList.toggle('is-playing', isPlaying);
    if (el.videoPlaySmall) {
      el.videoPlaySmall.classList.toggle('is-playing', isPlaying);
      el.videoPlaySmall.setAttribute('aria-label', isPlaying ? 'Pause video' : 'Play video');
    }
  }

  function isWelcomeLesson(lesson) {
    return /^welcome video$/i.test(String((lesson && lesson.title) || '').trim());
  }

  function configureHeroVideoPlayback(lesson) {
    if (!el.heroVisual) return;
    var welcome = isWelcomeLesson(lesson);
    el.heroVisual.muted = !welcome;
    el.heroVisual.loop = !welcome;
  }

  function toggleHeroVideo() {
    if (!el.heroVisual || el.heroVisual.hidden) return;
    var lesson = getCurrentLesson();
    var welcome = isWelcomeLesson(lesson);

    if (el.heroVisual.paused) {
      if (welcome) {
        configureHeroVideoPlayback(lesson);
        if (el.audio) el.audio.pause();
      }
      var playAttempt = el.heroVisual.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {
          if (!welcome) return;
          el.heroVisual.muted = true;
          el.heroVisual.play().catch(function () {});
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

    if (el.videoStage) {
      el.videoStage.classList.toggle('is-listen-mode', mode === 'listen');
    }
    if (el.audioPanel) {
      el.audioPanel.hidden = mode !== 'listen';
    }
    if (mode === 'read' && el.contentCard) {
      el.contentCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (mode === 'listen') {
      if (el.heroVisual) el.heroVisual.pause();
      if (el.audio) {
        el.audio.play().catch(function () {
          if (el.error) el.error.hidden = false;
        });
        updateAudioUI();
      }
    }
    if (mode === 'watch' && el.heroVisual && !el.heroVisual.hidden) {
      playHeroVideoWhenReady(getCurrentLesson());
    }
  }

  function playHeroVideoWhenReady(lesson) {
    if (!el.heroVisual || el.heroVisual.hidden) return;
    configureHeroVideoPlayback(lesson);
    var shouldAutoplay = !isWelcomeLesson(lesson);

    function tryPlay() {
      el.heroVisual.setAttribute('playsinline', '');
      el.heroVisual.setAttribute('webkit-playsinline', '');
      if (!shouldAutoplay) {
        updateVideoUI();
        return;
      }
      var p = el.heroVisual.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
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

  function forceHeroVideo(src, lesson) {
    if (!el.heroVisual || !el.heroSource || !el.heroImage) return;

    el.heroImage.hidden = true;
    el.heroImage.removeAttribute('src');
    el.heroVisual.hidden = false;
    if (el.videoStage) {
      el.videoStage.classList.remove('is-image-mode', 'is-no-video');
    }

    el.heroVisual.pause();
    el.heroVisual.currentTime = 0;
    el.heroSource.src = src;
    el.heroVisual.load();
    playHeroVideoWhenReady(lesson);
  }

  function applyHeroVisual(lesson) {
    var hv = lesson && lesson.heroVisual;
    if (!el.heroVisual || !el.heroSource || !el.heroImage) return;

    if (!hv || !hv.src) {
      if (el.videoStage) el.videoStage.classList.add('is-no-video');
      forceHeroVideo(el.heroSource.src || 'videos/4982409-hd_1920_1080_25fps.mp4', lesson);
      return;
    }

    if (hv.type === 'image') {
      el.heroVisual.pause();
      el.heroVisual.hidden = true;
      el.heroImage.hidden = false;
      el.heroImage.src = hv.src;
      el.heroImage.alt = hv.alt || 'Talk illustration';
      if (el.videoStage) el.videoStage.classList.add('is-image-mode');
      if (el.videoPlay) el.videoPlay.hidden = true;
      return;
    }

    if (el.videoPlay) el.videoPlay.hidden = false;
    forceHeroVideo(hv.src, lesson);
  }

  function bindAudioEvents() {
    if (!el.audio) return;

    el.audio.addEventListener('timeupdate', updateAudioUI);
    el.audio.addEventListener('loadedmetadata', updateAudioUI);
    el.audio.addEventListener('error', function () {
      if (el.error) el.error.hidden = false;
    });

    if (el.playPause) {
      el.playPause.addEventListener('click', function () {
        if (el.audio.paused) {
          el.audio.play().catch(function () { if (el.error) el.error.hidden = false; });
        } else {
          el.audio.pause();
        }
        updateAudioUI();
      });
    }

    if (el.listenCta) {
      el.listenCta.addEventListener('click', function () {
        setLessonMode('listen');
      });
    }

    if (el.seek) {
      el.seek.addEventListener('input', function () {
        if (!el.audio.duration) return;
        el.audio.currentTime = (Number(el.seek.value) / 100) * el.audio.duration;
      });
    }

    if (el.speed) {
      el.speed.addEventListener('change', function () {
        el.audio.playbackRate = Number(el.speed.value);
      });
    }

    if (el.transcriptToggle && el.transcript) {
      el.transcriptToggle.addEventListener('click', function () {
        var isHidden = el.transcript.hidden;
        el.transcript.hidden = !isHidden;
        el.transcriptToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });
    }
  }

  function bindVideoEvents() {
    if (!el.heroVisual) return;

    el.heroVisual.addEventListener('timeupdate', updateVideoUI);
    el.heroVisual.addEventListener('loadedmetadata', updateVideoUI);
    el.heroVisual.addEventListener('play', updateVideoUI);
    el.heroVisual.addEventListener('pause', updateVideoUI);

    if (el.videoPlay) el.videoPlay.addEventListener('click', toggleHeroVideo);
    if (el.videoPlaySmall) el.videoPlaySmall.addEventListener('click', toggleHeroVideo);

    if (el.videoSeek) {
      el.videoSeek.addEventListener('input', function () {
        if (!el.heroVisual.duration) return;
        el.heroVisual.currentTime = (Number(el.videoSeek.value) / 100) * el.heroVisual.duration;
      });
    }
  }

  function bindModeTabs() {
    Array.prototype.forEach.call(el.modeTabs || [], function (btn) {
      btn.addEventListener('click', function () {
        setLessonMode(btn.getAttribute('data-mode'));
      });
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
    var total = flattenItems().length;
    var current = absoluteLessonIndex() + 1;
    var pct = Math.round((current / total) * 100);
    common.setCourseProgress(course.id, pct);
    goToNext();
  }

  function navigateToLesson(m, l) {
    moduleIndex = Number(m);
    lessonIndex = Number(l);
    clampPosition();
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
      renderPills(lesson);
      if (el.intro) el.intro.textContent = lesson.summary;
      renderCallout(lesson);
      if (el.lessonSections) el.lessonSections.innerHTML = buildSectionsHtml(lesson);
      if (el.lessonPosition) {
        el.lessonPosition.textContent = 'Lesson ' + currentAbs + ' of ' + all.length;
      }

      applyHeroVisual(lesson);

      if (el.audio && lesson.audio && lesson.audio.audioUrl) {
        el.audio.src = lesson.audio.audioUrl;
        el.audio.load();
      }
      if (el.transcript) el.transcript.textContent = lesson.audio ? lesson.audio.transcript : '';
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
  }

  function init() {
    setOnlineState();
    setNavState();
    setLessonMode('watch');

    setTimeout(function () {
      if (el.preloader) el.preloader.classList.add('is-hidden');
    }, 900);

    window.addEventListener('online', setOnlineState);
    window.addEventListener('offline', setOnlineState);

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) {
        navOpen = true;
        setNavState();
      }
    });

    if (el.toggleNav) {
      el.toggleNav.addEventListener('click', function () {
        navOpen = !navOpen;
        setNavState();
      });
    }

    if (el.prev) el.prev.addEventListener('click', goToPrevious);
    if (el.next) el.next.addEventListener('click', goToNext);
    if (el.complete) el.complete.addEventListener('click', markComplete);

    if (el.sidebarCourseNav) {
      el.sidebarCourseNav.addEventListener('click', function (e) {
        var lessonBtn = e.target.closest('.player-v2-lesson-card[data-lesson]');
        if (lessonBtn && lessonBtn.hasAttribute('data-module')) {
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
