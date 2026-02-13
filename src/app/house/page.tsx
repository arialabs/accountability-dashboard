import { redirect } from 'next/navigation';

export default function HousePage() {
  redirect('/congress?chamber=house');
}
