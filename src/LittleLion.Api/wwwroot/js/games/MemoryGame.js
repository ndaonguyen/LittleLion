import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { shuffled, pickRandom } from '../core/Random.js';
import { createVocabVisual } from '../screens/VocabVisual.js';

/**
 * Memory Match (concentration) game.
 *
 * Grid of face-down cards in pairs. Tap one to flip it and hear the word.
 * Tap a second to check for a match:
 *   - Match: both stay face-up, celebration, score++
 *   - Mismatch: both flip back after a brief delay so the child has time
 *     to memorize them for later
 *
 * Single-round game: one round == all pairs matched. Stars = pairs matched.
 *
 * Easy: 3 pairs. Medium: 5 pairs. Hard: user-pickable between 6/8/10/12 pairs
 * (capped by lesson vocabulary size). Hard's pair picker is rendered as
 * inline pills above the grid, only when difficulty === 'Hard'.
 *
 * Deliberately does NOT call noteWrong() on mismatches - memory games
 * naturally produce many 'wrong' taps and that's the point, not a
 * failure signal. Leo stays neutral; only cheers on matches.
 */
export class MemoryGame extends BaseGame {
  get gameName()    { return 'memory'; }
  get totalRounds() { return 1; }

  /** Pair counts the user can pick from at Hard difficulty. */
  static HARD_PAIR_OPTIONS = [6, 8, 10, 12];

  constructor(context, params) {
    super(context, params);
    // User-selected pair count for Hard mode. Defaults to the smallest
    // option (6, same as before this feature). Easy/Medium ignore this.
    this._hardPairs = 6;
  }

  get pairCount() {
    if (this.difficulty === 'Hard') return this._hardPairs;
    return { Easy: 3, Medium: 5 }[this.difficulty] ?? 5;
  }

  /** How long mismatched cards stay visible before flipping back. */
  get flipBackMs() {
    return { Easy: 1500, Medium: 1200, Hard: 1000 }[this.difficulty] ?? 1200;
  }

  /**
   * Which hard-pair-count options are available for the current lesson?
   * Filters out counts larger than the vocab size - e.g. a 10-item
   * lesson (Numbers, Feelings) can't have 12 pairs.
   */
  get availableHardPairCounts() {
    return MemoryGame.HARD_PAIR_OPTIONS.filter(n => n <= this.vocab.length);
  }

  renderRound() {
    const { audio, media } = this.context.services;

    // Pick N distinct vocab items, create two cards per item
    const n = Math.min(this.pairCount, this.vocab.length);
    const items = pickRandom(this.vocab, n);

    // Build 2 cards per item, each tagged with the item's id + a unique
    // card-id so we can tell the two cards of the same pair apart.
    const cardDefs = items.flatMap(item => [
      { uid: `${item.id}-a`, item },
      { uid: `${item.id}-b`, item },
    ]);
    const deck = shuffled(cardDefs);
    const spokenItemIds = new Set();  // first-flip TTS; don't re-speak on re-flips
    const matchedItemIds = new Set();

    // Two-phase state machine: first pick, then second pick.
    // While resolving a mismatch (cards visible + waiting to flip back),
    // further taps are ignored via `locked`.
    let firstPick = null;   // { cardEl, item }
    let locked = false;

    const cardEls = deck.map((cardDef) => {
      const card = el('button', {
        class: 'memory-card',
        type: 'button',
        'aria-label': 'Hidden card',
        onclick: () => handleTap(card, cardDef),
      }, [
        el('div', { class: 'memory-card__inner' }, [
          el('div', { class: 'memory-card__back' }, ['?']),
          el('div', { class: 'memory-card__front' }, [
            createVocabVisual(cardDef.item, media, { size: 'small' }),
          ]),
        ]),
      ]);
      return { el: card, def: cardDef };
    });

    const handleTap = (cardEl, cardDef) => {
      if (locked) return;
      if (matchedItemIds.has(cardDef.item.id)) return;  // already solved pair
      if (cardEl.classList.contains('memory-card--flipped')) return;  // this card already up

      // Flip it open
      cardEl.classList.add('memory-card--flipped');
      cardEl.setAttribute('aria-label', cardDef.item.word);

      // Speak the word on the FIRST reveal of each item (no spam on re-flips)
      if (!spokenItemIds.has(cardDef.item.id)) {
        spokenItemIds.add(cardDef.item.id);
        audio.speak(cardDef.item.word);
      } else {
        // Still play a soft tick so the tap feels responsive
        this.context.services.sfx.play('ding');
      }

      if (firstPick === null) {
        // First card of a pair - just remember it and wait for second tap
        firstPick = { cardEl, item: cardDef.item, uid: cardDef.uid };
        return;
      }

      // Second card of a pair - compare
      const first = firstPick;
      const second = { cardEl, item: cardDef.item, uid: cardDef.uid };
      firstPick = null;

      if (first.item.id === second.item.id && first.uid !== second.uid) {
        // MATCH
        this._onMatch(first, second);
        matchedItemIds.add(first.item.id);

        this.stars = matchedItemIds.size;
        this.topBar.update({
          progress: matchedItemIds.size / n,
          stars: this.stars,
        });

        if (matchedItemIds.size === n) {
          // All pairs done - short pause to let the last match celebrate
          setTimeout(() => {
            this.round = this.totalRounds;
            this.context.services.progress.recordSession(
              this.lessonId, this.stars, this.difficulty);
            this.context.router.navigate('win', {
              stars: this.stars,
              playedGame: 'memory',
              lessonId: this.lessonId,
              difficulty: this.difficulty,
            });
          }, 1000);
        }
      } else {
        // MISMATCH - flip both back after a delay so the child can study them
        locked = true;
        setTimeout(() => {
          first.cardEl.classList.remove('memory-card--flipped');
          second.cardEl.classList.remove('memory-card--flipped');
          first.cardEl.setAttribute('aria-label', 'Hidden card');
          second.cardEl.setAttribute('aria-label', 'Hidden card');
          locked = false;
        }, this.flipBackMs);
      }
    };

    // Grid sizing: build a grid CSS class based on pair count so 3/5/6/8/10/12 pairs
    // each get a visually-pleasing layout. See memory-grid--pairs-N rules in CSS.
    const gridClass = `memory-grid memory-grid--pairs-${n}`;
    const gridEl = el('div', { class: gridClass }, cardEls.map(c => c.el));

    const children = [
      el('p', { class: 'game__prompt' }, ['Find the matching pairs']),
    ];
    if (this.difficulty === 'Hard') {
      children.push(this._buildHardPairPicker());
    }
    children.push(gridEl);
    this.bodyContainer.append(...children);
  }

  /**
   * Pill picker for the number of pairs at Hard. Tapping a pill updates
   * _hardPairs and re-renders the round. Counts that exceed the lesson's
   * vocab size are silently omitted (e.g. 12-pair option won't show on
   * the Numbers lesson which only has 10 items).
   */
  _buildHardPairPicker() {
    const row = el('div', {
      class: 'memory-pair-picker',
      role: 'radiogroup',
      'aria-label': 'Number of pairs',
    });

    this.availableHardPairCounts.forEach(count => {
      const isActive = count === this._hardPairs;
      const pill = el('button', {
        class: `memory-pair-picker__pill${isActive ? ' memory-pair-picker__pill--active' : ''}`,
        type: 'button',
        role: 'radio',
        'aria-checked': String(isActive),
        onclick: () => {
          if (count === this._hardPairs) return;
          this._hardPairs = count;
          // Re-render the round with the new pair count. _renderRound
          // clears the bodyContainer for us before re-running renderRound.
          this._renderRound();
          // Reset the round's score-tracking too - changing pair count
          // mid-game restarts the round, so any prior progress on this
          // round shouldn't bleed in.
          this.stars = 0;
          this._updateTopBar();
        },
      }, [`${count} pairs`]);
      row.appendChild(pill);
    });

    return row;
  }

  _onMatch(first, second) {
    [first, second].forEach(pick => {
      pick.cardEl.classList.add('memory-card--matched');
    });
    this.context.services.sfx.play('ding');
    this.context.bus.emit('leo:cheer');
  }
}
