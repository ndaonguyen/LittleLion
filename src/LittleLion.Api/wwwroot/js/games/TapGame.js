import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { pickRandom, pickOne } from '../core/Random.js';
import { createVocabVisual } from '../screens/VocabVisual.js';

export class TapGame extends BaseGame {
  get gameName() { return 'tap'; }

  // Easy: 3 rounds of 3 options. Medium: 5 of 5. Hard: 7 of 8.
  get roundsByDifficulty() { return { Easy: 3, Medium: 5, Hard: 7 }; }
  get optionCount() {
    return { Easy: 3, Medium: 5, Hard: 8 }[this.difficulty] ?? 5;
  }

  /**
   * Pick the options to show for this round. Default is a random
   * sample plus a random target. Subclasses (e.g. FindTheWordGame)
   * override this to use smarter distractor selection.
   *
   * Returns { options: VocabItem[], target: VocabItem }.
   */
  pickOptions(n) {
    const options = pickRandom(this.vocab, n);
    const target = pickOne(options);
    return { options, target };
  }

  /** Prompt text shown above the tile grid. Subclasses may override. */
  get promptText() { return 'Listen and tap'; }

  renderRound() {
    const { audio, media } = this.context.services;
    // Cap options at vocab length in case a lesson has fewer items than Hard wants
    const n = Math.min(this.optionCount, this.vocab.length);
    const { options, target } = this.pickOptions(n);
    let locked = false;

    const playSound = () => audio.speak(target.word);

    let correctTile = null;
    const tiles = options.map((item, idx) => {
      const tile = el('button', {
        class: 'tile tile--entering',
        style: {
          background: this.tileBackground(item),
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
            this.noteWrong();
            setTimeout(() => tile.classList.remove('tile--dodge'), 500);
          }
        },
      }, [createVocabVisual(item, media, { size: 'medium' })]);
      if (item.id === target.id) correctTile = tile;
      return tile;
    });

    // At 7+ tiles a 2-column grid overflows the viewport; 3 columns fits.
    const gridClass = n >= 7 ? 'tap-grid tap-grid--dense' : 'tap-grid';

    this.bodyContainer.append(
      el('p', { class: 'game__prompt' }, [this.promptText]),
      el('button', {
        class: 'sound-button',
        onclick: playSound,
      }, [
        el('span', { class: 'sound-button__icon' }, ['🔊']),
        el('span', {}, ['Play sound']),
      ]),
      el('div', { class: gridClass, style: { marginTop: '24px' } }, tiles),
    );

    // Auto-play the target word shortly after render
    setTimeout(playSound, 400);

    // Arm the hint watcher - Leo will point at the correct tile if the
    // child hesitates more than 8 seconds
    this.startRoundWatch(correctTile);
  }

  _showPraise(word) {
    const banner = el('div', { class: 'feedback-banner' }, [`Yes! ${word}! 🎉`]);
    this.bodyContainer.appendChild(banner);
  }
}
