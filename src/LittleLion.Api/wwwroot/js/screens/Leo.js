import { el } from '../core/DomHelpers.js';

/**
 * Leo the Lion — a custom SVG mascot.
 *
 * Rendered as inline SVG so every shape (mane, eyes, body, paws) can be
 * animated via CSS classes on the wrapper. States:
 *
 *   - idle       : gentle breathing + blink (default)
 *   - cheer      : bounce + eyes happy (on correct)
 *   - sad        : head tilt, eyes half-closed (on wrong)
 *   - celebrate  : dance loop + waving arm (on win)
 *   - wave       : one-shot greeting wave (on home mount)
 *   - point-left / point-right : raise arm to point at an answer (hint)
 *   - shrug      : comfort gesture after repeated wrongs
 *
 * Driven by bus events:
 *   bus.emit('leo:cheer'), bus.emit('leo:sad'),
 *   bus.emit('leo:celebrate'), bus.emit('leo:wave'),
 *   bus.emit('leo:point', { direction: 'left' | 'right' }),
 *   bus.emit('leo:shrug'),
 *   bus.emit('leo:costume', { emoji })  // show a hat/crown/cape
 *
 * The `.leo__costume` slot displays an emoji accessory above the mane
 * when the player has unlocked one from streak rewards.
 */
export class Leo {
  constructor(bus, { size = 'medium', costume = null } = {}) {
    this._bus = bus;
    this._size = size;
    this._costume = costume;
    this._resetTimer = null;

    this._root = this._build();

    this._disposers = [
      bus.on('leo:cheer',     () => this._setState('cheer',     1000)),
      bus.on('leo:sad',       () => this._setState('sad',        700)),
      bus.on('leo:celebrate', () => this._setState('celebrate', 1800)),
      bus.on('leo:wave',      () => this._setState('wave',      1400)),
      bus.on('leo:point',     (p) => this._doPoint(p)),
      bus.on('leo:shrug',     () => this._setState('shrug',     1500)),
      bus.on('leo:costume',   (p) => this._setCostume(p?.emoji ?? null)),
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
    });

    root.innerHTML = `
      <div class="leo__costume">${this._costume ?? ''}</div>
      <svg class="leo__svg" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
        <!-- Mane tufts (outer ring) -->
        <g class="leo__mane">
          <circle cx="70" cy="62" r="50" fill="#E58B38"/>
          <circle cx="28"  cy="50" r="14" fill="#D97B28"/>
          <circle cx="112" cy="50" r="14" fill="#D97B28"/>
          <circle cx="24"  cy="72" r="12" fill="#D97B28"/>
          <circle cx="116" cy="72" r="12" fill="#D97B28"/>
          <circle cx="40"  cy="30" r="12" fill="#D97B28"/>
          <circle cx="100" cy="30" r="12" fill="#D97B28"/>
          <circle cx="70"  cy="20" r="13" fill="#D97B28"/>
          <circle cx="32"  cy="92" r="10" fill="#D97B28"/>
          <circle cx="108" cy="92" r="10" fill="#D97B28"/>
        </g>

        <!-- Face (lighter muzzle area) -->
        <g class="leo__face">
          <circle cx="70" cy="70" r="36" fill="#FFCC88"/>
          <circle cx="70" cy="80" r="20" fill="#FFE3BE"/>
        </g>

        <!-- Eyes -->
        <g class="leo__eyes">
          <g class="leo__eye leo__eye--left">
            <circle cx="58" cy="64" r="5" fill="#2B2A33"/>
            <circle cx="59" cy="62" r="1.5" fill="#FFFFFF"/>
          </g>
          <g class="leo__eye leo__eye--right">
            <circle cx="82" cy="64" r="5" fill="#2B2A33"/>
            <circle cx="83" cy="62" r="1.5" fill="#FFFFFF"/>
          </g>
        </g>

        <!-- Nose -->
        <path class="leo__nose" d="M66 74 Q70 80 74 74 Q74 78 70 79 Q66 78 66 74 Z" fill="#2B2A33"/>

        <!-- Mouth -->
        <path class="leo__mouth" d="M64 86 Q70 92 76 86" fill="none" stroke="#2B2A33" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Cheeks -->
        <circle class="leo__cheek leo__cheek--left"  cx="54" cy="78" r="3" fill="#FF9A8B" opacity="0.6"/>
        <circle class="leo__cheek leo__cheek--right" cx="86" cy="78" r="3" fill="#FF9A8B" opacity="0.6"/>

        <!-- Arms (animated per state via CSS) -->
        <g class="leo__arm leo__arm--left">
          <ellipse cx="22" cy="100" rx="8" ry="14" fill="#E58B38"/>
          <circle  cx="22" cy="110" r="7"  fill="#FFCC88"/>
        </g>
        <g class="leo__arm leo__arm--right">
          <ellipse cx="118" cy="100" rx="8" ry="14" fill="#E58B38"/>
          <circle  cx="118" cy="110" r="7"  fill="#FFCC88"/>
        </g>
      </svg>
    `;

    return root;
  }

  _setState(state, durationMs) {
    if (this._resetTimer) clearTimeout(this._resetTimer);
    this._root.classList.remove(
      'leo--idle', 'leo--cheer', 'leo--sad', 'leo--celebrate',
      'leo--wave', 'leo--point-left', 'leo--point-right', 'leo--shrug');
    this._root.classList.add(`leo--${state}`);
    this._resetTimer = setTimeout(() => {
      this._root.classList.remove(`leo--${state}`);
      this._root.classList.add('leo--idle');
      this._resetTimer = null;
    }, durationMs);
  }

  _doPoint({ direction = 'right' } = {}) {
    this._setState(`point-${direction}`, 2000);
  }

  _setCostume(emoji) {
    const slot = this._root.querySelector('.leo__costume');
    if (!slot) return;
    slot.textContent = emoji ?? '';
  }
}
