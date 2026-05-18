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
    lessonDefault: document.getElementById('player-v2-lesson-default'),
    lessonSplit: document.getElementById('player-v2-lesson-split'),
    lessonTitle: document.getElementById('player-v2-lesson-title'),
    sidebarDefault: document.getElementById('player-v2-sidebar-default'),
    sidebarLessonSlot: document.getElementById('player-v2-sidebar-lesson-slot'),
    canvasHead: document.getElementById('player-v2-canvas-head'),
    canvasLessonTitle: document.getElementById('player-v2-canvas-lesson-title'),
    heroLessonLead: document.getElementById('player-v2-hero-lesson-lead'),
    lessonMeta: document.getElementById('player-v2-lesson-meta'),
    lessonSummary: document.getElementById('player-v2-lesson-summary'),
    lessonSections: document.getElementById('player-v2-lesson-sections'),
    heroVisual: document.getElementById('player-v2-hero-visual'),
    heroSource: document.getElementById('player-v2-hero-source'),
    heroImage: document.getElementById('player-v2-hero-image'),
    lessonNav: document.getElementById('player-v2-lesson-nav'),
    sidebarCourseNav: document.getElementById('player-v2-sidebar-course-nav'),
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

  function formatCanvasLessonTitle(title) {
    if (title === 'Welcome Video') {
      return '<span class="player-v2-lesson-title-accent">Welcome Video</span>';
    }
    var colonIdx = title.indexOf(':');
    if (colonIdx !== -1) {
      return '<span class="player-v2-lesson-title-accent">' + escText(title.slice(0, colonIdx + 1)) + '</span>' +
        escText(title.slice(colonIdx + 1));
    }
    return escText(title);
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

  function buildLessonNav(lesson) {
    var sections = lesson.sections;
    if (!sections || !sections.length) return '';
    var html = '';
    var inSections = false;
    sections.forEach(function (sec, i) {
      var isHeader = sec.type === 'objectives' || sec.title.toLowerCase().indexOf('overview') !== -1;
      if (!isHeader && !inSections) {
        inSections = true;
        html += '<span class="player-v2-lesson-nav__heading">Sections</span>';
      }
      var sub = inSections ? ' player-v2-lesson-nav__item--sub' : '';
      html += '<a href="#player-v2-sec-' + i + '" class="player-v2-lesson-nav__item' + sub + '">' + escText(sec.title) + '</a>';
    });
    return html;
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

  function playHeroVideoWhenReady() {
    if (!el.heroVisual || !el.lessonSplit || el.lessonSplit.hidden) return;
    if (el.heroVisual.hidden) return;

    function tryPlay() {
      el.heroVisual.muted = true;
      el.heroVisual.setAttribute('playsinline', '');
      el.heroVisual.setAttribute('webkit-playsinline', '');
      var p = el.heroVisual.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {});
      }
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

  function forceHeroVideo(src) {
    if (!el.heroVisual || !el.heroSource || !el.heroImage) return;

    el.heroImage.hidden = true;
    el.heroImage.removeAttribute('src');
    el.heroVisual.hidden = false;
    el.heroVisual.pause();
    el.heroVisual.currentTime = 0;

    el.heroSource.src = src;
    el.heroVisual.load();
    el.heroVisual.muted = true;
    el.heroVisual.setAttribute('autoplay', '');
    el.heroVisual.setAttribute('playsinline', '');
    el.heroVisual.setAttribute('webkit-playsinline', '');

    playHeroVideoWhenReady();
  }

  function applyHeroVisual(lesson) {
    var hv = lesson && lesson.heroVisual;
    if (!el.heroVisual || !el.heroSource || !el.heroImage) return;

    if (!hv || !hv.src) {
      forceHeroVideo(el.heroSource.src || 'videos/4982409-hd_1920_1080_25fps.mp4');
      return;
    }

    if (hv.type === 'image') {
      el.heroVisual.pause();
      el.heroVisual.hidden = true;
      el.heroImage.hidden = false;
      el.heroImage.src = hv.src;
      el.heroImage.alt = hv.alt || 'Lesson illustration';
      return;
    }

    forceHeroVideo(hv.src);
  }

  function resetSplitLessonView() {
    var lesson = getCurrentLesson();
    if (!isSplitLesson(lesson)) return;

    var body = document.querySelector('.player-v2-split-body');
    if (body) body.scrollTop = 0;
    window.scrollTo(0, 0);

    applyHeroVisual(lesson);

    if (el.audio && lesson.audio && lesson.audio.audioUrl) {
      el.audio.pause();
      el.audio.currentTime = 0;
      el.audio.src = lesson.audio.audioUrl;
      el.audio.load();
    }
    updateAudioUI();
  }

  function afterSplitRender() {
    requestAnimationFrame(function () {
      resetSplitLessonView();
    });
  }

  function navigateToLesson(m, l) {
    moduleIndex = Number(m);
    lessonIndex = Number(l);
    clampPosition();
    render();
  }

  function renderSidebarCourseNav() {
    if (!el.sidebarCourseNav) return;
    var html = '<p class="player-v2-sidebar-course-nav__label">Course lessons</p>';

    course.modules.forEach(function (module, mIndex) {
      module.lessons.forEach(function (lesson, lIndex) {
        var active = mIndex === moduleIndex && lIndex === lessonIndex ? ' is-active' : '';
        html += '<button type="button" class="player-v2-sidebar-course-nav__item' + active +
          '" data-module="' + mIndex + '" data-lesson="' + lIndex + '">' +
          escText(lesson.title) + '</button>';
      });
    });

    el.sidebarCourseNav.innerHTML = html;
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
    el.lessonMeta.textContent = module.title + ' · ' + lesson.duration;

    el.lessonDefault.hidden = split;
    el.lessonSplit.hidden = !split;

    if (split) {
      navOpen = true;
      setNavState();
      el.body.classList.add('player-v2-is-split-lesson');
      if (el.sidebarDefault) el.sidebarDefault.hidden = true;
      if (el.sidebarLessonSlot) el.sidebarLessonSlot.hidden = false;
      if (el.canvasHead) el.canvasHead.hidden = false;
      if (el.canvasLessonTitle) {
        el.canvasLessonTitle.innerHTML = formatCanvasLessonTitle(lesson.title);
      }
      el.lessonMeta.hidden = false;
      if (el.heroLessonLead) {
        el.heroLessonLead.textContent = lesson.summary || '';
        el.heroLessonLead.hidden = !lesson.summary;
      }
      renderSidebarCourseNav();
      if (el.lessonNav) {
        el.lessonNav.innerHTML = buildLessonNav(lesson);
        Array.prototype.forEach.call(el.lessonNav.querySelectorAll('.player-v2-lesson-nav__item'), function (link) {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(link.getAttribute('href').slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      }
      if (el.lessonSections) el.lessonSections.innerHTML = buildSectionsHtml(lesson);

      var splitHero = document.querySelector('.player-v2-split-hero');
      if (splitHero && el.audioSection) {
        splitHero.appendChild(el.audioSection);
      }
    } else {
      el.body.classList.remove('player-v2-is-split-lesson');
      if (el.canvasHead) el.canvasHead.hidden = true;
      el.lessonMeta.hidden = false;
      if (el.sidebarDefault) el.sidebarDefault.hidden = false;
      if (el.sidebarLessonSlot) el.sidebarLessonSlot.hidden = true;
      if (el.heroVisual) el.heroVisual.pause();
      el.lessonTitle.textContent = lesson.title;
      el.lessonSummary.textContent = lesson.summary;

      if (el.audioSection && el.footer && el.audioSection.parentNode !== el.footer.parentNode) {
        el.footer.parentNode.insertBefore(el.audioSection, el.footer);
      }
      renderCurriculum();
    }

    el.progressFill.style.width = pct + '%';
    if (el.audio && lesson.audio && lesson.audio.audioUrl) {
      el.audio.src = lesson.audio.audioUrl;
      el.audio.load();
    }
    el.transcript.textContent = lesson.audio.transcript;
    el.error.hidden = lesson.audio.status !== 'failed';

    updateAudioUI();

    if (split) {
      afterSplitRender();
    }
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

    if (el.sidebarCourseNav) {
      el.sidebarCourseNav.addEventListener('click', function (e) {
        var lessonBtn = e.target.closest('.player-v2-sidebar-course-nav__item[data-lesson]');
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

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      if (!el.lessonSplit || el.lessonSplit.hidden) return;
      if (!el.heroVisual || el.heroVisual.hidden) return;
      playHeroVideoWhenReady();
    });

    document.addEventListener('click', function (e) {
      var dl = e.target.closest('.player-v2-download-btn.is-placeholder');
      if (dl) e.preventDefault();
    });

    render();
  }

  init();
})();
