import { siteConfig } from '@/lib/site.config';

type BaseUrlProps = {
  variant?: 'primary' | 'global';
};

export function BaseUrl({ variant = 'primary' }: BaseUrlProps) {
  return (
    <code>
      {variant === 'global'
        ? siteConfig.globalBaseUrl
        : siteConfig.primaryBaseUrl}
    </code>
  );
}
