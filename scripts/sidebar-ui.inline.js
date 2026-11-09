(function () {
  var k = 'apidoc-sidebar-collapsed';
  var r = document.documentElement;
  var bound = false;

  function syncSidebarState() {
    var mobile = window.matchMedia('(max-width:768px)').matches;
    var collapsed = r.classList.contains('sidebar-collapsed');
    document.body.classList.toggle('fd-sidebar-open-mobile', mobile && !collapsed);
  }

  function toggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    r.classList.toggle('sidebar-collapsed');
    syncSidebarState();
    try {
      localStorage.setItem(k, r.classList.contains('sidebar-collapsed') ? '1' : '0');
    } catch (err) {}
  }

  function onBreakpoint() {
    var mobile = window.matchMedia('(max-width:768px)').matches;
    var desktop = window.matchMedia('(min-width:769px)').matches;
    if (desktop) {
      r.classList.remove('sidebar-collapsed');
      try {
        localStorage.setItem(k, '0');
      } catch (err) {}
    }
    syncSidebarState();
  }

  function init() {
    var mobile = window.matchMedia('(max-width:768px)').matches;
    var desktop = window.matchMedia('(min-width:769px)').matches;
    try {
      var s = localStorage.getItem(k);
      if (s === '1') {
        r.classList.add('sidebar-collapsed');
      } else if (s === null && mobile) {
        r.classList.add('sidebar-collapsed');
      } else if (desktop) {
        r.classList.remove('sidebar-collapsed');
      }
    } catch (err) {}

    syncSidebarState();

    if (bound) return;
    bound = true;

    document.addEventListener(
      'click',
      function (e) {
        var t = e.target.closest(
          '[data-fd-action="sidebar"], [data-fd-action="sidebar-backdrop"]',
        );
        if (!t) return;
        toggle(e);
      },
      true,
    );

    window.matchMedia('(max-width:768px)').addEventListener('change', onBreakpoint);
    window.matchMedia('(min-width:769px)').addEventListener('change', onBreakpoint);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
