import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import { setupSidebarUi } from './sidebar-ui';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp() {
    if (!import.meta.env.SSR) {
      setupSidebarUi();
    }
  },
} satisfies Theme;
