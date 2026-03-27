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
        var moduleCount = (c.modules || []).length;
        var lessonCount = (c.modules || []).reduce(function (acc, m) {
          return acc + ((m.lessons || []).length || 0);
        }, 0);
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
      var summary = 'Explore foundational concepts and parent-ready language for this stage.';
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
    if (t) t.textContent = module.title || 'Module';
    if (intro) intro.textContent = 'Short, practical lessons designed to help you learn and apply with confidence.';

    var lessons = module.lessons || [];
    root.innerHTML = lessons.map(function (l, idx) {
      var unlocked = typeof l === 'object' && l && l.unlocked === true;
      var dur = (typeof l === 'object' && l && l.durationMinutes) ? ('~' + l.durationMinutes + ' min') : '~8 min';
      return (
        '<article class="lesson-card">' +
          '<div class="lesson-top"><span class="lesson-index">L' + (idx + 1) + '</span><span class="tag ' + (unlocked ? '' : 'locked') + '">' + (unlocked ? 'Unlocked' : 'Locked') + '</span></div>' +
          '<h3>' + safe(lessonTitle(l)) + '</h3>' +
          '<p>' + safe(unlocked ? 'Includes short video + practical parent notes.' : 'Available in the full course library.') + '</p>' +
          '<div class="lesson-meta"><span class="tag">' + safe(dur) + '</span></div>' +
          '<a class="btn btn-primary" href="courses.html">' + (unlocked ? 'Start lesson' : 'View lesson') + '</a>' +
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

