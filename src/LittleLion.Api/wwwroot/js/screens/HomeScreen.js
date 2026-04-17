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
    this._lessonGrid  = el('div', { class: 'lesson-grid' });

    this.listen('progress:changed', () => this._refreshHeader());

    const root = el('div', { class: 'screen home' }, [
      this._buildHeader(),
      this._buildHeroBanner(),
      this._lessonGrid,
      el('p', { class: 'home__footer' }, [
        'Tap a topic to start learning 🦁',
      ]),
    ]);

    return root;
  }

  async onMount() {
    try {
      const lessons = await this.context.services.lessons.getAllSummaries();
      this._renderLessons(lessons);
    } catch (err) {
      console.error('Failed to load lessons', err);
      this._lessonGrid.textContent = 'Oops, could not load lessons.';
    }
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
