import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { pickRandom, pickOne } from '../core/Random.js';
import { createVocabVisual } from '../screens/VocabVisual.js';

/**
 * Odd One Out.
 *
 * Shows N tiles where (N-1) are from the current lesson and 1 is an
 * "intruder" from a different lesson. The child taps the intruder.
 *
 * Unlike Tap/Balloon which test "hear word -> find image", Odd One
 * Out tests *categorization*: "which of these doesn't belong to this
 * topic?" - a semantic judgement, not a lexical recall. Filling the
 * categorization gap is why I recommended this as the second new game.
 *
 * Needs access to OTHER lessons' vocab to pull an intruder - gets
 * that via the lesson service (loaded all summaries + contents on
 * demand).
 */
export class OddOneOutGame extends BaseGame {
  get gameName() { return 'odd'; }

  get roundsByDifficulty() { return { Easy: 3, Medium: 5, Hard: 7 }; }

  /** Total tiles per round - (N-1) correct + 1 intruder. */
  get tileCount() {
    return { Easy: 3, Medium: 4, Hard: 5 }[this.difficulty] ?? 4;
  }

  // onMount: load all lesson summaries + their item pools so we can
  // draw intruders from any other lesson. We extend the BaseGame
  // onMount rather than replacing it - super loads the current lesson
  // content, we then load others.
  async onMount() {
    await super.onMount();
    await this._loadIntruderPool();
    // super.onMount already rendered the first round with an empty
    // intruder pool if loading was slow - re-render so the first
    // round has a proper intruder.
    if (this._intruderPool.length > 0 && this.round === 0) {
      this._renderRound();
    }
  }

  async _loadIntruderPool() {
    const { lessons } = this.context.services;
    try {
      const summaries = await lessons.getAllSummaries();
      const otherIds = summaries
        .map(s => s.id)
        .filter(id => id !== this.lessonId);

      // Load each OTHER lesson's items in parallel
      const others = await Promise.all(
        otherIds.map(id => lessons.getLesson(id).catch(() => null))
      );

      // Flatten to a single pool; tag each item with its lessonId so
      // we don't accidentally pick an item from the player's current
      // lesson even if another lesson happens to share an id (unlikely
      // but defensive).
      this._intruderPool = others
        .filter(l => l && Array.isArray(l.items))
        .flatMap(l => l.items.filter(item =>
          !this.vocab.some(v => v.id === item.id)));
    } catch (err) {
      console.error('Odd One Out: failed to load intruder pool', err);
      this._intruderPool = [];
    }
  }

  renderRound() {
    const { audio, media } = this.context.services;

    const correctCount = Math.max(2, this.tileCount - 1);
    const n = Math.min(correctCount, this.vocab.length);

    const correctItems = pickRandom(this.vocab, n);

    // Pick an intruder from the cross-lesson pool. If the pool isn't
    // loaded yet (first render on slow devices), skip and show only
    // lesson items - _loadIntruderPool will re-render once loaded.
    const pool = this._intruderPool ?? [];
    if (pool.length === 0) {
      // No intruder available yet. Don't render a broken round - show
      // a brief loading state; onMount will re-trigger after the pool
      // is ready.
      this.bodyContainer.append(
        el('p', { class: 'game__prompt' }, ['Loading...']),
      );
      return;
    }

    const intruder = pickOne(pool);
    const options = [...correctItems, intruder];
    // Shuffle so the intruder isn't always at the end
    options.sort(() => Math.random() - 0.5);

    let locked = false;
    let intruderTile = null;

    const tiles = options.map((item, idx) => {
      const isIntruder = item.id === intruder.id;
      const tile = el('button', {
        class: 'tile tile--entering',
        style: {
          background: this.tileBackground(item),
          animationDelay: `${idx * 90}ms`,
        },
        'aria-label': item.word,
        onclick: () => {
          if (locked) return;
          if (isIntruder) {
            locked = true;
            tile.classList.add('tile--correct');
            this.context.services.sfx.play('ding');
            audio.speak(item.word);
            this.context.bus.emit('leo:cheer');
            this._showPraise(item.word);
            this.completeRound();
          } else {
            // Tapped a lesson item - this isn't the intruder
            tile.classList.add('tile--dodge');
            this.context.services.sfx.play('buzz');
            this.context.bus.emit('leo:sad');
            this.noteWrong();
            setTimeout(() => tile.classList.remove('tile--dodge'), 500);
          }
        },
      }, [createVocabVisual(item, media, { size: 'medium' })]);
      if (isIntruder) intruderTile = tile;
      return tile;
    });

    // At 5 tiles (Hard) use the dense grid, same approach as TapGame.
    const gridClass = options.length >= 5 ? 'tap-grid tap-grid--dense' : 'tap-grid';

    // Spoken prompt: category name + the question. Using the category
    // as a sentence tag rather than "These are <title>" avoids grammar
    // awkwardness on lessons like "My Body" or "Food" (uncountable).
    // Examples:
    //   "Animals. Which one doesn't belong?"
    //   "My Body. Which one doesn't belong?"
    const promptSpoken = `${this.lessonTitle}. Which one doesn't belong?`;
    const playPrompt = () => audio.speak(promptSpoken);

    this.bodyContainer.append(
      el('p', { class: 'game__prompt' }, [`Which one doesn't belong?`]),
      el('button', {
        class: 'sound-button',
        onclick: playPrompt,
      }, [
        el('span', { class: 'sound-button__icon' }, ['🔊']),
        el('span', {}, ['Play sound']),
      ]),
      el('div', { class: gridClass, style: { marginTop: '24px' } }, tiles),
    );

    // Auto-speak the prompt shortly after render so the child hears
    // the question without having to tap. The delay lets the
    // entrance animations settle - speaking over scene transitions
    // feels rushed.
    setTimeout(playPrompt, 500);

    // Hint watcher - point at the intruder after 8s
    this.startRoundWatch(intruderTile);
  }

  _showPraise(word) {
    const banner = el('div', { class: 'feedback-banner' }, [`Yes! ${word} is different! 🎉`]);
    this.bodyContainer.appendChild(banner);
  }
}
