/* instructor-bio-modal.js */
(function () {
  'use strict';

  var INSTRUCTORS = {
    'heidi-cooper': {
      name: 'Heidi Cooper',
      meta: 'Instructor, Bright Talks',
      focus: 'Foundations: Early Years',
      photo: 'images/instructors/heidi-cooper.png',
      photoAlt: 'Heidi Cooper smiling in a blue shirt.',
      photoClass: '',
      paragraphs: [
        '<strong>Hi, I&rsquo;m Heidi.</strong> I&rsquo;ve spent years walking alongside parents who want to do this well, but feel unsure where to start when a child asks a body question at the dinner table or in the car.',
        'I lead <em>Foundations: Early Years</em>, Bright Talks&rsquo; first course: short, warm lessons that give you practical language for everyday moments, not a lecture you have to get through in one sitting.',
        'My work centers on shame-free language, parent-led pacing, and the belief that trust grows in small, honest answers.'
      ],
      quote: 'Trust grows in the small answers. When you respond calmly to the little questions, your child learns they can come to you with the big ones.'
    },
    'james-rivera': {
      name: 'James Rivera',
      meta: 'Instructor, Bright Talks',
      focus: 'Growing Up: Middle Childhood',
      photo: 'images/instructors/james-rivera.png',
      photoAlt: 'James Rivera smiling with arms crossed.',
      photoClass: 'instructor-bio-modal__photo--warm',
      paragraphs: [
        'James helps parents of children ages 6 to 9 navigate growing bodies, friendships, and curiosity with calm, everyday language.',
        'His Middle Childhood course is built for car rides, bedtime, and the questions that pop up when you least expect them.',
        'Full credentials and bio details are coming soon.'
      ],
      quote: ''
    },
    'nina-okonkwo': {
      name: 'Nina Okonkwo',
      meta: 'Instructor, Bright Talks',
      focus: 'Puberty & Growing Up',
      photo: 'images/instructors/nina-okonkwo.png',
      photoAlt: 'Nina Okonkwo holding an orange book and smiling.',
      photoClass: 'instructor-bio-modal__photo--cream',
      paragraphs: [
        'Nina guides parents through puberty conversations with warmth, clarity, and respect for each child&rsquo;s pace.',
        'Her lessons focus on normalizing change, answering questions honestly, and keeping the door open as kids grow.',
        'Full credentials and bio details are coming soon.'
      ],
      quote: ''
    },
    'maya-chen': {
      name: 'Maya Chen',
      meta: 'Instructor, Bright Talks',
      focus: 'Teen Digital Safety',
      photo: 'images/instructors/maya-chen.png',
      photoAlt: 'Maya Chen smiling with arms crossed.',
      photoClass: 'instructor-bio-modal__photo--golden',
      paragraphs: [
        'Maya supports parents of teens through digital safety, healthy relationships, and the conversations that feel high-stakes.',
        'Her approach is practical and non-punitive: clear standards, open dialogue, and repair when things go wrong.',
        'Full credentials and bio details are coming soon.'
      ],
      quote: ''
    }
  };

  var modal = null;
  var lastTrigger = null;

  function buildModal() {
    if (document.getElementById('instructor-bio-modal')) {
      modal = document.getElementById('instructor-bio-modal');
      return;
    }

    var root = document.createElement('div');
    root.id = 'instructor-bio-modal';
    root.className = 'instructor-bio-modal';
    root.hidden = true;
    root.setAttribute('role', 'presentation');

    root.innerHTML =
      '<div class="instructor-bio-modal__backdrop" data-instructor-bio-close tabindex="-1"></div>' +
      '<div class="instructor-bio-modal__panel" role="dialog" aria-modal="true" aria-labelledby="instructor-bio-modal-title">' +
      '  <button type="button" class="instructor-bio-modal__close" data-instructor-bio-close aria-label="Close bio">&times;</button>' +
      '  <div class="instructor-bio-modal__hero">' +
      '    <div id="instructor-bio-modal-photo-wrap" class="instructor-bio-modal__photo">' +
      '      <img id="instructor-bio-modal-photo" alt="" width="120" height="150" decoding="async" />' +
      '    </div>' +
      '    <div class="instructor-bio-modal__intro">' +
      '      <h2 id="instructor-bio-modal-title"></h2>' +
      '      <p id="instructor-bio-modal-meta" class="instructor-bio-modal__meta"></p>' +
      '      <p id="instructor-bio-modal-focus" class="instructor-bio-modal__focus"></p>' +
      '    </div>' +
      '  </div>' +
      '  <div id="instructor-bio-modal-body" class="instructor-bio-modal__body"></div>' +
      '  <blockquote id="instructor-bio-modal-quote" class="instructor-bio-modal__quote" hidden></blockquote>' +
      '</div>';

    document.body.appendChild(root);
    modal = root;
    bindModalEvents();
  }

  function openBio(id, trigger) {
    var data = INSTRUCTORS[id];
    if (!data) return;

    buildModal();
    lastTrigger = trigger || null;

    var photo = document.getElementById('instructor-bio-modal-photo');
    var photoWrap = document.getElementById('instructor-bio-modal-photo-wrap');
    var title = document.getElementById('instructor-bio-modal-title');
    var meta = document.getElementById('instructor-bio-modal-meta');
    var focus = document.getElementById('instructor-bio-modal-focus');
    var body = document.getElementById('instructor-bio-modal-body');
    var quote = document.getElementById('instructor-bio-modal-quote');

    if (photo) {
      photo.src = data.photo;
      photo.alt = data.photoAlt;
    }
    if (photoWrap) {
      photoWrap.className = 'instructor-bio-modal__photo' + (data.photoClass ? ' ' + data.photoClass : '');
    }
    if (title) title.textContent = data.name;
    if (meta) meta.textContent = data.meta;
    if (focus) focus.textContent = data.focus;
    if (body) {
      body.innerHTML = data.paragraphs.map(function (p) {
        return '<p>' + p + '</p>';
      }).join('');
    }
    if (quote) {
      if (data.quote) {
        quote.hidden = false;
        quote.innerHTML = '&ldquo;' + data.quote + '&rdquo;<cite>' + data.name + '</cite>';
      } else {
        quote.hidden = true;
        quote.innerHTML = '';
      }
    }

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.instructor-bio-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeBio() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  function bindModalEvents() {
    if (!modal || modal.dataset.bound === 'true') return;
    modal.dataset.bound = 'true';

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-instructor-bio-close]')) closeBio();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeBio();
    });
  }

  function bindTriggers() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-instructor-bio]');
      if (!trigger) return;
      e.preventDefault();
      openBio(trigger.getAttribute('data-instructor-bio'), trigger);
    });
  }

  function init() {
    if (window.__btInstructorBioModalReady) return;
    window.__btInstructorBioModalReady = true;
    bindTriggers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BrightTalksInstructorBioModal = {
    open: openBio,
    close: closeBio
  };
})();
