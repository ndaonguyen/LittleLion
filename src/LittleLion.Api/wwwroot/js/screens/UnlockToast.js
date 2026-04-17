import { el } from '../core/DomHelpers.js';

/**
 * Global unlock toast. Listens for 'rewards:unlocked' bus events and
 * queues up a celebratory banner per reward. Only one shows at a time;
 * multiple unlocks cascade after each other.
 *
 * Mounted once at app bootstrap; lives for the lifetime of the page.
 */
export class UnlockToast {
  constructor(bus, { sfx, audio } = {}) {
    this._bus   = bus;
    this._sfx   = sfx;
    this._audio = audio;
    this._queue = [];
    this._playing = false;
    this._root = el('div', { class: 'unlock-toast-host' });
    document.body.appendChild(this._root);
    bus.on('rewards:unlocked', ({ rewards }) => this._enqueue(rewards));
  }

  _enqueue(rewards) {
    for (const r of rewards) this._queue.push(r);
    this._pump();
  }

  _pump() {
    if (this._playing || this._queue.length === 0) return;
    this._playing = true;
    const reward = this._queue.shift();
    this._show(reward);
  }

  _show(reward) {
    this._sfx?.play('fanfare');
    this._audio?.speak(`You unlocked ${reward.name}!`);

    const toast = el('div', { class: 'unlock-toast' }, [
      el('div', { class: 'unlock-toast__ribbon' }, ['New!']),
      el('div', { class: 'unlock-toast__emoji' }, [reward.emoji]),
      el('div', { class: 'unlock-toast__name' }, [reward.name]),
      el('div', { class: 'unlock-toast__sub' }, [this._subtitleFor(reward.category)]),
    ]);
    this._root.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('unlock-toast--leaving');
      setTimeout(() => {
        toast.remove();
        this._playing = false;
        this._pump();
      }, 500);
    }, 2600);
  }

  _subtitleFor(category) {
    switch (category) {
      case 'Sticker': return 'New sticker!';
      case 'Badge':   return 'New badge!';
      case 'Costume': return 'New costume for Leo!';
      default:        return 'New reward!';
    }
  }
}
