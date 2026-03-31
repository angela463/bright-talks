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
        return (
          '<article class="course-card">' +
            '<div class="course-cover" style="background-image:url(\'' + safe(c.image) + '\')"></div>' +
            '<div class="course-body">' +
              '<span class="chip">' + safe(c.ageGroup) + '</span>' +
              '<h3>' + safe(c.title) + '</h3>' +
              '<p>' + safe(c.description) + '</p>' +
              '<div class="course-meta">' + moduleCount + ' modules · ' + lessonCount + ' lessons</div>' +
              '<a class="btn btn-primary" href="course-detail.html?course=' + encodeURIComponent(c.id) + '">View modules</a>' +
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
      return (
        '<article class="module-card">' +
          '<div class="module-top"><span class="module-index">Module ' + (idx + 1) + '</span><span class="tag">' + lessons.length + ' lessons</span></div>' +
          '<h3>' + safe(m.title || ('Module ' + (idx + 1))) + '</h3>' +
          '<p>' + safe(summary) + '</p>' +
          '<a class="btn btn-primary" href="module-detail.html?course=' + encodeURIComponent(course.id) + '&module=' + idx + '">Open module</a>' +
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
      var summary = unlocked ? 'Includes a short video, a quick parent takeaway, and clear next-step guidance.' : 'Part of the complete module sequence, available inside the full course library.';
      return (
        '<article class="lesson-card">' +
          '<div class="lesson-card-art" aria-hidden="true"><span class="lesson-index">Lesson ' + (idx + 1) + '</span></div>' +
          '<div class="lesson-card-body">' +
            '<div class="lesson-top"><span class="tag">' + safe(dur) + '</span><span class="tag ' + (unlocked ? 'tag-live' : 'locked') + '">' + (unlocked ? 'Available now' : 'Locked') + '</span></div>' +
            '<h3>' + safe(lessonTitle(l)) + '</h3>' +
            '<p>' + safe(summary) + '</p>' +
            '<div class="lesson-meta"><span class="lesson-sequence">Part ' + (idx + 1) + ' of ' + lessons.length + '</span></div>' +
            '<a class="btn btn-primary" href="courses.html">' + (unlocked ? 'Start lesson' : 'Preview lesson') + '</a>' +
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

