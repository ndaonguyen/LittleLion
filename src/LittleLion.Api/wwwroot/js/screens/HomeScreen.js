import { Component } from '../core/Component.js';
import { el } from '../core/DomHelpers.js';

const GAME_CARDS = [
  { id: 'tap',     title: 'Tap & Learn',  subtitle: 'Hear the word, tap the picture', emoji: '👆', color: '#FFB84C' },
  { id: 'drag',    title: 'Match It!',    subtitle: 'Drag words to animals',          emoji: '🎯', color: '#4ECDC4' },
  { id: 'balloon', title: 'Balloon Pop',  subtitle: 'Pop the right balloon',          emoji: '🎈', color: '#FF6B9D' },
];

export class HomeScreen extends Component {
  render() {
    const { progress } = this.context.services;
    const starsLabel = el('span', {}, [String(progress.totalStars)]);

    this.listen('progress:changed', ({ totalStars }) => {
      starsLabel.textContent = String(totalStars);
    });

    return el('div', { class: 'screen home' }, [
      el('div', { class: 'home__header' }, [
        el('div', {}, [
          el('h1', { class: 'home__title' }, ['Little Lion']),
          el('p',  { class: 'home__subtitle' }, [`Let's learn English! 🦁`]),
        ]),
        el('div', { class: 'topbar__stars' }, ['⭐', starsLabel]),
      ]),

      el('div', { class: 'home__lesson-banner' }, [
        el('div', { class: 'home__lesson-banner-emoji' }, ['🦁']),
        el('div', { class: 'home__lesson-banner-text' }, [
          el('strong', {}, [`Today's lesson: Animals`]),
          el('span', {}, ['8 new words to learn!']),
        ]),
      ]),

      el('div', { class: 'home__game-list' },
        GAME_CARDS.map(card =>
          el('button', {
            class: 'game-card',
            style: { background: card.color },
            onclick: () => this.context.router.navigate(card.id),
          }, [
            el('div', { class: 'game-card__emoji' }, [card.emoji]),
            el('div', { class: 'game-card__body' }, [
              el('div', { class: 'game-card__title' }, [card.title]),
              el('div', { class: 'game-card__subtitle' }, [card.subtitle]),
            ]),
            el('div', { class: 'game-card__arrow' }, ['→']),
          ])
        )
      ),

      el('p', { class: 'home__footer' }, [
        'Prototype · English learning for little ones',
      ]),
    ]);
  }
}
