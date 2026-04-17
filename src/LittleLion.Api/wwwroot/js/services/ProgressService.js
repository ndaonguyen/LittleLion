/**
 * Progress state, backed by the backend API.
 * - On construction, optimistically reports zeros until refresh() resolves.
 * - recordSession() POSTs to the server, which is authoritative.
 * - Emits 'progress:changed' on every state update.
 * - Emits 'rewards:unlocked' with an array of newly-unlocked reward ids
 *   when a session returns any.
 */
export class ProgressService {
  constructor(apiClient, bus) {
    this.api = apiClient;
    this.bus = bus;
    this._state = this._emptyState();
    this._loaded = false;
  }

  get totalStars()     { return this._state.totalStars; }
  get streakDays()     { return this._state.streakDays; }
  get lessons()        { return this._state.lessons; }
  get unlockedItems()  { return this._state.unlockedItems; }
  get isLoaded()       { return this._loaded; }

  /** Best stars the player has ever earned on a given lesson, or 0. */
  getBestStars(lessonId) {
    const lesson = this._state.lessons.find(l => l.lessonId === lessonId);
    return lesson?.bestStars ?? 0;
  }

  hasUnlocked(rewardId) {
    return this._state.unlockedItems.some(u => u.id === rewardId);
  }

  async refresh() {
    try {
      const data = await this.api.get('/api/progress');
      this._applyState(data);
      this._loaded = true;
    } catch (err) {
      console.error('ProgressService.refresh failed', err);
    }
  }

  async recordSession(lessonId, starsEarned) {
    try {
      const result = await this.api.post('/api/progress/sessions', {
        lessonId, starsEarned,
      });
      this._applyState(result.playerProgress);

      if (Array.isArray(result.newlyUnlocked) && result.newlyUnlocked.length > 0) {
        this.bus.emit('rewards:unlocked', { rewards: result.newlyUnlocked });
      }
    } catch (err) {
      console.error('ProgressService.recordSession failed', err);
      // Fallback: optimistic local star-only update so UI still updates
      this._state.totalStars += starsEarned;
      this.bus.emit('progress:changed', { ...this._state });
    }
  }

  _applyState(dto) {
    this._state = {
      totalStars:     dto.totalStars ?? 0,
      streakDays:     dto.streakDays ?? 0,
      lastActiveDate: dto.lastActiveDate ?? null,
      lessons:        Array.isArray(dto.lessons)        ? dto.lessons        : [],
      unlockedItems:  Array.isArray(dto.unlockedItems)  ? dto.unlockedItems  : [],
    };
    this.bus.emit('progress:changed', { ...this._state });
  }

  _emptyState() {
    return {
      totalStars: 0,
      streakDays: 0,
      lastActiveDate: null,
      lessons: [],
      unlockedItems: [],
    };
  }
}
