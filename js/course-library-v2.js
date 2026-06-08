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
    type: 'video-courses',
    age: '',
    query: ''
  };

  var typeOptions = [
    {
      id: 'video-courses',
      label: 'Video Courses',
      count: courses.length,
      icon: '<svg width="15" height="15" fill="none" stroke-width="2" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="9" rx="1.5"/><path d="M6.5 6.5l3.5 2-3.5 2V6.5z"/></svg>'
    },
    {
      id: 'parent-talks',
      label: 'Parent Talks',
      count: 4,
      icon: '<svg width="15" height="15" fill="none" stroke-width="2" viewBox="0 0 16 16"><path d="M8 1.5a3 3 0 100 6 3 3 0 000-6z"/><path d="M3 14.5c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>'
    },
    {
      id: 'guides',
      label: 'Guides & Scripts',
      count: 8,
      icon: '<svg width="15" height="15" fill="none" stroke-width="2" viewBox="0 0 16 16"><path d="M3 2.5h7l3 3V13a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1z"/><path d="M10 2.5V5.5h3"/><path d="M5 8h6M5 10.5h4"/></svg>'
    },
    {
      id: 'ebooks',
      label: 'eBooks',
      count: 3,
      icon: '<svg width="15" height="15" fill="none" stroke-width="2" viewBox="0 0 16 16"><path d="M2.5 3.5A1.5 1.5 0 014 2h8a1.5 1.5 0 011.5 1.5v11A1.5 1.5 0 0112 16H4a1.5 1.5 0 01-1.5-1.5v-11z"/><path d="M5.5 5h5M5.5 7.5h5M5.5 10h3"/></svg>'
    }
  ];

  var ageOptions = [
    { id: '', label: 'All ages' },
    { id: '2-5', label: 'Ages 2–5', match: /early|2.?5|3.?6/i },
    { id: '6-9', label: 'Ages 6–9', match: /6.?9|middle/i },
    { id: '10-13', label: 'Ages 10–13', match: /9.?13|10.?13|puberty/i },
    { id: 'teen', label: 'Teens', match: /teen/i }
  ];

  var libraryTitles = {
    'bt-foundations-early-years': 'Foundations: Early Years',
    'bt-puberty-conversations': 'Puberty & Growing Up',
    'bt-teen-digital-safety': 'Teen Safety & Relationships'
  };

  function escText(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function libraryTitle(course) {
    return libraryTitles[course.id] || course.title.replace(/\s*\(.*\)$/, '');
  }

  function audienceBadge(course) {
    if (course.id === 'bt-foundations-early-years') return 'Ages 2–5';
    if (course.id === 'bt-puberty-conversations') return 'Ages 10–13';
    if (course.id === 'bt-teen-digital-safety') return 'Teens';
    if (/early/i.test(course.audience)) return 'Ages 2–5';
    if (/9 to 13|9–13|10.?13/i.test(course.audience)) return 'Ages 10–13';
    if (/teen/i.test(course.audience)) return 'Teens';
    return course.audience;
  }

  function matchesAge(course) {
    if (!state.age) return true;
    var opt = ageOptions.filter(function (o) { return o.id === state.age; })[0];
    if (!opt || !opt.match) return true;
    return opt.match.test(course.audience + ' ' + course.title + ' ' + course.id);
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

  function formatDuration(duration) {
    var raw = String(duration || '').trim();
    if (!raw) return '';
    if (/^\d+m$/i.test(raw)) return raw.replace(/m/i, ' min');
    if (/^\d+:\d+$/.test(raw)) {
      var parts = raw.split(':');
      return parts[0] + ' min';
    }
    return raw;
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

  function doneCount(course, progress, total) {
    if (!progress) return 0;
    return Math.max(0, Math.min(total, Math.round((progress / 100) * total)));
  }

  function progressDotsHtml(done, total) {
    var dots = '';
    var i;
    for (i = 0; i < total; i++) {
      dots += '<span class="bt-library-prog-dot' + (i < done ? ' is-done' : '') + '"></span>';
    }
    return dots;
  }

  function progressSummary(done, total) {
    if (done <= 0) return 'Not started';
    if (done >= total) return total + ' of ' + total + ' done';
    return done + ' of ' + total + ' done';
  }

  function isTalkDone(course, progress, lessonIndex, total) {
    return lessonIndex < doneCount(course, progress, total);
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
      '    <div class="bt-library-video-item__meta">' + escText(talkLabel(lesson.title)) + ' · ' + escText(formatDuration(lesson.duration)) + '</div>' +
      '  </div>' +
      '</a>';
  }

  function seriesBlockHtml(course) {
    var progress = common.resolveProgress(course);
    var lessons = flattenCourseLessons(course);
    var preview = lessons.slice(0, 6);
    var done = doneCount(course, progress, lessons.length);
    var grid = preview.map(function (entry, i) {
      return videoItemHtml(course, entry, i, lessons.length);
    }).join('');

    return '' +
      '<article class="bt-library-series" data-course-id="' + escText(course.id) + '">' +
      '  <header class="bt-library-series__head">' +
      '    <div class="bt-library-series__head-text">' +
      '      <h2>' + escText(libraryTitle(course)) + '</h2>' +
      '      <p>' + escText(course.description) + '</p>' +
      '    </div>' +
      '    <span class="bt-library-series__badge">' + escText(audienceBadge(course)) + '</span>' +
      '  </header>' +
      '  <div class="bt-library-video-grid">' + grid + '</div>' +
      '  <footer class="bt-library-series__foot">' +
      '    <a class="bt-library-see-all" href="' + playerHref(course, course.playerEntry ? course.playerEntry.module : 0, course.playerEntry ? course.playerEntry.lesson : 0) + '">' +
      '      View all ' + lessons.length + ' lessons' +
      '      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>' +
      '    </a>' +
      '    <div class="bt-library-prog">' +
      '      <div class="bt-library-prog__dots" aria-hidden="true">' + progressDotsHtml(done, lessons.length) + '</div>' +
      '      <span>' + escText(progressSummary(done, lessons.length)) + '</span>' +
      '    </div>' +
      '  </footer>' +
      '</article>';
  }

  function filteredCourses() {
    if (state.type !== 'video-courses') return [];

    return courses.filter(function (course) {
      var q = state.query;
      var matchesSearch = !q || (course.title + ' ' + course.description + ' ' + course.topic + ' ' + course.audience + ' ' + libraryTitle(course))
        .toLowerCase().indexOf(q) >= 0;
      return matchesSearch && matchesAge(course);
    });
  }

  function renderSidebar() {
    if (!sidebarNav) return;

    sidebarNav.innerHTML = typeOptions.map(function (item) {
      var active = state.type === item.id ? ' is-active' : '';
      var count = item.count;
      if (item.id === 'video-courses') {
        count = courses.reduce(function (sum, course) {
          return sum + flattenCourseLessons(course).length;
        }, 0);
      }
      return '' +
        '<button type="button" class="bt-library-nav-btn' + active + '" data-type="' + escText(item.id) + '">' +
        '  <span class="bt-library-nav-btn__icon" aria-hidden="true">' + item.icon + '</span>' +
        '  <span class="bt-library-nav-btn__label">' + escText(item.label) + '</span>' +
        '  <span class="bt-library-nav-btn__count">' + count + '</span>' +
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

  function renderEmptyState(list) {
    if (!emptyState) return;

    if (state.type !== 'video-courses') {
      emptyState.hidden = false;
      emptyState.querySelector('h2').textContent = 'Coming soon';
      emptyState.querySelector('p').textContent = 'This content type is on the way. Browse Video Courses for now.';
      return;
    }

    emptyState.hidden = list.length > 0;
    emptyState.querySelector('h2').textContent = 'No courses match these filters';
    emptyState.querySelector('p').textContent = 'Adjust your search or age filter and try again.';
  }

  function render() {
    var list = filteredCourses();
    if (root) root.innerHTML = list.map(seriesBlockHtml).join('');
    renderEmptyState(list);
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
        var btn = e.target.closest('.bt-library-nav-btn[data-type]');
        if (!btn) return;
        state.type = btn.getAttribute('data-type') || 'video-courses';
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
