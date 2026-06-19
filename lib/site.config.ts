export const siteConfig = {
  brandName: 'Vopeni',
  description: '接口文档与开发指南',
  primaryBaseUrl: 'https://v.openi.one',
  globalBaseUrl: 'https://global.example.com',
  globalTimeout: '120s',
} as const;

/** 子目录部署时设为 `/docs`，根目录部署留空 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';
