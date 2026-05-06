/* course-library-v2.js */
(function () {
  'use strict';

  var common = window.CourseExperienceCommon;
  if (!common) return;

  var courses = common.getCourses();
  var grid = document.getElementById('course-library-v2-grid');
  var emptyState = document.getElementById('course-library-v2-empty');
  var searchInput = document.getElementById('course-library-v2-search');
  var topicSelect = document.getElementById('course-library-v2-topic');
  var audienceSelect = document.getElementById('course-library-v2-audience');
  var durationSelect = document.getElementById('course-library-v2-duration');
  var statusSelect = document.getElementById('course-library-v2-status');

  function uniqueValues(key) {
    var map = {};
    courses.forEach(function (course) { map[course[key]] = true; });
    return Object.keys(map);
  }

  function toMins(durationLabel) {
    var hours = 0;
    var mins = 0;
    var hMatch = durationLabel.match(/(\d+)h/);
    var mMatch = durationLabel.match(/(\d+)m/);
    if (hMatch) hours = Number(hMatch[1]);
    if (mMatch) mins = Number(mMatch[1]);
    return hours * 60 + mins;
  }

  function durationMatches(filter, durationLabel) {
    var mins = toMins(durationLabel);
    if (!filter) return true;
    if (filter === 'short') return mins <= 90;
    if (filter === 'medium') return mins > 90 && mins <= 150;
    if (filter === 'long') return mins > 150;
    return true;
  }

  function statusMatches(filter, course) {
    var progress = common.resolveProgress(course);
    if (!filter) return true;
    if (filter === 'not-started') return progress === 0;
    if (filter === 'in-progress') return progress > 0 && progress < 100;
    if (filter === 'completed') return progress >= 100;
    return true;
  }

  function cardHtml(course) {
    var progress = common.resolveProgress(course);
    var ctaLabel = progress > 0 ? 'Resume course' : 'Start course';
    var safeTitle = course.title.replace(/"/g, '&quot;');
    return '' +
      '<article class="course-v2-card">' +
      '  <img class="course-v2-card__image" src="' + course.heroImage + '" alt="' + safeTitle + '" loading="lazy" decoding="async" />' +
      '  <div class="course-v2-card__body">' +
      '    <div class="course-v2-card__meta">' +
      '      <span>' + course.topic + '</span>' +
      '      <span>' + course.duration + '</span>' +
      '      <span>' + course.lessonCount + ' lessons</span>' +
      '    </div>' +
      '    <h3>' + course.title + '</h3>' +
      '    <p>' + course.description + '</p>' +
      '    <p class="course-v2-card__audience">' + course.audience + ' · ' + course.level + '</p>' +
      '    <div class="course-v2-card__progress-wrap">' +
      '      <div class="course-v2-card__progress-bar" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress + '">' +
      '        <span style="width:' + progress + '%"></span>' +
      '      </div>' +
      '      <strong>' + progress + '% complete</strong>' +
      '    </div>' +
      '    <div class="course-v2-card__actions">' +
      '      <a class="btn btn-primary" href="course-detail-v2.html?course=' + encodeURIComponent(course.id) + '">' + ctaLabel + '</a>' +
      '      <a class="btn btn-secondary" href="course-player-v2.html?course=' + encodeURIComponent(course.id) + '&module=0&lesson=0">Open player</a>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }

  function render() {
    var q = (searchInput.value || '').trim().toLowerCase();
    var topic = topicSelect.value;
    var audience = audienceSelect.value;
    var duration = durationSelect.value;
    var status = statusSelect.value;

    var filtered = courses.filter(function (course) {
      var matchesSearch = !q || (course.title + ' ' + course.description + ' ' + course.topic).toLowerCase().indexOf(q) >= 0;
      var matchesTopic = !topic || course.topic === topic;
      var matchesAudience = !audience || course.audience === audience;
      return matchesSearch &&
        matchesTopic &&
        matchesAudience &&
        durationMatches(duration, course.duration) &&
        statusMatches(status, course);
    });

    grid.innerHTML = filtered.map(cardHtml).join('');
    emptyState.hidden = filtered.length > 0;
  }

  function fillSelect(select, values) {
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  fillSelect(topicSelect, uniqueValues('topic'));
  fillSelect(audienceSelect, uniqueValues('audience'));

  [searchInput, topicSelect, audienceSelect, durationSelect, statusSelect].forEach(function (control) {
    control.addEventListener('input', render);
    control.addEventListener('change', render);
  });

  render();
})();
