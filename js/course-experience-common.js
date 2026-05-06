/* course-experience-common.js */
(function () {
  'use strict';

  var KEY = 'brightTalksCourseProgressV2';

  function getCourses() {
    return Array.isArray(window.BRIGHT_TALKS_COURSE_EXPERIENCE) ? window.BRIGHT_TALKS_COURSE_EXPERIENCE : [];
  }

  function getSavedProgress() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function saveProgress(progressMap) {
    try {
      localStorage.setItem(KEY, JSON.stringify(progressMap || {}));
    } catch (err) {
      /* no-op */
    }
  }

  function resolveProgress(course) {
    var saved = getSavedProgress();
    if (saved[course.id] == null) return course.progress || 0;
    return Math.max(0, Math.min(100, Number(saved[course.id]) || 0));
  }

  function setCourseProgress(courseId, value) {
    var saved = getSavedProgress();
    saved[courseId] = Math.max(0, Math.min(100, Number(value) || 0));
    saveProgress(saved);
  }

  function getCourseById(courseId) {
    var courses = getCourses();
    for (var i = 0; i < courses.length; i++) {
      if (courses[i].id === courseId) return courses[i];
    }
    return null;
  }

  function flattenLessons(course) {
    var all = [];
    if (!course || !Array.isArray(course.modules)) return all;
    course.modules.forEach(function (module) {
      (module.lessons || []).forEach(function (lesson) {
        all.push({
          moduleId: module.id,
          moduleTitle: module.title,
          lesson: lesson
        });
      });
    });
    return all;
  }

  function getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  window.CourseExperienceCommon = {
    getCourses: getCourses,
    getCourseById: getCourseById,
    resolveProgress: resolveProgress,
    setCourseProgress: setCourseProgress,
    flattenLessons: flattenLessons,
    getQueryParam: getQueryParam
  };
})();
