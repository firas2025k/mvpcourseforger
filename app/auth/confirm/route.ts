import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirect_to") ?? "/dashboard";

  // Handle both token and token_hash for backward compatibility
  const tokenToUse = token_hash || token;

  if (tokenToUse && type) {
    const supabase = await createClient();

    try {
      // For email confirmation, use verifyOtp with token_hash
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenToUse,
      });

      if (!error) {
        // Successful verification - redirect to dashboard or specified URL
        redirect(redirectTo);
      } else {
        console.error("Email verification error:", error);
        // Redirect to error page with specific error message
        redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
      }
    } catch (error) {
      console.error("Unexpected error during email verification:", error);
      redirect(
        `/auth/error?error=${encodeURIComponent(
          "An unexpected error occurred during verification"
        )}`
      );
    }
  }

  // Missing required parameters
  console.error("Missing token or type parameters for email verification");
  redirect(
    `/auth/error?error=${encodeURIComponent(
      "Invalid verification link. Please request a new verification email."
    )}`
  );
}

// Handle POST requests for OTP verification from the frontend
export async function POST(request: NextRequest) {
  try {
    const { email, token, type } = await request.json();

    if (!email || !token || !type) {
      return Response.json(
        {
          error:
            "Missing required parameters: email, token, and type are required",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as EmailOtpType,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({
      message: "Email verified successfully",
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
