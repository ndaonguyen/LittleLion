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
    this._cardByLesson = new Map();

    lessons.forEach((lesson, i) => {
      const meta = LESSON_META[lesson.id] ?? DEFAULT_META;
      const card = this._buildLessonCard(lesson, meta, i);
      this._cardByLesson.set(lesson.id, card);
      this._lessonGrid.appendChild(card);
    });
  }

  _buildLessonCard(lesson, meta, index) {
    const { progress, difficulty } = this.context.services;
    const currentDifficulty = difficulty.get(lesson.id);
    const best = progress.getBestStars(lesson.id, currentDifficulty);

    // Score pill - updates when difficulty dots are tapped
    const scorePill = el('div', { class: 'lesson-card__score' },
      best > 0 ? [`⭐ ${best}`] : ['✨']);

    // Difficulty dots
    const dotsRow = this._buildDifficultyDots(lesson.id, currentDifficulty, scorePill);

    const card = el('button', {
      class: 'lesson-card',
      style: {
        background: meta.color,
        animationDelay: `${index * 0.05}s`,
      },
      onclick: (e) => {
        // Ignore clicks that bubbled up from the dots row
        if (e.target.closest('.difficulty-dots')) return;
        const chosen = difficulty.get(lesson.id);
        this.context.router.navigate('gamePicker', {
          lessonId: lesson.id,
          difficulty: chosen,
        });
      },
    }, [
      el('div', { class: 'lesson-card__emoji' }, [meta.emoji]),
      el('div', { class: 'lesson-card__body' }, [
        el('div', { class: 'lesson-card__title' }, [lesson.title]),
        el('div', { class: 'lesson-card__sub' }, [`${lesson.itemCount} words`]),
        dotsRow,
      ]),
      scorePill,
    ]);

    return card;
  }

  _buildDifficultyDots(lessonId, currentDifficulty, scorePill) {
    const { difficulty, progress } = this.context.services;

    const row = el('div', { class: 'difficulty-dots', role: 'radiogroup', 'aria-label': 'Difficulty' });

    ['Easy', 'Medium', 'Hard'].forEach(level => {
      const isActive = level === currentDifficulty;
      const dot = el('button', {
        class: `difficulty-dot difficulty-dot--${level.toLowerCase()}${isActive ? ' difficulty-dot--active' : ''}`,
        type: 'button',
        role: 'radio',
        'aria-checked': String(isActive),
        'aria-label': level,
        title: level,
        onclick: (e) => {
          e.stopPropagation();
          difficulty.set(lessonId, level);

          // Update dots visually
          row.querySelectorAll('.difficulty-dot').forEach(d =>
            d.classList.remove('difficulty-dot--active'));
          dot.classList.add('difficulty-dot--active');

          // Update the score pill to reflect the new difficulty's best-stars
          const newBest = progress.getBestStars(lessonId, level);
          scorePill.textContent = newBest > 0 ? `⭐ ${newBest}` : '✨';
        },
      });
      row.appendChild(dot);
    });

    return row;
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

// Visual styling per lesson id - cover emoji and background color on
// the home-screen card. Falls back to DEFAULT_META for unknown lessons.
//
// NOTE: this is hardcoded here rather than loaded from lessons.json
// which makes adding a new lesson a two-file change. It's the pragmatic
// option for now - a future refactor should promote coverEmoji and
// coverColor into the lesson JSON + DTO so content owns its own cover.
const LESSON_META = {
  // Original 7
  animals:  { emoji: '🦁', color: '#FFB84C' },
  colors:   { emoji: '🎨', color: '#FF6B9D' },
  fruits:   { emoji: '🍎', color: '#FF8C42' },
  vehicles: { emoji: '🚗', color: '#4ECDC4' },
  body:     { emoji: '👶', color: '#FFB3D9' },
  clothes:  { emoji: '👕', color: '#5B9EFF' },
  weather:  { emoji: '☀️', color: '#A78BFA' },

  // 10 new lessons (colors chosen to avoid clashing with adjacent cards
  // on the home screen - the 2-column grid pairs odd/even positions
  // so we alternate warm/cool/neutral hues down the list)
  family:   { emoji: '👨‍👩‍👧', color: '#06B6D4' },  // teal - warmth via emoji, calm via color
  food:     { emoji: '🍕', color: '#EF4444' },  // classic pizza red
  numbers:  { emoji: '🔢', color: '#8B5CF6' },  // violet - stands apart from rainbow
  toys:     { emoji: '🧸', color: '#FB923C' },  // teddy orange
  actions:  { emoji: '🏃', color: '#14B8A6' },  // teal - action/energy vibe
  feelings: { emoji: '💖', color: '#EC4899' },  // pink heart
  house:    { emoji: '🏠', color: '#6366F1' },  // indigo like blueprints
  nature:   { emoji: '🌳', color: '#16A34A' },  // forest green
  bugs:     { emoji: '🐞', color: '#84CC16' },  // lime green
  sea:      { emoji: '🐋', color: '#0284C7' },  // ocean deep blue
};

const DEFAULT_META = { emoji: '📚', color: '#A78BFA' };
