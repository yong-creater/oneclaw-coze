import PhotoIDGenerator from '@/components/tools/PhotoIDGenerator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI证件照生成 - OneClaw',
  description: '上传照片，AI智能抠图，一键生成合规证件照。支持多种尺寸、底色切换、美颜优化，保护隐私安全。',
  keywords: '证件照生成, AI证件照, 证件照制作, 证件照尺寸, 证件照底色',
};

export default function PhotoIDPage() {
  return <PhotoIDGenerator />;
}
