import { SignUpForm } from "@/components/sign-up-form";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function SignUpPage() {
  return (
    <AuthPageLayout>
      <SignUpForm />
    </AuthPageLayout>
  );
}
