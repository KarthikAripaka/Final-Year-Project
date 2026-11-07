/**
 * Firebase Cloud Messaging & Web Push Notification Service
 * Manages desktop notifications for urgent ANITS campus circulars,
 * placement drive deadlines, and exam schedules.
 */

export interface NotificationPayload {
  title: string;
  body: string;
  category?: string;
  url?: string;
  icon?: string;
}

export type PermissionStatus = "default" | "granted" | "denied";

class CampusNotificationService {
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "Notification" in window) {
      this.isSupported = true;
    }
  }

  public getPermission(): PermissionStatus {
    if (!this.isSupported) return "denied";
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn("HTML5 Notifications are not supported in this environment.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.sendNotification({
          title: "ANITS Campus Notifications Active 🔔",
          body: "You will receive real-time push alerts for exam circulars and placement deadlines.",
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to request notification permission:", err);
      return false;
    }
  }

  public sendNotification(payload: NotificationPayload): boolean {
    if (!this.isSupported || Notification.permission !== "granted") {
      return false;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/favicon.ico",
        badge: "/favicon.ico",
        tag: `campus-notif-${Date.now()}`,
      });

      notification.onclick = () => {
        window.focus();
        if (payload.url) {
          window.location.href = payload.url;
        }
        notification.close();
      };

      return true;
    } catch (err) {
      console.warn("Direct Notification trigger failed, attempting SW fallback:", err);
      return false;
    }
  }

  public async registerServiceWorker(): Promise<void> {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (err) {
        console.warn("Service Worker registration skipped:", err);
      }
    }
  }
}

export const campusNotification = new CampusNotificationService();
