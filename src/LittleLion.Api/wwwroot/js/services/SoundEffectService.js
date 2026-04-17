/**
 * Sound effects synthesized via Web Audio API.
 * No MP3 files, no network requests - every effect is generated on the fly.
 *
 * Design notes:
 *   - AudioContext is created lazily on first play() because browsers
 *     require a user gesture before allowing audio. Trying to construct
 *     it too early gives "AudioContext was not allowed to start".
 *   - All effects are short (< 600ms) so they never overlap the spoken
 *     word from AudioService (which uses SpeechSynthesis, a separate API).
 *   - Volume is global and defaults low (0.25) so it complements rather
 *     than competes with the TTS voice.
 *
 * Public API:
 *   sfx.play('pop')      quick blip when a balloon pops / tile taps
 *   sfx.play('ding')     correct answer
 *   sfx.play('buzz')     wrong answer
 *   sfx.play('whoosh')   screen transitions / drops
 *   sfx.play('fanfare')  big win
 */
export class SoundEffectService {
  constructor({ volume = 0.25 } = {}) {
    this.volume = volume;
    this._ctx = null;
  }

  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }

  play(name) {
    const ctx = this._context();
    if (!ctx) return;

    const playMap = {
      pop:     () => this._tone(ctx, { freq: 660, endFreq: 220, dur: 0.12, type: 'square', gain: 0.4 }),
      ding:    () => this._chord(ctx, [880, 1320], 0.35, 'sine', 0.35),
      buzz:    () => this._tone(ctx, { freq: 180, endFreq: 120, dur: 0.25, type: 'sawtooth', gain: 0.3 }),
      whoosh:  () => this._tone(ctx, { freq: 800, endFreq: 120, dur: 0.28, type: 'sine', gain: 0.3 }),
      fanfare: () => this._fanfare(ctx),
    };

    const fn = playMap[name];
    if (fn) fn();
  }

  // ---- private helpers ----

  _context() {
    if (!this._ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try { this._ctx = new AudioCtx(); }
      catch { return null; }
    }
    // Chrome sometimes suspends the context until a gesture; resume if needed.
    if (this._ctx.state === 'suspended') this._ctx.resume().catch(() => {});
    return this._ctx;
  }

  /**
   * Play one tone with optional frequency slide and envelope.
   * @param {{freq:number, endFreq?:number, dur:number, type:OscillatorType, gain:number}} opts
   */
  _tone(ctx, { freq, endFreq = freq, dur, type = 'sine', gain = 0.3 }) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + dur);
    }

    const peak = gain * this.volume;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  _chord(ctx, freqs, dur, type, gain) {
    freqs.forEach(f => this._tone(ctx, { freq: f, dur, type, gain }));
  }

  _fanfare(ctx) {
    // Classic rising triad: C5, E5, G5, C6 - spaced ~80ms apart
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._tone(ctx, { freq, dur: 0.28, type: 'triangle', gain: 0.4 });
      }, i * 90);
    });
  }
}
