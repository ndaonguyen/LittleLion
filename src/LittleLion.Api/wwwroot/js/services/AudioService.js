/**
 * Audio service. Today: uses the browser's Web Speech API (free, works offline).
 * Tomorrow: swap implementation to play pre-generated MP3s from /audio/{word}.mp3
 * (backend already returns these URLs in the lesson DTO).
 *
 * Callers only depend on this interface, so the swap is transparent.
 */
export class AudioService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this._warmUpVoice();
  }

  _warmUpVoice() {
    if (!this.synth) return;
    const pick = () => {
      const voices = this.synth.getVoices();
      this.voice =
        voices.find(v => v.lang.startsWith('en') && /female|samantha|karen|zira|google us english/i.test(v.name)) ||
        voices.find(v => v.lang.startsWith('en')) ||
        null;
    };
    pick();
    this.synth.onvoiceschanged = pick;
  }

  /** Speak the given text. Cancels any in-flight utterance. */
  speak(text, { rate = 0.85, pitch = 1.1 } = {}) {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = 'en-US';
    if (this.voice) utterance.voice = this.voice;
    this.synth.speak(utterance);
  }
}
