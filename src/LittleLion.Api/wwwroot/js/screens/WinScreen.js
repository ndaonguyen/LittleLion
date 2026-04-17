import { Component } from '../core/Component.js';
import { el } from '../core/DomHelpers.js';

const CONFETTI_COLORS = ['#FFB84C', '#FF6B9D', '#4ECDC4', '#FFD93D', '#A78BFA', '#FF8C42'];

export class WinScreen extends Component {
  constructor(context, params) {
    super(context);
    this.stars      = params.stars ?? 0;
    this.playedGame = params.playedGame ?? 'tap';
    this.lessonId   = params.lessonId ?? 'animals';
  }

  render() {
    const starRow = el('div', { class: 'win__stars' },
      Array.from({ length: Math.min(this.stars, 5) }).map(() => el('span', {}, ['⭐']))
    );

    const root = el('div', { class: 'screen win' }, [
      this._renderConfetti(),
      el('div', { class: 'win__trophy' }, ['🏆']),
      el('h2', { class: 'win__title' }, ['Great Job!']),
      el('p',  { class: 'win__subtitle' }, [`You earned ${this.stars} star${this.stars === 1 ? '' : 's'}!`]),
      starRow,
      el('div', { class: 'win__buttons' }, [
        el('button', {
          class: 'btn btn--ghost',
          onclick: () => this.context.router.navigate('home'),
        }, ['Home']),
        el('button', {
          class: 'btn btn--primary',
          onclick: () => this.context.router.navigate(this.playedGame, { lessonId: this.lessonId }),
        }, ['Play again →']),
      ]),
    ]);

    return root;
  }

  onMount() {
    this.context.services.audio.speak('Great job!');
  }

  _renderConfetti() {
    const container = el('div', { class: 'confetti' });
    for (let i = 0; i < 28; i++) {
      const piece = el('div', {
        class: 'confetti__piece',
        style: {
          left: `${Math.random() * 100}%`,
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          animationDelay: `${Math.random() * 0.3}s`,
          animationDuration: `${1.2 + Math.random() * 0.8}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        },
      });
      container.appendChild(piece);
    }
    return container;
  }
}
