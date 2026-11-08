/**
 * Campus AI Text-To-Speech (TTS) Engine
 * Leverages the browser Web Speech API (SpeechSynthesis) with voice selection,
 * speed rate control, and structured speech generation.
 */

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  currentTitle: string;
  playbackRate: number;
}

class CampusSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentTitle: string = "Speech Playback";
  private listeners: Array<(state: TTSState) => void> = [];
  private rate: number = 1.0;
  private isBrowser: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.isBrowser = true;
    }
  }

  private getState(): TTSState {
    return {
      isPlaying: this.synth ? this.synth.speaking && !this.synth.paused : false,
      isPaused: this.synth ? this.synth.paused : false,
      currentText: this.currentUtterance?.text || "",
      currentTitle: this.currentTitle || "Speech Playback",
      playbackRate: this.rate,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public subscribe(fn: (state: TTSState) => void) {
    this.listeners.push(fn);
    fn(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public setPlaybackRate(rate: number) {
    this.rate = rate;
    if (this.currentUtterance && this.synth?.speaking) {
      const text = this.currentUtterance.text;
      const title = this.currentTitle;
      this.stop();
      this.speak(text, title);
    } else {
      this.notify();
    }
  }

  public getPlaybackRate(): number {
    return this.rate;
  }

  public speak(text: string, title: string = "Audio Note"): boolean {
    if (!this.isBrowser || !this.synth) {
      console.warn("SpeechSynthesis is not supported in this browser environment.");
      return false;
    }

    this.stop();

    this.currentTitle = title;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    // Pick best natural voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Natural") ||
        v.name.includes("India") ||
        v.lang === "en-IN" ||
        v.lang === "en-GB" ||
        v.lang === "en-US"
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.notify();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      console.warn("Speech error:", e.error);
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onpause = () => {
      this.notify();
    };

    utterance.onresume = () => {
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
      this.notify();
    }
  }

  /**
   * Constructs natural reading script for an email
   */
  public generateEmailSpeechScript(email: {
    sender: string;
    subject: string;
    analysis: {
      category: string;
      priority: string;
      summary: string;
      extractedDeadline?: string;
      actionItems?: string[];
    };
  }): string {
    let script = `Email notification from ${email.sender.split("<")[0].replace("@", " at ")}. `;
    script += `Subject: ${email.subject}. `;
    script += `Category: ${email.analysis.category}. Priority: ${email.analysis.priority}. `;
    script += `Summary: ${email.analysis.summary}. `;

    if (email.analysis.extractedDeadline) {
      const d = new Date(email.analysis.extractedDeadline);
      script += `Important deadline extracted for: ${d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. `;
    }

    if (email.analysis.actionItems && email.analysis.actionItems.length > 0) {
      script += `Action items: ${email.analysis.actionItems.join(". ")}.`;
    }

    return script;
  }

  /**
   * Generates a date-prioritized speech briefing announcing upcoming deadlines in order of urgency
   */
  public generatePrioritizedDateBriefingScript(
    studentName: string,
    emails: Array<{
      sender: string;
      subject: string;
      email_date: string;
      analysis: {
        category: string;
        summary: string;
        extractedDeadline?: string;
        priority: string;
        actionItems?: string[];
      };
    }>
  ): string {
    if (!emails || emails.length === 0) {
      return `Hello ${studentName || "Student"}. You currently have no pending deadline notices in your verified ANITS inbox. Your academic schedule is up to date.`;
    }

    const itemsWithDeadlines = emails.filter((e) => e.analysis?.extractedDeadline);
    const otherNotices = emails.filter((e) => !e.analysis?.extractedDeadline);

    let script = `Good day, ${studentName || "Student"}. Here is your ANITS Campus Intelligence Briefing with prioritized dates. `;
    
    if (itemsWithDeadlines.length > 0) {
      script += `You have ${itemsWithDeadlines.length} high priority deadline ${itemsWithDeadlines.length === 1 ? "alert" : "alerts"} extracted from your institutional mail. `;

      itemsWithDeadlines.forEach((item, index) => {
        const d = new Date(item.analysis.extractedDeadline!);
        const dateStr = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        const timeDiff = d.getTime() - Date.now();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        let urgencyText = "";
        if (daysLeft < 0) urgencyText = "which is already past due";
        else if (daysLeft === 0) urgencyText = "which is due today";
        else if (daysLeft === 1) urgencyText = "which is due tomorrow";
        else urgencyText = `due in ${daysLeft} days`;

        script += `Priority ${index + 1}: ${item.subject}. Category: ${item.analysis.category}, priority level: ${item.analysis.priority}. Deadline date is ${dateStr}, ${urgencyText}. Summary: ${item.analysis.summary}. `;
        if (item.analysis.actionItems && item.analysis.actionItems.length > 0) {
          script += `Action required: ${item.analysis.actionItems.slice(0, 2).join(". ")}. `;
        }
      });
    }

    if (otherNotices.length > 0) {
      script += `Additionally, you have ${otherNotices.length} informational campus circular ${otherNotices.length === 1 ? "notice" : "notices"}. `;
      otherNotices.slice(0, 2).forEach((n, i) => {
        script += `Notice ${i + 1}: ${n.subject}. ${n.analysis.summary}. `;
      });
    }

    script += `All dates and requirements have been synchronized with your student dashboard. Have a productive day!`;
    return script;
  }
}

export const campusTTS = new CampusSpeechService();
