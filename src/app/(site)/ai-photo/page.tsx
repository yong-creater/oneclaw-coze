import { redirect } from 'next/navigation';

export default function AiPhotoPage() {
  redirect('/create?tool=ai-photo');
}
