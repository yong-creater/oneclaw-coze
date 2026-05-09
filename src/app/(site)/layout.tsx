import SiteShell from '@/components/site/common/SiteShell';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
