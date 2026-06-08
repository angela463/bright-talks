/* course-library-v2.js */
(function () {
  'use strict';

  var common = window.CourseExperienceCommon;
  if (!common) return;

  var courses = common.getCourses();
  var root = document.getElementById('course-library-v2-root');
  var emptyState = document.getElementById('course-library-v2-empty');
  var searchInput = document.getElementById('course-library-v2-search');
  var sidebarNav = document.getElementById('bt-library-sidebar-nav');
  var ageFilterRoot = document.getElementById('bt-library-age-filter');
  var mobileNav = document.getElementById('bt-library-mobile-nav');

  var state = {
    courseId: '',
    age: '',
    query: ''
  };

  var ageOptions = [
    { id: '', label: 'All ages' },
    { id: 'early', label: 'Ages 3–6', match: /early|3 to 6|3–6/i },
    { id: 'middle', label: 'Ages 9–13', match: /9 to 13|9–13|middle/i },
    { id: 'teen', label: 'Teens', match: /teen/i }
  ];

  function escText(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function audienceBadge(audience) {
    if (/early/i.test(audience)) return 'Ages 3–6';
    if (/9 to 13|9–13/i.test(audience)) return 'Ages 9–13';
    if (/teen/i.test(audience)) return 'Teens';
    return audience;
  }

  function matchesAge(course) {
    if (!state.age) return true;
    var opt = ageOptions.filter(function (o) { return o.id === state.age; })[0];
    if (!opt || !opt.match) return true;
    return opt.match.test(course.audience + ' ' + course.title);
  }

  function flattenCourseLessons(course) {
    var items = [];
    (course.modules || []).forEach(function (module, mIndex) {
      (module.lessons || []).forEach(function (lesson, lIndex) {
        items.push({ module: mIndex, lesson: lIndex, lessonData: lesson });
      });
    });
    return items;
  }

  function talkLabel(title) {
    if (/^welcome video$/i.test(String(title || '').trim())) return 'Welcome';
    var match = /^(?:Lesson|Talk)\s+(\d+)/i.exec(String(title || ''));
    if (match) return 'Talk ' + match[1];
    return title;
  }

  function displayTitle(title) {
    if (/^welcome video$/i.test(String(title || '').trim())) return 'Welcome Video';
    return String(title || '').replace(/^(?:Lesson|Talk)\s+\d+:\s*/i, '');
  }

  function lessonThumb(lesson, course, index) {
    if (lesson.heroVisual && lesson.heroVisual.type === 'image' && lesson.heroVisual.src) {
      return lesson.heroVisual.src;
    }
    if (/^welcome video$/i.test(String(lesson.title || '').trim()) && course.heroImage) {
      return course.heroImage;
    }
    if (index === 0 && course.heroImage) return course.heroImage;
    return '';
  }

  function playerHref(course, moduleIndex, lessonIndex) {
    return 'course-player-v2.html?course=' + encodeURIComponent(course.id) +
      '&module=' + moduleIndex + '&lesson=' + lessonIndex;
  }

  function progressSummary(course, progress) {
    var total = course.lessonCount || flattenCourseLessons(course).length;
    if (!progress) return 'Not started';
    var done = Math.max(0, Math.min(total, Math.round((progress / 100) * total)));
    if (progress >= 100) return total + ' / ' + total + ' done';
    if (done === 0) return 'In progress';
    return done + ' / ' + total + ' done';
  }

  function isTalkDone(course, progress, lessonIndex, total) {
    if (!progress) return false;
    var doneCount = Math.max(0, Math.min(total, Math.round((progress / 100) * total)));
    return lessonIndex < doneCount;
  }

  function videoItemHtml(course, entry, lessonIndex, total) {
    var lesson = entry.lessonData;
    var progress = common.resolveProgress(course);
    var done = isTalkDone(course, progress, lessonIndex, total) ? ' bt-library-video-item--done' : '';
    var thumb = lessonThumb(lesson, course, lessonIndex);
    var thumbClass = 'bt-library-thumb bt-library-thumb--' + ['a', 'b', 'c', 'd'][lessonIndex % 4];
    var thumbInner = thumb
      ? '<img class="bt-library-thumb__img" src="' + escText(thumb) + '" alt="" loading="lazy" decoding="async" />'
      : '';

    return '' +
      '<a href="' + playerHref(course, entry.module, entry.lesson) + '" class="bt-library-video-item' + done + '">' +
      '  <div class="' + thumbClass + '">' + thumbInner +
      '    <span class="bt-library-thumb__play" aria-hidden="true">' +
      '      <svg width="7" height="8" fill="white" viewBox="0 0 8 9"><path d="M1 1l6 3.5L1 8V1z"/></svg>' +
      '    </span>' +
      '  </div>' +
      '  <div class="bt-library-video-item__info">' +
      '    <div class="bt-library-video-item__title">' + escText(displayTitle(lesson.title)) + '</div>' +
      '    <div class="bt-library-video-item__meta">' + escText(talkLabel(lesson.title)) + ' · ' + escText(lesson.duration) + '</div>' +
      '  </div>' +
      '</a>';
  }

  function seriesBlockHtml(course) {
    var progress = common.resolveProgress(course);
    var lessons = flattenCourseLessons(course);
    var preview = lessons.slice(0, 6);
    var grid = preview.map(function (entry, i) {
      return videoItemHtml(course, entry, i, lessons.length);
    }).join('');

    return '' +
      '<article class="bt-library-series" data-course-id="' + escText(course.id) + '">' +
      '  <header class="bt-library-series__head">' +
      '    <div class="bt-library-series__head-text">' +
      '      <h2>' + escText(course.title) + '</h2>' +
      '      <p>' + escText(course.description) + '</p>' +
      '    </div>' +
      '    <span class="bt-library-series__badge">' + escText(audienceBadge(course.audience)) + '</span>' +
      '  </header>' +
      '  <div class="bt-library-video-grid">' + grid + '</div>' +
      '  <footer class="bt-library-series__foot">' +
      '    <a class="bt-library-see-all" href="' + playerHref(course, course.playerEntry ? course.playerEntry.module : 0, course.playerEntry ? course.playerEntry.lesson : 0) + '">' +
      '      View all ' + lessons.length + ' talks' +
      '      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>' +
      '    </a>' +
      '    <div class="bt-library-prog">' +
      '      <div class="bt-library-prog__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress + '">' +
      '        <span style="width:' + progress + '%"></span>' +
      '      </div>' +
      '      <span>' + escText(progressSummary(course, progress)) + '</span>' +
      '    </div>' +
      '  </footer>' +
      '</article>';
  }

  function filteredCourses() {
    return courses.filter(function (course) {
      var q = state.query;
      var matchesSearch = !q || (course.title + ' ' + course.description + ' ' + course.topic + ' ' + course.audience)
        .toLowerCase().indexOf(q) >= 0;
      var matchesCourse = !state.courseId || course.id === state.courseId;
      return matchesSearch && matchesCourse && matchesAge(course);
    });
  }

  function renderSidebar() {
    if (!sidebarNav) return;
    var items = [{ id: '', label: 'All courses', count: courses.length }];
    courses.forEach(function (course) {
      items.push({ id: course.id, label: course.title.replace(/\s*\(.*\)$/, ''), count: course.lessonCount });
    });

    sidebarNav.innerHTML = items.map(function (item) {
      var active = state.courseId === item.id ? ' is-active' : '';
      return '' +
        '<button type="button" class="bt-library-nav-btn' + active + '" data-course="' + escText(item.id) + '">' +
        '  <span class="bt-library-nav-btn__icon" aria-hidden="true">' +
        '    <svg width="15" height="15" fill="none" stroke-width="2" viewBox="0 0 16 16"><path d="M2 12.5A2.5 2.5 0 014.5 10H14"/><path d="M4.5 1H14v14H4.5A2.5 2.5 0 012 12.5V3.5A2.5 2.5 0 014.5 1z"/></svg>' +
        '  </span>' +
        '  <span class="bt-library-nav-btn__label">' + escText(item.label) + '</span>' +
        '  <span class="bt-library-nav-btn__count">' + item.count + '</span>' +
        '</button>';
    }).join('');
  }

  function renderAgeFilter() {
    if (!ageFilterRoot) return;
    ageFilterRoot.innerHTML = ageOptions.map(function (opt) {
      var active = state.age === opt.id ? ' is-active' : '';
      return '<button type="button" class="bt-library-age-btn' + active + '" data-age="' + escText(opt.id) + '">' + escText(opt.label) + '</button>';
    }).join('');
  }

  function renderMobileNav() {
    if (!mobileNav) return;
    mobileNav.innerHTML = ageOptions.slice(0, 4).map(function (opt) {
      var active = state.age === opt.id ? ' is-active' : '';
      return '' +
        '<button type="button" class="bt-library-mob-btn' + active + '" data-age="' + escText(opt.id) + '">' +
        '  <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24" aria-hidden="true">' +
        '    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2z"/>' +
        '  </svg>' +
        '  ' + escText(opt.label) +
        '</button>';
    }).join('');
  }

  function render() {
    var list = filteredCourses();
    if (root) root.innerHTML = list.map(seriesBlockHtml).join('');
    if (emptyState) emptyState.hidden = list.length > 0;
    renderSidebar();
    renderAgeFilter();
    renderMobileNav();
  }

  function bindEvents() {
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.query = (searchInput.value || '').trim().toLowerCase();
        render();
      });
    }

    if (sidebarNav) {
      sidebarNav.addEventListener('click', function (e) {
        var btn = e.target.closest('.bt-library-nav-btn[data-course]');
        if (!btn) return;
        state.courseId = btn.getAttribute('data-course') || '';
        render();
      });
    }

    if (ageFilterRoot) {
      ageFilterRoot.addEventListener('click', function (e) {
        var btn = e.target.closest('.bt-library-age-btn[data-age]');
        if (!btn) return;
        state.age = btn.getAttribute('data-age') || '';
        render();
      });
    }

    if (mobileNav) {
      mobileNav.addEventListener('click', function (e) {
        var btn = e.target.closest('.bt-library-mob-btn[data-age]');
        if (!btn) return;
        state.age = btn.getAttribute('data-age') || '';
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  bindEvents();
  render();
})();
