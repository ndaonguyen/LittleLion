import { BaseGame } from './BaseGame.js';
import { el } from '../core/DomHelpers.js';
import { shuffled, pickRandom } from '../core/Random.js';
import { createVocabVisual } from '../screens/VocabVisual.js';

/**
 * Drag-to-match game. Drag a word chip onto its matching animal tile.
 * Uses pointer events for unified mouse + touch handling.
 *
 * Single-round game: one round == all 4 items matched.
 */
export class DragGame extends BaseGame {
  get gameName()    { return 'drag'; }
  get totalRounds() { return 1; }

  renderRound() {
    const { audio } = this.context.services;

    const items = pickRandom(this.vocab, 4);
    const wordOrder = shuffled(items.map(i => i.id));
    const matched = new Set();

    // Map itemId -> tile + chip elements so we can update them after a match
    const tileById = new Map();
    const chipById = new Map();

    let draggingId = null;
    let ghost = null;
    let lastTrailAt = 0;

    const spawnTrail = (x, y) => {
      // Throttle so we don't spawn hundreds of particles per second
      const now = performance.now();
      if (now - lastTrailAt < 40) return;
      lastTrailAt = now;

      const item = items.find(i => i.id === draggingId);
      const dot = el('div', {
        class: 'drag-trail',
        style: {
          left: `${x}px`,
          top: `${y}px`,
          background: item.color,
        },
      });
      document.body.appendChild(dot);
      // Auto-clean after the fade-out animation
      setTimeout(() => dot.remove(), 500);
    };

    const onPointerMove = (e) => {
      if (!ghost) return;
      ghost.style.left = `${e.clientX - 50}px`;
      ghost.style.top  = `${e.clientY - 25}px`;
      spawnTrail(e.clientX, e.clientY);
    };

    const onPointerUp = (e) => {
      if (!draggingId) return;
      const underneath = document.elementFromPoint(e.clientX, e.clientY);
      const slot = underneath?.closest('[data-slot]');
      const slotId = slot?.dataset.slot;

      if (slotId && slotId === draggingId) {
        matched.add(slotId);
        const item = items.find(i => i.id === slotId);
        chipById.get(slotId).classList.add('word-chip--used');
        tileById.get(slotId).appendChild(
          el('div', { class: 'tile__label' }, [item.word])
        );
        this.context.services.sfx.play('ding');
        audio.speak(item.word);
        this.context.bus.emit('leo:cheer');

        this.stars = matched.size;
        this.topBar.update({ progress: matched.size / items.length, stars: this.stars });

        if (matched.size === items.length) {
          setTimeout(() => {
            this.round = this.totalRounds;
            this.context.services.progress.recordSession(this.lessonId, this.stars);
            this.context.router.navigate('win', { stars: this.stars, playedGame: 'drag', lessonId: this.lessonId });
          }, 900);
        }
      } else if (slot) {
        slot.classList.add('tile--wrong');
        this.context.services.sfx.play('buzz');
        this.context.bus.emit('leo:sad');
        this.noteWrong();
        setTimeout(() => slot.classList.remove('tile--wrong'), 400);
      }

      ghost?.remove();
      ghost = null;
      draggingId = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    const startDrag = (e, wordId) => {
      if (matched.has(wordId)) return;
      draggingId = wordId;
      const item = items.find(i => i.id === wordId);

      ghost = el('div', { class: 'word-chip word-chip--ghost' }, [item.word]);
      ghost.style.left = `${e.clientX - 50}px`;
      ghost.style.top  = `${e.clientY - 25}px`;
      document.body.appendChild(ghost);

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    // Tiles (drop targets)
    const { media } = this.context.services;
    const tilesWrapper = el('div', { class: 'drag-grid' },
      items.map((item, idx) => {
        const tile = el('div', {
          class: 'tile tile--entering',
          style: {
            background: item.color,
            animationDelay: `${idx * 90}ms`,
          },
          dataset: { slot: item.id },
        }, [createVocabVisual(item, media, { size: 'medium' })]);
        tileById.set(item.id, tile);
        return tile;
      })
    );

    // Word chips
    const chipsWrapper = el('div', { class: 'drag-words' },
      wordOrder.map(wordId => {
        const item = items.find(i => i.id === wordId);
        const chip = el('div', {
          class: 'word-chip',
          onpointerdown: (e) => startDrag(e, wordId),
        }, [item.word]);
        chipById.set(wordId, chip);
        return chip;
      })
    );

    this.bodyContainer.append(
      el('p', { class: 'game__prompt' }, ['Drag the word to the animal']),
      tilesWrapper,
      chipsWrapper,
    );

    // Cleanup safety
    this.onDispose(() => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      ghost?.remove();
    });
  }
}
