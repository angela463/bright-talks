(function () {
  'use strict';

  var tabs = document.querySelectorAll('.teen-tab');
  var panels = document.querySelectorAll('.teen-panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-target');
      if (!target) return;

      tabs.forEach(function (t) {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        var isTeen = target === 'teens' && panel.id === 'teen-panel';
        var isParent = target === 'parents' && panel.id === 'parent-panel';
        var show = isTeen || isParent;
        panel.classList.toggle('teen-panel--hidden', !show);
      });
    });
  });
})();

