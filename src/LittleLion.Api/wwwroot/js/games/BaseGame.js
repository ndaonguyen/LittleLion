import { Component } from '../core/Component.js';
import { el } from '../core/DomHelpers.js';
import { createTopBar } from '../screens/TopBar.js';

/**
 * Base class for all games. Handles the boring shared parts:
 *   - loading the active lesson
 *   - top bar with progress + stars
 *   - win condition and star crediting
 *
 * Subclasses implement:
 *   - totalRounds  (how many rounds for this game)
 *   - renderGameBody(vocab) -> DOM element
 */
export class BaseGame extends Component {
  constructor(context, params = {}) {
    super(context);
    this.lessonId = params.lessonId ?? 'animals';
    this.stars = 0;
    this.round = 0;
    this.vocab = [];
    this.topBar = null;
    this.bodyContainer = null;
  }

  get totalRounds() { return 5; }
  get gameName()    { return 'base'; }

  render() {
    this.topBar = createTopBar({
      onHome: () => this.context.router.navigate('home'),
    });

    this.bodyContainer = el('div', { class: 'game__body' });

    return el('div', { class: 'screen game' }, [
      this.topBar.element,
      this.bodyContainer,
    ]);
  }

  async onMount() {
    try {
      const lesson = await this.context.services.lessons.getLesson(this.lessonId);
      this.vocab = lesson.items;
      this._updateTopBar();
      this._renderRound();
    } catch (err) {
      console.error('Failed to load lesson', err);
      this.bodyContainer.textContent = 'Oops, could not load the lesson.';
    }
  }

  /** Subclasses override to render a single round's UI inside `this.bodyContainer`. */
  renderRound() {
    throw new Error(`${this.constructor.name} must implement renderRound().`);
  }

  /** Subclasses call this to award a star and advance. */
  completeRound() {
    this.stars += 1;
    this._updateTopBar();

    setTimeout(() => {
      this.round += 1;
      if (this.round >= this.totalRounds) {
        this._finish();
      } else {
        this._renderRound();
      }
    }, 1100);
  }

  _renderRound() {
    this.bodyContainer.innerHTML = '';
    this.renderRound();
  }

  _updateTopBar() {
    this.topBar.update({
      progress: this.round / this.totalRounds,
      stars: this.stars,
    });
  }

  _finish() {
    this.context.services.progress.addStars(this.stars);
    this.context.router.navigate('win', {
      stars: this.stars,
      playedGame: this.gameName,
    });
  }
}
