import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { pickRandom, pickOne } from '../core/Random.js';
import { createVocabVisual } from '../screens/VocabVisual.js';

export class BalloonGame extends BaseGame {
  get gameName() { return 'balloon'; }

  // Balloon rounds take longer than tap rounds, so fewer per session.
  get roundsByDifficulty() { return { Easy: 3, Medium: 5, Hard: 6 }; }
  get balloonCount() {
    return { Easy: 3, Medium: 5, Hard: 8 }[this.difficulty] ?? 5;
  }
  /** Seconds for a balloon to rise across the screen - lower = faster = harder */
  get baseRiseSeconds() {
    return { Easy: 7.5, Medium: 5.5, Hard: 4 }[this.difficulty] ?? 5.5;
  }

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

    const n = Math.min(this.balloonCount, this.vocab.length);
    const choices = pickRandom(this.vocab, n);
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

    // Crowded mode shrinks balloon bodies ~20% when we have 7+ on screen
    // so they don't overlap horribly on narrow phones.
    const fieldClass = n >= 7 ? 'balloon-field balloon-field--crowded' : 'balloon-field';
    const field = el('div', { class: fieldClass });
    const { media } = this.context.services;

    let correctBalloon = null;
    // Distribute horizontal positions proportionally to the balloon count
    // so 3 balloons spread wide, 8 balloons pack closer, none go off-screen.
    const span = 84; // percent of field width to occupy (leave 8% edges)
    const slotWidth = n > 1 ? span / (n - 1) : 0;
    choices.forEach((item, idx) => {
      // Rise speed derived from difficulty; small jitter so balloons don't sync
      const duration = this.baseRiseSeconds + Math.random() * 2;
      const swayName = `balloon-sway-${idx % 3}`;
      const leftBase = n === 1 ? 50 : 8 + idx * slotWidth;

      const balloon = el('button', {
        class: 'balloon',
        style: {
          left: `${leftBase + Math.random() * 2}%`,
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
            this._spawnPartyBurst(balloon, field, item.color);
            balloon.classList.add('balloon--burst');
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

  /**
   * Explode a balloon like a little party: 10 colored streamers shoot out
   * radially from the balloon's current on-screen position, then the DOM
   * cleans them up after 1.1s.
   */
  _spawnPartyBurst(balloonEl, fieldEl, balloonColor) {
    const balloonRect = balloonEl.getBoundingClientRect();
    const fieldRect = fieldEl.getBoundingClientRect();

    // Center of the balloon's BODY (top of the balloon element, not the string)
    const cx = (balloonRect.left - fieldRect.left) + balloonRect.width / 2;
    const cy = (balloonRect.top  - fieldRect.top)  + 48; // ~balloon body center

    const colors = ['#FFB84C', '#FF6B9D', '#4ECDC4', '#FFD93D', '#A78BFA', '#FF8C42', balloonColor];
    const PIECES = 12;

    for (let i = 0; i < PIECES; i++) {
      const angle = (i / PIECES) * Math.PI * 2;   // evenly spread 360 degrees
      const distance = 70 + Math.random() * 40;    // 70-110px outward
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rotate = (Math.random() - 0.5) * 720;

      const piece = el('div', {
        class: 'balloon-burst-piece',
        style: {
          left: `${cx}px`,
          top:  `${cy}px`,
          background: colors[i % colors.length],
          // custom props consumed by keyframes below
          '--dx': `${dx}px`,
          '--dy': `${dy}px`,
          '--rot': `${rotate}deg`,
          animationDelay: `${i * 10}ms`,
        },
      });
      fieldEl.appendChild(piece);

      // Clean up after the animation completes so the DOM stays small
      setTimeout(() => piece.remove(), 1200);
    }
  }
}
