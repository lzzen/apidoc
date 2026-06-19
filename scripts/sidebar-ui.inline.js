(function () {
  var k = 'apidoc-sidebar-collapsed';
  var r = document.documentElement;
  var bound = false;

  function toggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    r.classList.toggle('sidebar-collapsed');
    try {
      localStorage.setItem(k, r.classList.contains('sidebar-collapsed') ? '1' : '0');
    } catch (err) {}
  }

  function init() {
    var mobile = window.matchMedia('(max-width:768px)').matches;
    try {
      var s = localStorage.getItem(k);
      if (s === '1' || (s === null && mobile)) r.classList.add('sidebar-collapsed');
    } catch (err) {}

    if (bound) return;
    bound = true;

    document.addEventListener(
      'click',
      function (e) {
        var t = e.target.closest('[data-fd-action="sidebar"]');
        if (!t) return;
        toggle(e);
      },
      true,
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
