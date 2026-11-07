import { google } from "googleapis";

export interface DecodedEmail {
  message_id: string;
  sender: string;
  subject: string;
  body: string;
  email_date: string;
  snippet?: string;
}

export interface PrioritizedAnalyzedEmail extends DecodedEmail {
  analysis: {
    category: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    summary: string;
    extractedDeadline?: string;
    actionItems: string[];
  };
  priorityScore: number;
}

export class GmailIntegrationService {
  private getOAuthClient(redirectUri?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect =
      redirectUri ||
      (process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
        : "http://localhost:3000/api/gmail/callback");

    return new google.auth.OAuth2(clientId, clientSecret, redirect);
  }

  /**
   * Generates Google OAuth URL restricted strictly to @anits.edu.in accounts
   */
  public generateAuthUrl(userEmail?: string, redirectUri?: string): string {
    const oauthClient = this.getOAuthClient(redirectUri);

    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return oauthClient.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      hd: "anits.edu.in", // Restrict account picker to ANITS Google Workspace
      login_hint: userEmail || undefined,
    });
  }

  /**
   * Exchanges authorization code for OAuth tokens
   */
  public async exchangeCodeForTokens(code: string, redirectUri?: string) {
    const oauthClient = this.getOAuthClient(redirectUri);
    const { tokens } = await oauthClient.getToken(code);
    return tokens;
  }

  /**
   * Decodes Base64Url string from Gmail message body payload
   */
  private decodeBase64(encoded: string): string {
    try {
      const sanitized = encoded.replace(/-/g, "+").replace(/_/g, "/");
      const buff = Buffer.from(sanitized, "base64");
      return buff.toString("utf-8");
    } catch {
      return "";
    }
  }

  /**
   * Extracts clean text content from Gmail message payload parts
   */
  private extractMessageBody(payload: any): string {
    if (!payload) return "";

    if (payload.body && payload.body.data) {
      return this.decodeBase64(payload.body.data);
    }

    if (payload.parts && Array.isArray(payload.parts)) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          return this.decodeBase64(part.body.data);
        }
      }
      for (const part of payload.parts) {
        if (part.mimeType === "text/html" && part.body && part.body.data) {
          const html = this.decodeBase64(part.body.data);
          return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        }
      }
    }

    return "";
  }

  /**
   * Fetches real emails from user's live Gmail account using access token
   */
  public async fetchRealGmailMessages(accessToken: string, maxResults = 5): Promise<DecodedEmail[]> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth });

    // Fetch the first 5 emails directly from user's inbox
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      labelIds: ["INBOX"],
    });

    let messageList = listRes.data.messages || [];

    // Fallback if INBOX label filter returns empty
    if (messageList.length === 0) {
      const fallbackList = await gmail.users.messages.list({
        userId: "me",
        maxResults,
      });
      messageList = fallbackList.data.messages || [];
    }

    const decodedList: DecodedEmail[] = [];

    for (const msg of messageList) {
      if (!msg.id) continue;
      try {
        const fullMsg = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        const headers = fullMsg.data.payload?.headers || [];
        const subjectHeader = headers.find((h) => h.name?.toLowerCase() === "subject");
        const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from");
        const dateHeader = headers.find((h) => h.name?.toLowerCase() === "date");

        const subject = subjectHeader?.value || "ANITS Campus Notice";
        const sender = fromHeader?.value || "admin@anits.edu.in";
        const emailDate = dateHeader?.value ? new Date(dateHeader.value).toISOString() : new Date().toISOString();
        const body = this.extractMessageBody(fullMsg.data.payload) || fullMsg.data.snippet || "";

        decodedList.push({
          message_id: msg.id,
          sender,
          subject,
          body,
          email_date: emailDate,
          snippet: fullMsg.data.snippet || "",
        });
      } catch (itemErr) {
        console.warn(`Error fetching individual Gmail message ${msg.id}:`, itemErr);
      }
    }

    return decodedList;
  }

  /**
   * Prioritizes analyzed emails by extracted deadline date, urgency priority, and freshness
   */
  public prioritizeEmails(analyzedEmails: Array<any>): PrioritizedAnalyzedEmail[] {
    const priorityWeights: Record<string, number> = {
      URGENT: 4000,
      HIGH: 3000,
      NORMAL: 2000,
      LOW: 1000,
    };

    const scored = analyzedEmails.map((email) => {
      let score = priorityWeights[email.analysis?.priority] || 1000;

      // Deadline weight: earlier upcoming deadlines get higher score
      if (email.analysis?.extractedDeadline) {
        const deadlineTime = new Date(email.analysis.extractedDeadline).getTime();
        const now = Date.now();
        const diffDays = (deadlineTime - now) / (1000 * 60 * 60 * 24);

        if (diffDays >= 0 && diffDays <= 3) {
          score += 1500; // Imminent deadline within 3 days
        } else if (diffDays > 3 && diffDays <= 10) {
          score += 800; // Approaching deadline within 10 days
        } else if (diffDays > 10) {
          score += 300;
        }
      }

      // Freshness weight: boost recent emails
      const emailTime = new Date(email.email_date).getTime();
      const ageHours = (Date.now() - emailTime) / (1000 * 60 * 60);
      if (ageHours < 24) score += 200;
      else if (ageHours < 72) score += 100;

      return {
        ...email,
        priorityScore: score,
      };
    });

    // Sort descending by priorityScore
    return scored.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}

export const gmailService = new GmailIntegrationService();
