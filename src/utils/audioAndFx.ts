import confetti from "canvas-confetti";

export function fireCelebration() {
  try {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"],
    });
  } catch (e) {
    console.warn("Confetti effect unavailable", e);
  }
}

export class SpeechNarrator {
  private static synth: SpeechSynthesis | null = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static isSpeakingCallback: ((speaking: boolean) => void) | null = null;

  static setCallback(cb: (speaking: boolean) => void) {
    this.isSpeakingCallback = cb;
  }

  static speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;
    this.stop();

    // Clean markdown symbols for cleaner speech audio
    const cleanText = text
      .replace(/#{1,6}\s?/g, "")
      .replace(/`{1,3}[^`]*`{1,3}/g, "code block")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\$\$/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick good natural voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingCallback?.(true);
    };

    utterance.onend = () => {
      this.isSpeakingCallback?.(false);
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeakingCallback?.(false);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  static stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.isSpeakingCallback?.(false);
    this.currentUtterance = null;
  }

  static isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }
}
