import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password | IdeaHub',
    description: 'Set a new password',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
