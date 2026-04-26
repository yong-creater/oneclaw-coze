import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '评论审核 - OneClaw管理后台',
  description: '审核用户评论',
};

export default function AdminReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
