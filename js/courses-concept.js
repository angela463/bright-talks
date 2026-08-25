/* courses-concept.js — courses landing with age-band accordion */
(function () {
  'use strict';

  var common = window.CourseExperienceCommon;
  if (!common) return;

  var seriesMeta = [
    {
      courseId: 'bt-foundations-early-years',
      num: '01',
      title: 'Body Safety Foundations',
      age: 'Ages 3 to 5',
      status: 'available',
      statusLabel: 'Available'
    },
    {
      courseId: 'bt-middle-childhood',
      num: '02',
      title: 'Growing Up',
      age: 'Ages 6 to 8',
      status: 'available',
      statusLabel: 'Available'
    },
    {
      courseId: 'bt-puberty-conversations',
      num: '03',
      title: 'Puberty Conversations',
      age: 'Ages 9 to 12',
      status: 'progress',
      statusLabel: 'In progress'
    },
    {
      courseId: 'bt-teen-digital-safety',
      num: '04',
      title: 'Teen Digital Safety',
      age: 'Teens',
      status: 'soon',
      statusLabel: 'Coming soon'
    }
  ];

  var ageBands = [
    {
      id: 'ages-3-5',
      courseId: 'bt-foundations-early-years',
      moduleIdPrefix: 'm-ey-',
      label: 'Ages 3 to 5',
      title: 'Body Safety Foundations',
      blurb: 'Welcome plus five parent talks on bodies, boundaries, reproduction, online images, and keeping conversations going.',
      openByDefault: true
    },
    {
      id: 'ages-6-8',
      courseId: 'bt-foundations-early-years',
      moduleIdPrefix: 'm-mc-',
      label: 'Ages 6 to 8',
      title: 'Growing Up',
      blurb: 'Five parent talks for growing curiosity, friends’ voices, bigger questions, boundaries, and keeping the door open.',
      openByDefault: false
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
    if (!raw || raw === '—') return '';
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

  function isLessonSoon(lesson) {
    return !!(lesson && lesson.availability === 'soon');
  }

  function flattenCourseLessons(course, moduleIdPrefix) {
    var items = [];
    (course.modules || []).forEach(function (module, mIndex) {
      if (moduleIdPrefix && String(module.id || '').indexOf(moduleIdPrefix) !== 0) return;
      (module.lessons || []).forEach(function (lesson, lIndex) {
        items.push({ module: mIndex, lesson: lIndex, lessonData: lesson });
      });
    });
    return items;
  }

  function lessonRowHtml(course, entry, index) {
    var lesson = entry.lessonData;
    var isWelcome = /^welcome video$/i.test(String(lesson.title || '').trim());
    var soon = isLessonSoon(lesson);
    var num = lessonNumber(lesson.title, index);
    var rowClass = 'cc-lesson-row' + (isWelcome ? ' cc-lesson-row--welcome' : '');
    var numClass = 'cc-lesson-row__num' + (isWelcome ? ' cc-lesson-row__num--start' : '');
    var href = playerHref(course.id, entry.module, entry.lesson);
    var statusHtml = '';
    var ctaHtml = '';

    if (soon) {
      statusHtml = '<span class="cc-lesson-row__status cc-lesson-row__status--soon">Coming soon</span>';
    } else if (isWelcome) {
      statusHtml = '<span class="cc-lesson-row__status cc-lesson-row__status--start">Start here</span>';
      ctaHtml = '<a class="cc-lesson-row__link cc-lesson-row__link--btn" href="' + escText(href) + '">Open</a>';
    } else {
      statusHtml = '<span class="cc-lesson-row__status cc-lesson-row__status--ready">Ready</span>';
      ctaHtml = '<a class="cc-lesson-row__link cc-lesson-row__link--btn" href="' + escText(href) + '">View talk</a>';
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
  }

  function renderAgeAccordion() {
    var root = document.getElementById('cc-age-accordion');
    if (!root) return;

    root.innerHTML = ageBands.map(function (band) {
      var course = common.getCourseById(band.courseId);
      if (!course) return '';

      var items = flattenCourseLessons(course, band.moduleIdPrefix);
      var talkCount = items.filter(function (entry) {
        return !/^welcome video$/i.test(String(entry.lessonData.title || '').trim());
      }).length;
      var isOpen = !!band.openByDefault;
      var panelId = 'cc-age-panel-' + band.id;
      var toggleId = 'cc-age-toggle-' + band.id;

      return '' +
        '<section class="cc-age-band' + (isOpen ? ' is-open' : '') + '" data-age-band="' + escText(band.id) + '">' +
          '<button type="button" class="cc-age-band__toggle" id="' + toggleId + '"' +
            ' aria-expanded="' + (isOpen ? 'true' : 'false') + '"' +
            ' aria-controls="' + panelId + '">' +
            '<span class="cc-age-band__mark" aria-hidden="true"></span>' +
            '<span class="cc-age-band__copy">' +
              '<span class="cc-age-band__label">' + escText(band.label) + '</span>' +
              '<span class="cc-age-band__title">' + escText(band.title) + '</span>' +
              '<span class="cc-age-band__blurb">' + escText(band.blurb) + '</span>' +
            '</span>' +
            '<span class="cc-age-band__aside">' +
              '<span class="cc-age-band__count">' + talkCount + ' talks</span>' +
              '<svg class="cc-age-band__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
            '</span>' +
          '</button>' +
          '<div class="cc-age-band__panel" id="' + panelId + '" role="region" aria-labelledby="' + toggleId + '"' +
            (isOpen ? '' : ' hidden') + '>' +
            '<ol class="cc-lesson-list">' +
              items.map(function (entry, index) {
                return lessonRowHtml(course, entry, index);
              }).join('') +
            '</ol>' +
          '</div>' +
        '</section>';
    }).join('');
  }

  function bindAgeAccordion() {
    var root = document.getElementById('cc-age-accordion');
    if (!root) return;

    root.addEventListener('click', function (e) {
      var toggle = e.target.closest('.cc-age-band__toggle');
      if (!toggle) return;

      var band = toggle.closest('.cc-age-band');
      if (!band) return;

      var willOpen = !band.classList.contains('is-open');
      var panel = band.querySelector('.cc-age-band__panel');

      band.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (panel) panel.hidden = !willOpen;
    });
  }

  function seriesButton(meta, course) {
    if (meta.status === 'soon' || meta.status === 'progress') {
      return '<span class="cc-series-card__btn" aria-disabled="true">' +
        escText(meta.statusLabel) + '</span>';
    }
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
    renderAgeAccordion();
    bindAgeAccordion();
    renderSeriesCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
