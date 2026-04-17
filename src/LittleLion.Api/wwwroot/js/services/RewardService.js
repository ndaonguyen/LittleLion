/**
 * Client-side reward catalog. Loaded once on app bootstrap via refresh().
 * Read-only from the UI's perspective - unlock state comes from
 * ProgressService (which already has unlockedItems).
 */
export class RewardService {
  constructor(apiClient) {
    this.api = apiClient;
    this._catalog = [];
    this._byId = new Map();
  }

  /** Fetch the reward catalog from the server. Safe to call once. */
  async refresh() {
    try {
      const catalog = await this.api.get('/api/rewards');
      this._catalog = Array.isArray(catalog) ? catalog : [];
      this._byId = new Map(this._catalog.map(r => [r.id, r]));
    } catch (err) {
      console.error('RewardService.refresh failed', err);
    }
  }

  get all() { return this._catalog; }

  findById(id) { return this._byId.get(id) ?? null; }

  byCategory(category) {
    return this._catalog.filter(r => r.category === category);
  }
}
