import { redirect } from 'next/navigation';

export default function SenatePage() {
  redirect('/congress?chamber=senate');
}
