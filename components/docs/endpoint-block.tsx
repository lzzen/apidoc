import { siteConfig } from '@/lib/site.config';

type EndpointBlockProps = {
  method: string;
  path: string;
  baseUrl?: 'primary' | 'global';
};

export function EndpointBlock({
  method,
  path,
  baseUrl = 'primary',
}: EndpointBlockProps) {
  const resolvedBase =
    baseUrl === 'global'
      ? siteConfig.globalBaseUrl
      : siteConfig.primaryBaseUrl;
  const resolvedPath = path.replace('{BASE_URL}', resolvedBase);

  return (
    <div className="endpoint-block not-prose">
      <code>
        {method} {resolvedPath}
      </code>
    </div>
  );
}
