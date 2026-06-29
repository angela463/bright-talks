/* courses-concept.js — experimental courses landing */
(function () {
  'use strict';

  var common = window.CourseExperienceCommon;
  if (!common) return;

  var EARLY_YEARS_ID = 'bt-foundations-early-years';

  var seriesMeta = [
    {
      courseId: 'bt-foundations-early-years',
      num: '01',
      title: 'Bodies, Biology & Anatomy',
      age: 'Ages 3 to 5',
      status: 'available',
      statusLabel: 'Available'
    },
    {
      courseId: 'bt-middle-childhood',
      num: '02',
      title: 'Boundaries & Safety',
      age: 'Ages 6 to 8',
      status: 'available',
      statusLabel: 'Available'
    },
    {
      courseId: 'bt-puberty-conversations',
      num: '03',
      title: 'Reproduction',
      age: 'Ages 9 to 12',
      status: 'progress',
      statusLabel: 'In progress'
    },
    {
      courseId: 'bt-teen-digital-safety',
      num: '04',
      title: 'Porn & Inappropriate Images',
      age: 'Teens',
      status: 'soon',
      statusLabel: 'Coming soon'
    }
  ];

  function escText(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function playerHref(courseId, moduleIndex, lessonIndex) {
    return 'course-player-v2.html?course=' + encodeURIComponent(courseId) +
      '&module=' + moduleIndex + '&lesson=' + lessonIndex;
  }

  function formatDuration(duration) {
    var raw = String(duration || '').trim();
    if (!raw) return '';
    if (/^\d+m$/i.test(raw)) return raw.replace(/m/i, ' min');
    if (/min/i.test(raw)) return raw;
    return raw;
  }

  function displayLessonTitle(title) {
    var t = String(title || '');
    if (/^welcome video$/i.test(t.trim())) return 'Welcome Video';
    return t.replace(/^(?:Lesson|Talk)\s+\d+:\s*/i, '');
  }

  function lessonNumber(title, index) {
    if (/^welcome video$/i.test(String(title || '').trim())) return 'Start';
    var match = /^(?:Lesson|Talk)\s+(\d+)/i.exec(String(title || ''));
    if (match) return match[1];
    return String(index + 1);
  }

  function renderLessonList() {
    var root = document.getElementById('cc-lesson-list');
    if (!root) return;

    var course = common.getCourseById(EARLY_YEARS_ID);
    if (!course) {
      root.innerHTML = '<li class="cc-lesson-row"><div class="cc-lesson-row__body"><p>Lessons loading…</p></div></li>';
      return;
    }

    var items = [];
    course.modules.forEach(function (module, mIndex) {
      (module.lessons || []).forEach(function (lesson, lIndex) {
        items.push({ module: mIndex, lesson: lIndex, lessonData: lesson });
      });
    });

    root.innerHTML = items.map(function (entry, index) {
      var lesson = entry.lessonData;
      var isWelcome = /^welcome video$/i.test(String(lesson.title || '').trim());
      var isFirstTalk = !isWelcome && /^talk\s+1:/i.test(String(lesson.title || '').trim());
      var num = lessonNumber(lesson.title, index);
      var rowClass = 'cc-lesson-row' + (isWelcome ? ' cc-lesson-row--welcome' : '');
      var numClass = 'cc-lesson-row__num' + (isWelcome ? ' cc-lesson-row__num--start' : '');
      var href = playerHref(course.id, entry.module, entry.lesson);
      var statusHtml = '';
      var ctaHtml;

      if (isWelcome) {
        ctaHtml = '<a class="cc-lesson-row__link cc-lesson-row__link--btn" href="' + escText(href) + '">Start here</a>';
      } else if (isFirstTalk) {
        ctaHtml = '<a class="cc-lesson-row__link cc-lesson-row__link--btn" href="' + escText(href) + '">View talk</a>';
      } else {
        statusHtml = '<span class="cc-lesson-row__status cc-lesson-row__status--soon">Coming soon</span>';
        ctaHtml = '';
      }

      return '' +
        '<li class="' + rowClass + '">' +
          '<div class="' + numClass + '">' + escText(num) + '</div>' +
          '<div class="cc-lesson-row__body">' +
            '<h3>' + escText(displayLessonTitle(lesson.title)) + '</h3>' +
            '<p>' + escText(lesson.summary) + '</p>' +
          '</div>' +
          '<div class="cc-lesson-row__meta">' +
            '<span class="cc-lesson-row__time">' + escText(formatDuration(lesson.duration)) + '</span>' +
            statusHtml +
            ctaHtml +
          '</div>' +
        '</li>';
    }).join('');
  }

  function seriesButton(meta, course) {
    var entry = course.playerEntry || { module: 0, lesson: 0 };
    return '<a class="cc-series-card__btn cc-series-card__btn--primary" href="' +
      escText(playerHref(course.id, entry.module, entry.lesson)) + '">Get Started</a>';
  }

  function renderSeriesCards() {
    var root = document.getElementById('cc-series-grid');
    if (!root) return;

    root.innerHTML = seriesMeta.map(function (meta) {
      var course = common.getCourseById(meta.courseId);
      if (!course) return '';

      var statusClass = 'cc-series-card__status--' + meta.status;

      return '<article class="cc-series-card">' +
        '<div class="cc-series-card__top">' +
          '<span class="cc-series-card__num">Course ' + escText(meta.num) + '</span>' +
          '<span class="cc-series-card__age">' + escText(meta.age) + '</span>' +
        '</div>' +
        '<h3 class="cc-series-card__title">' + escText(meta.title) + '</h3>' +
        '<p class="cc-series-card__desc">' + escText(course.description) + '</p>' +
        '<div class="cc-series-card__footer">' +
          '<span class="cc-series-card__status ' + statusClass + '">' + escText(meta.statusLabel) + '</span>' +
          seriesButton(meta, course) +
        '</div>' +
      '</article>';
    }).join('');
  }

  function init() {
    renderLessonList();
    renderSeriesCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
