/**
 * Persists accumulated stars locally so progress survives reloads.
 * When you add a real backend user model, swap this implementation
 * for one that POSTs to /api/progress.
 */
const STORAGE_KEY = 'little-lion.progress.v1';

export class ProgressService {
  constructor(bus) {
    this.bus = bus;
    this._state = this._load();
  }

  get totalStars() { return this._state.totalStars; }

  addStars(n) {
    this._state.totalStars += n;
    this._save();
    this.bus.emit('progress:changed', { totalStars: this._state.totalStars });
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { totalStars: 0 };
      return JSON.parse(raw);
    } catch {
      return { totalStars: 0 };
    }
  }

  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state)); }
    catch { /* quota / private-mode - silently ignore */ }
  }
}
