import { defineConfig } from 'vitepress';
import { siteConfig } from '../../lib/site.config';

export default defineConfig({
  title: siteConfig.brandName,
  description: siteConfig.description,
  lang: 'zh-CN',
  base: './',
  cleanUrls: false,
  appearance: false,
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    ],
  ],
  themeConfig: {
    siteTitle: siteConfig.brandName,
    sidebar: [{ text: 'gpt-image-2', link: 'gpt-image-2' }],
    outline: {
      level: [2, 3],
      label: 'On this page',
    },
    search: false,
  },
  router: { prefetchLinks: false },
});
