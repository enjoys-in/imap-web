import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/mail/u/0/#inbox');
}
