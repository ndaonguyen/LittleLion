/**
 * Progress state, backed by the backend API.
 * - On construction, optimistically reports 0 stars / 0 streak until the
 *   first load() resolves.
 * - recordSession() POSTs to the server, which is the authoritative source
 *   of truth for stars, streak, and per-lesson best scores.
 * - Emits 'progress:changed' whenever state updates so UI can react.
 */
export class ProgressService {
  constructor(apiClient, bus) {
    this.api = apiClient;
    this.bus = bus;
    this._state = this._emptyState();
    this._loaded = false;
  }

  get totalStars()    { return this._state.totalStars; }
  get streakDays()    { return this._state.streakDays; }
  get lessons()       { return this._state.lessons; }
  get isLoaded()      { return this._loaded; }

  /** Best stars the player has ever earned on a given lesson, or 0. */
  getBestStars(lessonId) {
    const lesson = this._state.lessons.find(l => l.lessonId === lessonId);
    return lesson?.bestStars ?? 0;
  }

  /** Fetch the latest state from the server. */
  async refresh() {
    try {
      const data = await this.api.get('/api/progress');
      this._applyState(data);
      this._loaded = true;
    } catch (err) {
      console.error('ProgressService.refresh failed', err);
    }
  }

  /** Record a completed session. Server returns the updated state. */
  async recordSession(lessonId, starsEarned) {
    try {
      const result = await this.api.post('/api/progress/sessions', {
        lessonId, starsEarned,
      });
      this._applyState(result.playerProgress);
    } catch (err) {
      console.error('ProgressService.recordSession failed', err);
      // Fall back to local-only optimistic update so the UI still reacts
      this._state.totalStars += starsEarned;
      this.bus.emit('progress:changed', { ...this._state });
    }
  }

  _applyState(dto) {
    this._state = {
      totalStars: dto.totalStars ?? 0,
      streakDays: dto.streakDays ?? 0,
      lastActiveDate: dto.lastActiveDate ?? null,
      lessons: Array.isArray(dto.lessons) ? dto.lessons : [],
    };
    this.bus.emit('progress:changed', { ...this._state });
  }

  _emptyState() {
    return { totalStars: 0, streakDays: 0, lastActiveDate: null, lessons: [] };
  }
}
