import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { pickRandom, pickOne } from '../core/Random.js';
import { createVocabVisual } from '../screens/VocabVisual.js';

export class TapGame extends BaseGame {
  get gameName() { return 'tap'; }

  renderRound() {
    const { audio, media } = this.context.services;
    const options = pickRandom(this.vocab, 4);
    const target = pickOne(options);
    let locked = false;

    const playSound = () => audio.speak(target.word);

    const tiles = options.map((item, idx) => {
      const tile = el('button', {
        class: 'tile tile--entering',
        style: {
          background: item.color,
          animationDelay: `${idx * 90}ms`,
        },
        'aria-label': item.word,
        onclick: () => {
          if (locked) return;
          if (item.id === target.id) {
            locked = true;
            tile.classList.add('tile--correct');
            this.context.services.sfx.play('ding');
            audio.speak(item.word);
            this.context.bus.emit('leo:cheer');
            this._showPraise(target.word);
            this.completeRound();
          } else {
            // Dodge: tile jumps back like it's avoiding the touch
            tile.classList.add('tile--dodge');
            this.context.services.sfx.play('buzz');
            this.context.bus.emit('leo:sad');
            setTimeout(() => tile.classList.remove('tile--dodge'), 500);
          }
        },
      }, [createVocabVisual(item, media, { size: 'medium' })]);
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
