import { NextRequest, NextResponse } from "next/server";
import { gmailService } from "@/lib/gmail/gmailService";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = request.nextUrl.origin;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/student/gmail?error=${encodeURIComponent(error || "Authorization cancelled")}`);
  }

  try {
    const redirectUri = `${baseUrl}/api/gmail/callback`;
    const tokens = await gmailService.exchangeCodeForTokens(code, redirectUri);

    const response = NextResponse.redirect(`${baseUrl}/student/gmail?connected=true&synced=true`);

    if (tokens.access_token) {
      response.cookies.set("gmail_access_token", tokens.access_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
        sameSite: "lax",
      });
    }

    if (tokens.refresh_token) {
      response.cookies.set("gmail_refresh_token", tokens.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 3600, // 30 days
        sameSite: "lax",
      });
    }

    let studentEmail =
      request.cookies.get("campus_email")?.value ||
      request.cookies.get("campus_session_email")?.value;

    if (tokens.access_token) {
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userInfoRes.json();
        if (googleUser.email) {
          studentEmail = googleUser.email;
          response.cookies.set("campus_email", googleUser.email, { path: "/", maxAge: 604800 });
          response.cookies.set("campus_session", "true", { path: "/", maxAge: 604800 });
        }
      } catch (uiErr) {
        console.warn("Could not fetch Google user info:", uiErr);
      }
    }

    // Attempt to persist token in Supabase gmail_connections table
    try {
      if (studentEmail) {
        const supabase = createAdminClient();
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", studentEmail)
          .maybeSingle();

        if (prof?.id && tokens.access_token) {
          await supabase.from("gmail_connections").upsert({
            student_id: prof.id,
            email_address: studentEmail,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || "",
            token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : new Date(Date.now() + 3600000).toISOString(),
            last_synced_at: new Date().toISOString(),
          }, { onConflict: "student_id" });
        }
      }
    } catch (dbErr) {
      console.warn("Could not save token to Supabase:", dbErr);
    }

    return response;
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/student/gmail?error=${encodeURIComponent(err.message || "Failed to exchange token")}`);
  }
}
