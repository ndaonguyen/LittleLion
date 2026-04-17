import { el } from '../core/DomHelpers.js';

/**
 * Leo the Lion - the app mascot. Listens to EventBus messages and
 * switches animation state accordingly.
 *
 * States:
 *   - idle:      gentle wiggle (default)
 *   - cheer:     bounces up with sparkle on correct answers
 *   - sad:       brief wobble on wrong answers, quickly returns to idle
 *   - celebrate: big dance for wins
 *
 * Drive Leo via the bus:
 *   bus.emit('leo:cheer')
 *   bus.emit('leo:sad')
 *   bus.emit('leo:celebrate')
 *
 * Leo is a pure component - it owns its own root element and listeners,
 * and exposes destroy() for cleanup.
 */
export class Leo {
  constructor(bus, { size = 'medium' } = {}) {
    this._bus = bus;
    this._size = size;
    this._resetTimer = null;
    this._root = this._build();
    this._disposers = [
      bus.on('leo:cheer',     () => this._setState('cheer',     900)),
      bus.on('leo:sad',       () => this._setState('sad',       600)),
      bus.on('leo:celebrate', () => this._setState('celebrate', 1600)),
    ];
  }

  get element() { return this._root; }

  destroy() {
    this._disposers.forEach(off => off());
    if (this._resetTimer) clearTimeout(this._resetTimer);
    this._root.remove();
  }

  _build() {
    const root = el('div', {
      class: `leo leo--${this._size} leo--idle`,
      'aria-hidden': 'true',
    }, [
      el('div', { class: 'leo__body' }, ['🦁']),
      el('div', { class: 'leo__sparkles' }, [
        el('span', {}, ['✨']),
        el('span', {}, ['⭐']),
        el('span', {}, ['💫']),
      ]),
    ]);
    return root;
  }

  _setState(state, durationMs) {
    if (this._resetTimer) clearTimeout(this._resetTimer);
    this._root.classList.remove('leo--idle', 'leo--cheer', 'leo--sad', 'leo--celebrate');
    this._root.classList.add(`leo--${state}`);
    this._resetTimer = setTimeout(() => {
      this._root.classList.remove(`leo--${state}`);
      this._root.classList.add('leo--idle');
      this._resetTimer = null;
    }, durationMs);
  }
}
