(function () {
  'use strict';

  var modal = document.getElementById('video-modal');
  var modalBackdrop = document.getElementById('video-modal-backdrop');
  var modalClose = document.getElementById('video-modal-close');
  var modalIframe = document.getElementById('video-modal-iframe');
  var modalTitle = document.getElementById('video-modal-title');

  function openVideo(videoId, title) {
    if (!modal || !modalIframe) return;
    var url = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1';
    modalIframe.src = url;
    if (modalTitle) modalTitle.textContent = title || 'Video playback';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    if (!modal || !modalIframe) return;
    modal.hidden = true;
    modalIframe.src = '';
    document.body.style.overflow = '';
  }

  function initFilters() {
    var pills = document.querySelectorAll('.filter-pill');
    var cards = document.querySelectorAll('.video-card');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');
        pills.forEach(function (p) {
          p.classList.toggle('active', p === pill);
          p.setAttribute('aria-pressed', p === pill ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          var show = filter === 'all' || category === filter;
          card.classList.toggle('hidden-by-filter', !show);
        });
      });
    });
  }

  function initPlayButtons() {
    document.querySelectorAll('.video-play-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-video-id');
        var title = this.getAttribute('data-video-title') || 'Video';
        if (id) openVideo(id, title);
      });
    });
  }

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideo);
  if (modalClose) modalClose.addEventListener('click', closeVideo);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeVideo();
  });

  initFilters();
  initPlayButtons();
})();
