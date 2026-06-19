const STORAGE_KEY = 'apidoc-sidebar-collapsed';

let initialized = false;

export function toggleSidebar(event?: Event) {
  event?.preventDefault();
  event?.stopPropagation();

  const root = document.documentElement;
  root.classList.toggle('sidebar-collapsed');

  try {
    localStorage.setItem(STORAGE_KEY, root.classList.contains('sidebar-collapsed') ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function setupSidebarUi() {
  if (typeof document === 'undefined' || initialized) return;
  initialized = true;

  const root = document.documentElement;
  const mobile = window.matchMedia('(max-width:768px)').matches;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === '1' || (saved === null && mobile)) {
      root.classList.add('sidebar-collapsed');
    }
  } catch {
    /* ignore */
  }

  document.addEventListener(
    'click',
    (event) => {
      const target = (event.target as Element | null)?.closest('[data-fd-action="sidebar"]');
      if (!target) return;
      toggleSidebar(event);
    },
    true,
  );
}
