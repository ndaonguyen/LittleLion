import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { pickRandom, pickOne } from '../core/Random.js';

export class BalloonGame extends BaseGame {
  get gameName() { return 'balloon'; }

  render() {
    const root = super.render();

    // The sky background sits behind game content
    root.insertBefore(el('div', { class: 'balloon-sky' }), this.bodyContainer);

    // Swap the default body for our balloon-specific layout class
    this.bodyContainer.classList.remove('game__body');
    this.bodyContainer.classList.add('balloon-game-body');

    return root;
  }

  renderRound() {
    const { audio } = this.context.services;

    const choices = pickRandom(this.vocab, 4);
    const target  = pickOne(choices);
    let locked = false;

    const promptBtn = el('button', {
      class: 'sound-button',
      style: { marginBottom: '12px' },
      onclick: () => audio.speak(target.word),
    }, [
      el('span', { class: 'sound-button__icon', style: { background: 'var(--color-pink)' } }, ['🔊']),
      el('span', {}, [`Pop the ${target.word.toLowerCase()}!`]),
    ]);

    const field = el('div', { class: 'balloon-field' });

    choices.forEach((item, idx) => {
      const balloon = el('button', {
        class: 'balloon',
        style: {
          left: `${8 + idx * 22 + Math.random() * 4}%`,
          animationDelay: `${idx * 0.3}s`,
        },
        'aria-label': item.word,
        onclick: () => {
          if (locked) return;
          if (item.id === target.id) {
            locked = true;
            balloon.classList.add('balloon--popped');
            audio.speak(item.word);
            this.context.bus.emit('leo:cheer');
            const praise = el('div', { class: 'balloon-feedback' }, [`POP! ${target.word}! ✨`]);
            field.appendChild(praise);
            this.completeRound();
          } else {
            balloon.classList.add('balloon--popped');
            this.context.bus.emit('leo:sad');
            setTimeout(() => balloon.classList.remove('balloon--popped'), 400);
          }
        },
      }, [
        el('div', {
          class: 'balloon__body',
          style: {
            background: `radial-gradient(circle at 30% 30%, ${item.color}dd, ${item.color})`,
            color: item.color,
          },
        }, [item.emoji]),
        el('div', { class: 'balloon__tie', style: { color: item.color } }),
        el('div', { class: 'balloon__string' }),
      ]);
      field.appendChild(balloon);
    });

    this.bodyContainer.append(promptBtn, field);

    setTimeout(() => audio.speak(target.word), 500);
  }
}
