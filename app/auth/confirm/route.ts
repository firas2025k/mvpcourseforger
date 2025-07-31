import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirect_to") ?? "/auth/confirm-success";

  if (token && type) {
    const supabase = await createClient();

    // Supabase's verifyOtp for email confirmation expects 'token_hash' for 'signup' type
    // The URL provides 'token', so we use it as 'token_hash'
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: token,
    });
    if (!error) {
      // redirect user to specified redirect URL or success page
      redirect(redirectTo);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
