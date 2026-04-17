/**
 * Tiny pub/sub. Lets components talk without direct references.
 * Example: games emit 'game:won' -> Router navigates to Win screen.
 */
export class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this._handlers.get(event)?.delete(handler);
  }

  emit(event, payload) {
    const handlers = this._handlers.get(event);
    if (!handlers) return;
    for (const h of [...handlers]) h(payload);
  }
}
