const STORAGE_KEY = 'apidoc-sidebar-collapsed';
const DESKTOP_QUERY = '(min-width: 769px)';

let initialized = false;

export function toggleSidebar(event?: Event) {
  event?.preventDefault();
  event?.stopPropagation();

  const root = document.documentElement;
  root.classList.toggle('sidebar-collapsed');
  syncSidebarState(root.classList.contains('sidebar-collapsed'));

  try {
    localStorage.setItem(STORAGE_KEY, root.classList.contains('sidebar-collapsed') ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function syncSidebarState(isCollapsed: boolean) {
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  document.body.classList.toggle('fd-sidebar-open-mobile', mobile && !isCollapsed);
}

export function setupSidebarUi() {
  if (typeof document === 'undefined' || initialized) return;
  initialized = true;

  const root = document.documentElement;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const desktop = window.matchMedia(DESKTOP_QUERY).matches;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === '1') {
      root.classList.add('sidebar-collapsed');
    } else if (saved === null && mobile) {
      root.classList.add('sidebar-collapsed');
    } else if (desktop) {
      root.classList.remove('sidebar-collapsed');
    }
  } catch {
    /* ignore */
  }

  syncSidebarState(root.classList.contains('sidebar-collapsed'));

  document.addEventListener(
    'click',
    (event) => {
      const target = (event.target as Element | null)?.closest(
        '[data-fd-action="sidebar"], [data-fd-action="sidebar-backdrop"]',
      );
      if (!target) return;
      toggleSidebar(event);
    },
    true,
  );

  const onBreakpoint = () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;
    if (isDesktop) {
      root.classList.remove('sidebar-collapsed');
      try {
        localStorage.setItem(STORAGE_KEY, '0');
      } catch {
        /* ignore */
      }
    } else if (isMobile && !root.classList.contains('sidebar-collapsed')) {
      /* mobile keeps user-opened drawer */
    }
    syncSidebarState(root.classList.contains('sidebar-collapsed'));
  };

  window.matchMedia('(max-width: 768px)').addEventListener('change', onBreakpoint);
  window.matchMedia(DESKTOP_QUERY).addEventListener('change', onBreakpoint);
}
