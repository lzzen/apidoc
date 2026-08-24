import { defineConfig } from 'vitepress';
import type MarkdownIt from 'markdown-it';
import { siteConfig } from '../../lib/site.config';

function tableHeaders(tokens: MarkdownIt.Token[], openIdx: number): string[] {
  const headers: string[] = [];
  for (let i = openIdx + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'table_close') break;
    if (token.type === 'tbody_open') break;
    if (token.type === 'inline' && tokens[i - 1]?.type === 'th_open') {
      headers.push(token.content.trim());
    }
  }
  return headers;
}

function tableClass(tokens: MarkdownIt.Token[], openIdx: number): string | null {
  const headers = tableHeaders(tokens, openIdx);
  if (headers[0] === '项目' && (headers[1] === '说明' || headers[1] === '规则')) {
    return 'api-meta-table';
  }
  if (headers[0] === '参数' && headers.includes('类型')) return 'api-param-table';
  if (headers[0]?.includes('HTTP')) return 'api-error-table';
  if (headers[0] === '场景' || headers[0] === '约束' || headers[0] === '成本项') {
    return 'api-meta-table';
  }
  if (headers[0] === '方式') return 'api-route-table';
  if (headers[0] === '要求') return 'api-meta-table';
  return null;
}

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
    sidebar: [
      { text: 'gpt-image-2', link: 'gpt-image-2' },
      { text: 'Gemini 图像', link: 'gemini-image' },
      { text: '异步生图', link: 'async-image' },
      { text: 'ImgTools', link: 'imgtools' },
      // Seedance 尚未正式上线，暂不进侧栏；正文仍保留 docs/seedance.md
    ],
    outline: {
      level: [2, 3],
      label: '目录',
    },
    search: false,
  },
  router: { prefetchLinks: false },
  markdown: {
    config(md) {
      const renderTableOpen =
        md.renderer.rules.table_open ??
        ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

      md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
        const klass = tableClass(tokens, idx);
        if (klass) tokens[idx].attrSet('class', klass);
        return renderTableOpen(tokens, idx, options, env, self);
      };
    },
  },
});
