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

  /** Course library: only these show “View free lesson”; others show as locked. */
  var COURSE_LIBRARY_OPEN_IDS = ['ages-3-5'];

  var LOCK_ICON_SVG =
    '<svg class="course-lock-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  var LESSON_LOCK_ICON_SVG =
    '<svg class="lesson-lock-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

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
          ? '<a class="btn btn-primary" href="module-detail.html?course=' + encodeURIComponent(c.id) + '&module=0">View free lesson</a>'
          : (
            '<span class="btn course-card-cta course-card-cta--locked" role="status" aria-label="Locked">' +
              LOCK_ICON_SVG +
              '<span>Locked</span>' +
            '</span>'
          );
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

  function lessonIsPlayableUnlocked(lesson, lessonIdx) {
    return typeof lesson === 'object' && lesson && lesson.unlocked === true && lessonIdx === 0;
  }

  function countUnlockedLessons(lessons) {
    return (lessons || []).reduce(function (acc, lesson, idx) {
      return acc + (lessonIsPlayableUnlocked(lesson, idx) ? 1 : 0);
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

  /** Distinct stills for lesson cards (avoid cycling the same few “video-like” thumbs on long modules). */
  function lessonArtwork(moduleIdx, lessonIdx) {
    var art = [
      'images/pexels-max-fischer-5212331.jpg',
      'images/pexels-emma-bauso-1183828-2253879.jpg',
      'images/pexels-julia-m-cameron-4144531.jpg',
      'images/pexels-antonius-ferret-5274618.jpg',
      'images/pexels-karola-g-5478103.jpg',
      'images/pexels-julia-m-cameron-4144230.jpg',
      'images/pexels-bohlemedia-963713.jpg',
      'images/pexels-olgalioncat-7245594.jpg',
      'images/pexels-freestockpro-316820.jpg',
      'images/pexels-ketut-subiyanto-4473441.jpg',
      'images/how-it-works-family.jpg',
      'images/pexels-turgay-koca-405356598-14919198.jpg',
      'images/pexels-vittoriostaffolani-655674.jpg',
      'images/pexels-hngstrm-1939485.jpg',
      'images/pexels-tima-miroshnichenko-5813804.jpg',
      'images/pexels-silverkblack-20459167.jpg',
      'images/pexels-vlada-karpovich-4609085.jpg',
      'images/pexels-fernanda-da-silva-lopes-2055473628-29208526.jpg',
      'images/pexels-zhmkhv-3373282-5511203.jpg',
      'images/images-portraits/pexels-ilayda0700-36593091.jpg',
      'images/images-portraits/pexels-alaxmatias-28513050.jpg',
      'images/images-portraits/pexels-spencphoto-36646353.jpg',
      'images/images-portraits/pexels-konrads-photo-36215318.jpg',
      'images/pexels-cottonbro-6668315.jpg',
      'images/pexels-diva-26419303.jpg',
      'images/pexels-mikhail-nilov-6893360.jpg',
      'images/pexels-sanaan-3075945.jpg',
      'images/pexels-karola-g-6958470.jpg',
      'images/pexels-artempodrez-6951903.jpg',
      'images/promo/promo-01-family-tent.png',
      'images/promo/promo-02-family-bed.png',
      'images/promo/promo-03-hiking.png',
      'images/promo/promo-04-classroom.png',
      'images/promo/promo-05-tablet-learning.png',
      'images/promo/promo-07-family-walk.png',
      'images/promo/promo-08-teen-desk.png'
    ];
    var i = ((moduleIdx || 0) * 37 + (lessonIdx || 0)) % art.length;
    return art[i];
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
        var unlocked = lessonIsPlayableUnlocked(lesson, idx);
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
      var unlocked = lessonIsPlayableUnlocked(l, idx);
      var dur = (typeof l === 'object' && l && l.durationMinutes) ? ('~' + l.durationMinutes + ' min') : '~8 min';
      var creator = unlocked ? 'with Bright Talks guided audio' : 'with Bright Talks library access';
      var image = lessonArtwork(safeModuleIdx, idx);
      var lessonPlayerHref =
        'lesson-player.html?course=' +
        encodeURIComponent(course.id) +
        '&module=' +
        safeModuleIdx +
        '&lesson=' +
        idx;

      var mediaOpen = unlocked
        ? (
          '<a class="lesson-card-media" href="' + lessonPlayerHref + '" aria-label="Open lesson: ' + safe(lessonTitle(l)) + '">'
        )
        : (
          '<div class="lesson-card-media" aria-hidden="true">'
        );
      var mediaClose = unlocked ? '</a>' : '</div>';

      var playControl = unlocked
        ? '<span class="lesson-play-button" aria-hidden="true"><span class="lesson-play-triangle"></span></span>'
        : '<span class="lesson-play-button lesson-play-button--locked" aria-hidden="true">' + LESSON_LOCK_ICON_SVG + '</span>';

      var titleHtml = unlocked
        ? ('<h3><a class="lesson-card-title-link" href="' + lessonPlayerHref + '">' + safe(lessonTitle(l)) + '</a></h3>')
        : ('<h3><span class="lesson-card-title-text">' + safe(lessonTitle(l)) + '</span></h3>');

      var ctaHtml = unlocked
        ? (
          '<a class="btn btn-primary lesson-card-cta" href="' + lessonPlayerHref + '">View free lesson</a>'
        )
        : '';

      return (
        '<article class="lesson-card lesson-card--' + (unlocked ? 'unlocked' : 'locked') + '">' +
          mediaOpen +
            '<div class="lesson-card-art" style="background-image:url(\'' + safe(image) + '\')">' +
              '<span class="lesson-index">Lesson ' + (idx + 1) + '</span>' +
              playControl +
            '</div>' +
          mediaClose +
          '<div class="lesson-card-body">' +
            '<div class="lesson-top"><span class="tag">' + safe(dur) + '</span><span class="tag ' + (unlocked ? 'tag-live' : 'locked') + '">' + (unlocked ? 'Audio ready' : 'Locked') + '</span></div>' +
            titleHtml +
            '<p class="lesson-byline">' + safe(creator) + '</p>' +
            '<div class="lesson-meta"><span class="lesson-sequence">Part ' + (idx + 1) + ' of ' + lessons.length + '</span></div>' +
            ctaHtml +
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

