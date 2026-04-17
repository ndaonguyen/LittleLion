import { Component } from '../core/Component.js';
import { el, clear } from '../core/DomHelpers.js';
import { Leo } from './Leo.js';

/**
 * Home screen: lists all available lessons so the child (or parent)
 * can pick what to learn. Each card shows best-stars for that lesson,
 * so the child sees their progress at a glance.
 */
export class HomeScreen extends Component {
  render() {
    const { progress } = this.context.services;

    this._starsLabel = el('span', {}, [String(progress.totalStars)]);
    this._streakLabel = this._buildStreak(progress.streakDays);
    this._stickerCount = el('span', { class: 'home__sticker-link__count' }, [
      String(this._countValidUnlocks()),
    ]);
    this._lessonGrid  = el('div', { class: 'lesson-grid' });

    // Refresh on either progress OR rewards changing (rewards refresh is async)
    this.listen('progress:changed', () => this._refreshHeader());

    const root = el('div', { class: 'screen home' }, [
      this._buildHeader(),
      this._buildHeroBanner(),
      this._lessonGrid,
      el('div', { class: 'home__footer', style: { display: 'flex', justifyContent: 'center' } }, [
        el('button', {
          class: 'home__sticker-link',
          onclick: () => this.context.router.navigate('stickerBook'),
        }, [
          '📖',
          'Sticker Book',
          this._stickerCount,
        ]),
      ]),
    ]);

    return root;
  }

  async onMount() {
    // Leo waves hello - delayed slightly so it runs after the screen
    // finishes entering, not during the transition
    setTimeout(() => this.context.bus.emit('leo:wave'), 350);

    try {
      const lessons = await this.context.services.lessons.getAllSummaries();
      this._renderLessons(lessons);
    } catch (err) {
      console.error('Failed to load lessons', err);
      this._lessonGrid.textContent = 'Oops, could not load lessons.';
    }

    // If the reward catalog / progress hadn't loaded yet when we rendered,
    // once they finish loading the header listener below will refresh
    // everything including the costume. Do it now too in case they were
    // already loaded.
    this._refreshHeader();
  }

  _renderLessons(lessons) {
    clear(this._lessonGrid);
    const { progress } = this.context.services;

    lessons.forEach((lesson, i) => {
      const best = progress.getBestStars(lesson.id);
      const meta = LESSON_META[lesson.id] ?? DEFAULT_META;

      const card = el('button', {
        class: 'lesson-card',
        style: {
          background: meta.color,
          animationDelay: `${i * 0.05}s`,
        },
        onclick: () => this.context.router.navigate('gamePicker', { lessonId: lesson.id }),
      }, [
        el('div', { class: 'lesson-card__emoji' }, [meta.emoji]),
        el('div', { class: 'lesson-card__body' }, [
          el('div', { class: 'lesson-card__title' }, [lesson.title]),
          el('div', { class: 'lesson-card__sub' }, [`${lesson.itemCount} words`]),
        ]),
        el('div', { class: 'lesson-card__score' },
          best > 0 ? [`⭐ ${best}`] : ['✨']),
      ]);
      this._lessonGrid.appendChild(card);
    });
  }

  _buildHeader() {
    return el('div', { class: 'home__header' }, [
      el('div', {}, [
        el('h1', { class: 'home__title' }, ['Little Lion']),
        el('p',  { class: 'home__subtitle' }, [`Let's learn English! 🦁`]),
      ]),
      el('div', { class: 'home__stats' }, [
        this._streakLabel,
        el('div', { class: 'topbar__stars' }, ['⭐', this._starsLabel]),
      ]),
    ]);
  }

  _buildHeroBanner() {
    this._leo = new Leo(this.context.bus, { size: 'medium' });
    this.onDispose(() => this._leo.destroy());

    return el('div', { class: 'home__lesson-banner' }, [
      el('div', { class: 'home__lesson-banner-emoji' }, [this._leo.element]),
      el('div', { class: 'home__lesson-banner-text' }, [
        el('strong', {}, [`Hi friend!`]),
        el('span', {}, ['Pick a topic below to start']),
      ]),
    ]);
  }

  _buildStreak(days) {
    return el('div', { class: 'home__streak' }, [
      days > 0 ? `🔥 ${days}` : '🔥 0',
    ]);
  }

  _refreshHeader() {
    const { progress } = this.context.services;
    this._starsLabel.textContent = String(progress.totalStars);
    this._streakLabel.textContent = progress.streakDays > 0
      ? `🔥 ${progress.streakDays}`
      : '🔥 0';
    if (this._stickerCount) {
      this._stickerCount.textContent = String(this._countValidUnlocks());
    }
    this._applyCostumeToLeo();
  }

  /**
   * Pick the highest-tier costume the player has unlocked and put it
   * on Leo. Order is by streak-days descending - throne beats crown
   * beats cape beats scarf beats hat.
   */
  _applyCostumeToLeo() {
    if (!this._leo) return;
    const { rewards, progress } = this.context.services;
    if (!rewards.all || rewards.all.length === 0) {
      this.context.bus.emit('leo:costume', { emoji: null });
      return;
    }

    const costumes = rewards.byCategory('Costume')
      .filter(r => progress.hasUnlocked(r.id))
      .sort((a, b) => (b.streakDays ?? 0) - (a.streakDays ?? 0));

    const best = costumes[0];
    this.context.bus.emit('leo:costume', { emoji: best?.emoji ?? null });
  }

  /**
   * How many currently-valid rewards the player has unlocked.
   *
   * We cross-reference against the current catalog rather than just
   * counting progress.unlockedItems, because the catalog can shrink
   * between releases (e.g. we removed badges and costumes in commit
   * b23550b). Previously-earned unlocks remain in the player's
   * progress.json but should not inflate the sticker book count once
   * their catalog entries are gone.
   *
   * If the catalog hasn't loaded yet, fall back to the raw count so
   * the number isn't confusingly zero.
   */
  _countValidUnlocks() {
    const { progress, rewards } = this.context.services;
    const unlocked = progress.unlockedItems ?? [];

    if (!rewards.all || rewards.all.length === 0) {
      return unlocked.length;
    }

    const catalogIds = new Set(rewards.all.map(r => r.id));
    return unlocked.filter(u => catalogIds.has(u.id)).length;
  }
}

// Visual styling per lesson id - falls back to DEFAULT_META for unknown lessons.
const LESSON_META = {
  animals:  { emoji: '🦁', color: '#FFB84C' },
  colors:   { emoji: '🎨', color: '#FF6B9D' },
  fruits:   { emoji: '🍎', color: '#FF8C42' },
  vehicles: { emoji: '🚗', color: '#4ECDC4' },
  body:     { emoji: '👶', color: '#FFB3D9' },
  clothes:  { emoji: '👕', color: '#5B9EFF' },
  weather:  { emoji: '☀️', color: '#A78BFA' },
};

const DEFAULT_META = { emoji: '📚', color: '#A78BFA' };
