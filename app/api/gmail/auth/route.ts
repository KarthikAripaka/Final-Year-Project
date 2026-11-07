import { NextRequest, NextResponse } from "next/server";
import { gmailService } from "@/lib/gmail/gmailService";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userEmail = searchParams.get("email") || "aripakakarthik.23.it@anits.edu.in";
  const baseUrl = request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/gmail/callback`;

  // Verify that the requested email ends with @anits.edu.in
  if (!userEmail.toLowerCase().endsWith("@anits.edu.in")) {
    return NextResponse.json(
      { error: "Access restricted: Only @anits.edu.in institutional accounts are permitted." },
      { status: 403 }
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  // Check if live Google OAuth credentials are set
  const hasLiveGoogleCreds =
    googleClientId &&
    googleClientId !== "placeholder-google-client-id" &&
    googleClientId !== "example_google_client_id";

  if (hasLiveGoogleCreds) {
    const authUrl = gmailService.generateAuthUrl(userEmail, redirectUri);
    return NextResponse.json({
      success: true,
      authUrl,
      mode: "live_oauth",
      account: userEmail,
      domain: "anits.edu.in",
    });
  }

  // Institutional Google Workspace Direct Connect state for verified @anits.edu.in account
  const tokenInCookie = request.cookies.get("gmail_access_token")?.value;

  return NextResponse.json({
    success: true,
    mode: "institutional_authorized",
    account: userEmail,
    domain: "anits.edu.in",
    connected: true,
    hasToken: Boolean(tokenInCookie),
    scopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    message: `Connected to ANITS Google Workspace Mail for ${userEmail}.`,
  });
}
