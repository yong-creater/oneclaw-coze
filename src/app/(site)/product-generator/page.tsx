import { redirect } from 'next/navigation';

export default function ProductGeneratorPage() {
  redirect('/create?tool=product-generator');
}
