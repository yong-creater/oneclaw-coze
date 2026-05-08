import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '会员中心 - OneClaw',
  description: '开通OneClaw会员，享受全站无广告、无限查看教程、更多收藏额度等专属权益。OneClaw一站式AI工具导航平台。',
  keywords: ['会员', 'VIP', '会员权益', 'AI工具导航', 'OneClaw'],
};

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
