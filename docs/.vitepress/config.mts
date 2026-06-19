import { defineConfig } from 'vitepress';
import { siteConfig } from '../../lib/site.config';

export default defineConfig({
  title: siteConfig.brandName,
  description: siteConfig.description,
  lang: 'zh-CN',
  base: './',
  cleanUrls: false,
  themeConfig: {
    siteTitle: siteConfig.brandName,
    sidebar: [{ text: 'gpt-image-2', link: 'gpt-image-2' }],
    outline: { level: [2, 3] },
    search: false,
  },
  router: { prefetchLinks: false },
});
