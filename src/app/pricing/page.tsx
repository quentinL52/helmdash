import { redirect } from 'next/navigation';

/**
 * Page /pricing — redirige vers la section pricing du site vitrine.
 * Page publique (hors (app)) — pas de sidebar, pas d'auth requise.
 */
export default function PricingPage() {
  redirect('/#pricing');
}