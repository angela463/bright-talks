/* course-detail-v2.js */
(function () {
  'use strict';

  var common = window.CourseExperienceCommon;
  if (!common) return;

  var courseId = common.getQueryParam('course') || '';
  var course = common.getCourseById(courseId) || common.getCourses()[0];
  if (!course) return;

  var progress = common.resolveProgress(course);
  var heroImage = document.getElementById('course-v2-hero-image');
  var titleEl = document.getElementById('course-v2-title');
  var descEl = document.getElementById('course-v2-description');
  var outcomeEl = document.getElementById('course-v2-outcome');
  var statsEl = document.getElementById('course-v2-stats');
  var resumeLink = document.getElementById('course-v2-resume-link');
  var curriculumRoot = document.getElementById('course-v2-curriculum');
  var progressBar = document.getElementById('course-v2-progress-fill');
  var progressLabel = document.getElementById('course-v2-progress-label');


  var firstModule = 0;
  var firstLesson = 0;
  var cta = progress > 0 && progress < 100 ? 'Resume Course' : 'Start Course';

  heroImage.src = course.heroImage;
  heroImage.alt = course.title;
  titleEl.textContent = course.title;
  descEl.textContent = course.description;
  outcomeEl.textContent = course.outcome;
  statsEl.textContent = course.duration + ' · ' + course.lessonCount + ' lessons · ' + course.topic;
  progressBar.style.width = progress + '%';
  progressLabel.textContent = progress + '% complete';
  resumeLink.textContent = cta;
  resumeLink.href = 'course-player-v2.html?course=' + encodeURIComponent(course.id) + '&module=' + firstModule + '&lesson=' + firstLesson;

  curriculumRoot.innerHTML = course.modules.map(function (module, mIndex) {
    var lessonItems = module.lessons.map(function (lesson, lIndex) {
      return '' +
        '<li class="course-v2-lesson-item">' +
        '  <a href="course-player-v2.html?course=' + encodeURIComponent(course.id) + '&module=' + mIndex + '&lesson=' + lIndex + '">' +
        '    <strong>' + lesson.title + '</strong>' +
        '    <span>' + lesson.duration + ' · ' + lesson.summary + '</span>' +
        '  </a>' +
        '</li>';
    }).join('');

    return '' +
      '<section class="course-v2-module">' +
      '  <h3>' + module.title + '</h3>' +
      '  <p>' + module.objective + '</p>' +
      '  <ol>' + lessonItems + '</ol>' +
      '</section>';
  }).join('');
})();
