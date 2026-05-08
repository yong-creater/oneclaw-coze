import SiteSidebar from '@/components/common/SiteSidebar';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteSidebar />
      <main className="ml-[240px] w-[calc(100%-240px)] min-h-screen">
        {children}
      </main>
    </>
  );
}
