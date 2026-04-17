import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { pickRandom, pickOne } from '../core/Random.js';

export class TapGame extends BaseGame {
  get gameName() { return 'tap'; }

  renderRound() {
    const { audio } = this.context.services;
    const options = pickRandom(this.vocab, 4);
    const target = pickOne(options);
    let locked = false;

    const playSound = () => audio.speak(target.word);

    const tiles = options.map(item => {
      const tile = el('button', {
        class: 'tile',
        style: { background: item.color },
        'aria-label': item.word,
        onclick: () => {
          if (locked) return;
          if (item.id === target.id) {
            locked = true;
            tile.classList.add('tile--correct');
            audio.speak(item.word);
            this._showPraise(target.word);
            this.completeRound();
          } else {
            tile.classList.add('tile--wrong');
            setTimeout(() => tile.classList.remove('tile--wrong'), 400);
          }
        },
      }, [item.emoji]);
      return tile;
    });

    this.bodyContainer.append(
      el('p', { class: 'game__prompt' }, ['Listen and tap']),
      el('button', {
        class: 'sound-button',
        onclick: playSound,
      }, [
        el('span', { class: 'sound-button__icon' }, ['🔊']),
        el('span', {}, ['Play sound']),
      ]),
      el('div', { class: 'tap-grid', style: { marginTop: '24px' } }, tiles),
    );

    // Auto-play the target word shortly after render
    setTimeout(playSound, 400);
  }

  _showPraise(word) {
    const banner = el('div', { class: 'feedback-banner' }, [`Yes! ${word}! 🎉`]);
    this.bodyContainer.appendChild(banner);
  }
}
