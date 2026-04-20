(function () {
  'use strict';

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function safe(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function byId(id) {
    return document.getElementById(id);
  }

  var courses = window.BRIGHT_TALKS_COURSES || [];

  /** Course library: only these show “View modules”; others are coming soon. */
  var COURSE_LIBRARY_OPEN_IDS = ['ages-3-5', 'ages-6-8'];

  function courseLibraryIsOpen(course) {
    return COURSE_LIBRARY_OPEN_IDS.indexOf(course.id) >= 0;
  }

  function renderCourses() {
    var root = byId('course-grid-root');
    if (!root) return;

    var search = byId('course-search');
    var age = byId('course-age-filter');

    function getFiltered() {
      var term = (search && search.value || '').toLowerCase().trim();
      var ageVal = (age && age.value) || '';
      return courses.filter(function (c) {
        var matchesTerm = !term || c.title.toLowerCase().indexOf(term) >= 0 || c.description.toLowerCase().indexOf(term) >= 0;
        var matchesAge = !ageVal || c.ageGroup === ageVal;
        return matchesTerm && matchesAge;
      });
    }

    function draw() {
      var items = getFiltered();
      root.innerHTML = items.map(function (c) {
        var computedModuleCount = (c.modules || []).length;
        var computedLessonCount = (c.modules || []).reduce(function (acc, m) {
          return acc + ((m.lessons || []).length || 0);
        }, 0);
        var moduleCount = typeof c.moduleTotal === 'number' ? c.moduleTotal : computedModuleCount;
        var lessonCount = typeof c.lessonTotal === 'number' ? c.lessonTotal : computedLessonCount;
        var metaText = '';
        if (c.metaLabel) {
          metaText = safe(c.metaLabel);
        } else if (moduleCount || lessonCount) {
          metaText = moduleCount + ' modules · ' + lessonCount + ' lessons';
        }
        var ctaHtml = courseLibraryIsOpen(c)
          ? '<a class="btn btn-primary" href="module-detail.html?course=' + encodeURIComponent(c.id) + '&module=0">View lessons</a>'
          : '<span class="btn course-card-cta course-card-cta--soon" role="status">Coming soon</span>';
        return (
          '<article class="course-card">' +
            '<div class="course-cover" style="background-image:url(\'' + safe(c.image) + '\')"></div>' +
            '<div class="course-body">' +
              '<span class="chip">' + safe(c.ageGroup) + '</span>' +
              '<h3>' + safe(c.title) + '</h3>' +
              '<p>' + safe(c.description) + '</p>' +
              (metaText ? '<div class="course-meta">' + metaText + '</div>' : '') +
              ctaHtml +
            '</div>' +
          '</article>'
        );
      }).join('');
    }

    if (search) search.addEventListener('input', draw);
    if (age) age.addEventListener('change', draw);
    draw();
  }

  function renderCourseDetail() {
    var root = byId('module-list-root');
    if (!root) return;
    var courseId = qs('course') || 'ages-3-5';
    var course = courses.find(function (c) { return c.id === courseId; }) || courses[0];
    if (!course) return;

    var title = byId('course-detail-title');
    var desc = byId('course-detail-description');
    var age = byId('course-detail-age');
    var bullets = byId('course-detail-bullets');
    if (title) title.textContent = course.title;
    if (desc) desc.textContent = course.description;
    if (age) age.textContent = course.ageGroup;
    if (bullets) {
      var points = course.learningPoints || [];
      bullets.innerHTML = points.map(function (line) {
        return '<li>' + safe(line) + '</li>';
      }).join('');
    }

    root.innerHTML = (course.modules || []).map(function (m, idx) {
      var lessons = (m.lessons || []);
      var summary = 'Explore foundational concepts and parent ready language for this stage.';
      var startHref =
        'lesson-player.html?course=' +
        encodeURIComponent(course.id) +
        '&module=' +
        idx +
        '&lesson=0';
      return (
        '<article class="module-card">' +
          '<div class="module-top"><span class="module-index">Module ' + (idx + 1) + '</span><span class="tag">' + lessons.length + ' lessons</span></div>' +
          '<h3>' + safe(m.title || ('Module ' + (idx + 1))) + '</h3>' +
          '<p>' + safe(summary) + '</p>' +
          '<a class="btn btn-primary" href="' + startHref + '">Start lessons</a>' +
        '</article>'
      );
    }).join('');
  }

  function lessonTitle(lesson) {
    return typeof lesson === 'string' ? lesson : (lesson && lesson.title) || '';
  }

  function countUnlockedLessons(lessons) {
    return (lessons || []).reduce(function (acc, lesson) {
      return acc + ((typeof lesson === 'object' && lesson && lesson.unlocked === true) ? 1 : 0);
    }, 0);
  }

  function totalLessonMinutes(lessons) {
    return (lessons || []).reduce(function (acc, lesson) {
      if (typeof lesson === 'object' && lesson && lesson.durationMinutes) {
        return acc + lesson.durationMinutes;
      }
      return acc + 8;
    }, 0);
  }

  function lessonArtwork(idx) {
    var art = [
      'images/pexels-max-fischer-5212331.jpg',
      'images/pexels-emma-bauso-1183828-2253879.jpg',
      'images/pexels-julia-m-cameron-4144531.jpg',
      'images/pexels-antonius-ferret-5274618.jpg',
      'images/pexels-karola-g-5478103.jpg',
      'images/pexels-julia-m-cameron-4144230.jpg',
      'images/pexels-bohlemedia-963713.jpg',
      'images/pexels-olgalioncat-7245594.jpg'
    ];
    return art[idx % art.length];
  }

  function renderModuleDetail() {
    var root = byId('lesson-list-root');
    if (!root) return;

    var courseId = qs('course') || 'ages-3-5';
    var moduleIdx = parseInt(qs('module') || '0', 10);
    var course = courses.find(function (c) { return c.id === courseId; }) || courses[0];
    if (!course) return;
    var modules = course.modules || [];
    var module = modules[moduleIdx] || modules[0];
    if (!module) return;

    var t = byId('module-detail-title');
    var intro = byId('module-detail-description');
    var courseChip = byId('module-course-chip');
    var ageChip = byId('module-age-chip');
    var courseLink = byId('module-course-link');
    var meta = byId('module-detail-meta');
    var previewList = byId('module-preview-list');
    var safeModuleIdx = Math.max(0, modules.indexOf(module));
    var lessons = module.lessons || [];
    var unlockedCount = countUnlockedLessons(lessons);
    var totalMinutes = totalLessonMinutes(lessons);

    if (t) t.textContent = module.title || 'Module';
    if (intro) intro.textContent = 'Short, practical lessons designed to help you learn and apply with confidence.';
    if (courseChip) courseChip.textContent = course.title || 'Course';
    if (ageChip) ageChip.textContent = course.ageGroup || 'Ages';
    if (courseLink) {
      courseLink.href = 'course-detail.html?course=' + encodeURIComponent(course.id);
      courseLink.textContent = course.title || 'Course Modules';
    }
    if (meta) {
      meta.innerHTML =
        '<div class="module-stat"><span class="module-stat-label">Position</span><strong>Module ' + (safeModuleIdx + 1) + ' of ' + modules.length + '</strong></div>' +
        '<div class="module-stat"><span class="module-stat-label">Lessons</span><strong>' + lessons.length + ' total</strong></div>' +
        '<div class="module-stat"><span class="module-stat-label">Available now</span><strong>' + unlockedCount + ' unlocked</strong></div>' +
        '<div class="module-stat"><span class="module-stat-label">Estimated time</span><strong>~' + totalMinutes + ' min</strong></div>';
    }
    if (previewList) {
      previewList.innerHTML = lessons.slice(0, 3).map(function (lesson, idx) {
        var unlocked = typeof lesson === 'object' && lesson && lesson.unlocked === true;
        return (
          '<article class="module-preview-item">' +
            '<span class="module-preview-index">0' + (idx + 1) + '</span>' +
            '<div class="module-preview-copy">' +
              '<h3>' + safe(lessonTitle(lesson)) + '</h3>' +
              '<p>' + safe(unlocked ? 'Ready to start now' : 'Included in the full pathway') + '</p>' +
            '</div>' +
          '</article>'
        );
      }).join('');
    }

    root.innerHTML = lessons.map(function (l, idx) {
      var unlocked = typeof l === 'object' && l && l.unlocked === true;
      var dur = (typeof l === 'object' && l && l.durationMinutes) ? ('~' + l.durationMinutes + ' min') : '~8 min';
      var creator = unlocked ? 'with Bright Talks guided audio' : 'with Bright Talks library access';
      var image = lessonArtwork(idx);
      var lessonPlayerHref =
        'lesson-player.html?course=' +
        encodeURIComponent(course.id) +
        '&module=' +
        safeModuleIdx +
        '&lesson=' +
        idx;
      return (
        '<article class="lesson-card lesson-card--' + (unlocked ? 'unlocked' : 'locked') + '">' +
          '<a class="lesson-card-media" href="' + lessonPlayerHref + '" aria-label="' + (unlocked ? 'Open lesson: ' : 'Open lesson (locked preview): ') + safe(lessonTitle(l)) + '">' +
            '<div class="lesson-card-art" style="background-image:url(\'' + safe(image) + '\')">' +
              '<span class="lesson-index">Lesson ' + (idx + 1) + '</span>' +
              '<span class="lesson-play-button" aria-hidden="true"><span class="lesson-play-triangle"></span></span>' +
            '</div>' +
          '</a>' +
          '<div class="lesson-card-body">' +
            '<div class="lesson-top"><span class="tag">' + safe(dur) + '</span><span class="tag ' + (unlocked ? 'tag-live' : 'locked') + '">' + (unlocked ? 'Audio ready' : 'Locked') + '</span></div>' +
            '<h3><a class="lesson-card-title-link" href="' + lessonPlayerHref + '">' + safe(lessonTitle(l)) + '</a></h3>' +
            '<p class="lesson-byline">' + safe(creator) + '</p>' +
            '<div class="lesson-meta"><span class="lesson-sequence">Part ' + (idx + 1) + ' of ' + lessons.length + '</span></div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderCourses();
      renderCourseDetail();
      renderModuleDetail();
    });
  } else {
    renderCourses();
    renderCourseDetail();
    renderModuleDetail();
  }
})();

