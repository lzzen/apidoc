import { DocPage, getDocMetadata, getDocStaticParams } from '@/components/doc-page';

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  return <DocPage slug={params.slug} />;
}

export function generateStaticParams() {
  return getDocStaticParams();
}

export async function generateMetadata(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  return getDocMetadata(params.slug);
}
