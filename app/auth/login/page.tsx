import { LoginForm } from "@/components/login-form";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
