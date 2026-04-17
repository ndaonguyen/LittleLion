import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { pickRandom, pickOne } from '../core/Random.js';
import { createVocabVisual } from '../screens/VocabVisual.js';

export class BalloonGame extends BaseGame {
  get gameName() { return 'balloon'; }

  render() {
    const root = super.render();

    // Swap the default body for our balloon-specific layout class.
    // The scene background from BaseGame already covers the sky, so we
    // don't need the old balloon-sky layer any more.
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
    const { media } = this.context.services;

    let correctBalloon = null;
    choices.forEach((item, idx) => {
      const duration = 5.5 + Math.random() * 3;
      const swayName = `balloon-sway-${idx % 3}`;

      const balloon = el('button', {
        class: 'balloon',
        style: {
          left: `${8 + idx * 22 + Math.random() * 4}%`,
          animationName: `balloon-rise, ${swayName}`,
          animationDuration: `${duration}s, ${2.1 + Math.random()}s`,
          animationTimingFunction: 'linear, ease-in-out',
          animationIterationCount: 'infinite, infinite',
          animationDelay: `${idx * 0.25}s, 0s`,
        },
        'aria-label': item.word,
        onclick: () => {
          if (locked) return;
          if (item.id === target.id) {
            locked = true;
            balloon.classList.add('balloon--popped');
            this.context.services.sfx.play('pop');
            audio.speak(item.word);
            this.context.bus.emit('leo:cheer');
            const praise = el('div', { class: 'balloon-feedback' }, [`POP! ${target.word}! ✨`]);
            field.appendChild(praise);
            this.completeRound();
          } else {
            balloon.classList.add('balloon--popped');
            this.context.services.sfx.play('buzz');
            this.context.bus.emit('leo:sad');
            this.noteWrong();
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
        }, [createVocabVisual(item, media, { size: 'small' })]),
        el('div', { class: 'balloon__tie', style: { color: item.color } }),
        el('div', { class: 'balloon__string' }),
      ]);
      if (item.id === target.id) correctBalloon = balloon;
      field.appendChild(balloon);
    });

    this.bodyContainer.append(promptBtn, field);

    setTimeout(() => audio.speak(target.word), 500);
    this.startRoundWatch(correctBalloon);
  }
}
