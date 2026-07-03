import { AuthFormsWrapper } from '@/components/auth/auth-forms-wrapper';

export const metadata = {
  title: 'Connexion | FounderOS',
  description: 'Connectez-vous à votre espace FounderOS',
};

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthFormsWrapper />
      </div>
    </div>
  );
}
