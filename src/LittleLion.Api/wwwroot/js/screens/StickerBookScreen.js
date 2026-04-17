import { Component } from '../core/Component.js';
import { el } from '../core/DomHelpers.js';

/**
 * Sticker Book: shows every reward in the catalog, grouped by category.
 * Unlocked items are colorful, locked items are greyed out and show
 * their unlock rule as a hint ('Finish Animals', 'Play 3 days in a row').
 */
const CATEGORY_ORDER = ['Sticker', 'Badge', 'Costume'];
const CATEGORY_LABELS = {
  Sticker: 'Stickers',
  Badge:   'Badges',
  Costume: 'Costumes',
};

export class StickerBookScreen extends Component {
  render() {
    const backBtn = el('button', {
      class: 'topbar__home',
      'aria-label': 'Back',
      onclick: () => this.context.router.navigate('home'),
    }, ['←']);

    this._content = el('div', { class: 'sticker-book' });

    return el('div', { class: 'screen home' }, [
      el('div', { class: 'home__header' }, [
        backBtn,
        el('div', { style: { flex: 1 } }, [
          el('h1', { class: 'home__title', style: { fontSize: '32px' } }, ['Sticker Book']),
          el('p',  { class: 'home__subtitle' }, [this._summaryLine()]),
        ]),
      ]),
      this._content,
    ]);
  }

  async onMount() {
    const { rewards, progress } = this.context.services;
    if (rewards.all.length === 0) await rewards.refresh();
    if (!progress.isLoaded) await progress.refresh();
    this._renderSections();
  }

  _summaryLine() {
    const { rewards, progress } = this.context.services;
    const total    = rewards.all.length;
    const unlocked = progress.unlockedItems.length;
    return total > 0 ? `${unlocked} of ${total} collected` : 'Loading...';
  }

  _renderSections() {
    const { rewards, progress } = this.context.services;
    this._content.innerHTML = '';

    for (const category of CATEGORY_ORDER) {
      const items = rewards.byCategory(category);
      if (items.length === 0) continue;

      this._content.appendChild(
        el('h2', { class: 'sticker-book__section-title' }, [CATEGORY_LABELS[category]])
      );

      const grid = el('div', { class: 'sticker-book__grid' });
      items.forEach((reward, i) => {
        const unlocked = progress.hasUnlocked(reward.id);
        grid.appendChild(this._renderCard(reward, unlocked, i));
      });
      this._content.appendChild(grid);
    }

    // Update header summary now that we have real counts
    const subtitle = this._content.parentElement?.querySelector('.home__subtitle');
    if (subtitle) subtitle.textContent = this._summaryLine();
  }

  _renderCard(reward, unlocked, index) {
    const classes = ['sticker-card'];
    if (!unlocked) classes.push('sticker-card--locked');

    return el('div', {
      class: classes.join(' '),
      style: { animationDelay: `${index * 40}ms` },
      title: unlocked ? reward.name : this._lockHint(reward),
    }, [
      el('div', { class: 'sticker-card__emoji' }, [unlocked ? reward.emoji : '🔒']),
      el('div', { class: 'sticker-card__name' }, [reward.name]),
      el('div', { class: 'sticker-card__hint' },
        unlocked ? ['Unlocked!'] : [this._lockHint(reward)]),
    ]);
  }

  _lockHint(reward) {
    if (reward.category === 'Sticker' && reward.lessonId)
      return `Play ${this._humanLesson(reward.lessonId)}`;
    if (reward.category === 'Badge' && reward.lessonId && reward.requiredBestStars > 0)
      return `Get ${reward.requiredBestStars}⭐ on ${this._humanLesson(reward.lessonId)}`;
    if (reward.category === 'Costume' && reward.streakDays > 0)
      return `${reward.streakDays}-day streak`;
    return 'Keep playing';
  }

  _humanLesson(id) {
    const map = {
      animals: 'Animals', colors: 'Colors', fruits: 'Fruits',
      vehicles: 'Vehicles', body: 'My Body', clothes: 'Clothes', weather: 'Weather',
    };
    return map[id] ?? id;
  }
}
