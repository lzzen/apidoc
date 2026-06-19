import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

type DocPageProps = {
  slug?: string[];
};

export async function DocPage({ slug }: DocPageProps) {
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle className="!mb-2 !text-lg !font-semibold !leading-snug">
        {page.data.title}
      </DocsTitle>
      <DocsDescription className="!mb-5 !text-[13px] !leading-relaxed">
        {page.data.description}
      </DocsDescription>
      <DocsBody className="docs-content">
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function getDocMetadata(slug?: string[]): Promise<Metadata> {
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function getDocStaticParams() {
  return source.generateParams();
}
