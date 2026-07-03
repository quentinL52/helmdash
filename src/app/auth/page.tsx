import { AuthFormsWrapper } from '@/components/auth/auth-forms-wrapper';

export const metadata = {
  title: 'Login | Helmdash',
  description: 'Sign in to your Helmdash workspace',
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
