import type { Metadata } from 'next';
import { NotifyForm } from './notify-form';

export const metadata: Metadata = {
  title: 'Helmdash — Pre-launch',
  description: 'Get notified when Helmdash launches.',
};

export default function NotifyPage() {
  return <NotifyForm />;
}