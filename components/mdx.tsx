import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { BaseUrl } from '@/components/docs/base-url';
import { EndpointBlock } from '@/components/docs/endpoint-block';
import { ParamTable } from '@/components/docs/param-table';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    BaseUrl,
    EndpointBlock,
    ParamTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
