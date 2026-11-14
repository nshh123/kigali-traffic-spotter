// Audio & Voice traffic alert synthesizer
export class AudioAlertService {
  private static enabled = true;
  private static announcedIncidentIds = new Set<string>();

  static isAudioSupported(): boolean {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  static toggleSound(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  static setEnabled(val: boolean) {
    this.enabled = val;
  }

  static playChime() {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio context may be restricted until user interacts
    }
  }

  static announceTrafficAlert(message: string, incidentId?: string) {
    if (!this.enabled) return;
    if (incidentId && this.announcedIncidentIds.has(incidentId)) return;
    if (incidentId) this.announcedIncidentIds.add(incidentId);

    this.playChime();

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel pending
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis fallback
      }
    }
  }
}
