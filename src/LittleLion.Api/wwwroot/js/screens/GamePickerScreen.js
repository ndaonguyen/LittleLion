import { Component } from '../core/Component.js';
import { el } from '../core/DomHelpers.js';

/**
 * Game picker: shown after choosing a lesson. Lists the available game
 * modes, all scoped to the selected lesson.
 */
const GAMES = [
  { id: 'tap',     title: 'Tap & Learn',  subtitle: 'Hear the word, tap the picture',    emoji: '👆', color: '#FFB84C' },
  { id: 'drag',    title: 'Match It!',    subtitle: 'Drag words to pictures',            emoji: '🎯', color: '#4ECDC4' },
  { id: 'balloon', title: 'Balloon Pop',  subtitle: 'Pop the right balloon',             emoji: '🎈', color: '#FF6B9D' },
  { id: 'memory',  title: 'Memory Match', subtitle: 'Flip cards, find the pairs',        emoji: '🧠', color: '#A78BFA' },
  { id: 'odd',     title: 'Odd One Out',  subtitle: 'Find the one that doesn\'t belong', emoji: '🔍', color: '#F59E0B' },
];

export class GamePickerScreen extends Component {
  constructor(context, params) {
    super(context);
    this.lessonId = params?.lessonId ?? 'animals';
    // Prefer the difficulty that was explicitly passed in the nav params;
    // fall back to whatever the child has set on the lesson card's dots.
    this.difficulty =
      params?.difficulty ??
      context.services.difficulty?.get(this.lessonId) ??
      'Medium';
  }

  render() {
    return el('div', { class: 'screen home' }, [
      el('div', { class: 'home__header' }, [
        el('button', {
          class: 'topbar__home',
          'aria-label': 'Back',
          onclick: () => this.context.router.navigate('home'),
        }, ['←']),
        el('div', { style: { flex: 1 } }, [
          el('h1', { class: 'home__title', style: { fontSize: '32px' } }, ['Pick a game']),
          el('p',  { class: 'home__subtitle' }, [
            `${this._humanTitle()} · ${this.difficulty}`,
          ]),
        ]),
      ]),

      el('div', { class: 'home__game-list' },
        GAMES.map((g, i) =>
          el('button', {
            class: 'game-card',
            style: { background: g.color, animationDelay: `${i * 0.08}s` },
            onclick: () => this.context.router.navigate(g.id, {
              lessonId: this.lessonId,
              difficulty: this.difficulty,
            }),
          }, [
            el('div', { class: 'game-card__emoji' }, [g.emoji]),
            el('div', { class: 'game-card__body' }, [
              el('div', { class: 'game-card__title' }, [g.title]),
              el('div', { class: 'game-card__subtitle' }, [g.subtitle]),
            ]),
            el('div', { class: 'game-card__arrow' }, ['→']),
          ])
        )
      ),
    ]);
  }

  _humanTitle() {
    // Quick lookup; could fetch from lesson service but this avoids an extra await.
    const titles = {
      animals: 'Animals', colors: 'Colors', fruits: 'Fruits',
      vehicles: 'Vehicles', body: 'My Body', clothes: 'Clothes', weather: 'Weather',
    };
    return titles[this.lessonId] ?? this.lessonId;
  }
}
