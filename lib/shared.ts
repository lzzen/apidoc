import { siteConfig, basePath } from './site.config';

export const appName = siteConfig.brandName;
export { basePath };
/** 子目录部署时文档路由在 basePath 根下，如 /docs/gpt-image-2 */
export const docsRoute = basePath ? '/' : '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'your-org',
  repo: 'apidoc',
  branch: 'main',
};
