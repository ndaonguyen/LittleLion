import { TapGame } from './TapGame.js';
import { pickOne, pickRandom, shuffled } from '../core/Random.js';
import { getConfusablesFor } from './PhoneticClusters.js';

/**
 * Find the Word - listening discrimination.
 *
 * Same UI as Tap (hear word, tap image) but the distractors are
 * phonetically close to the target rather than random. Tests whether
 * the child can actually distinguish close-sounding words - "sheep"
 * from "ship", "three" from "tree" - which is critical early-
 * English listening skill for Vietnamese speakers where those vowel
 * distinctions don't exist natively.
 *
 * Implementation detail: extends TapGame and overrides just
 * pickOptions(). The tile grid UI, difficulty scaling, Leo hints,
 * completion flow etc. are all inherited.
 *
 * Fallback: if the target has no cluster in PhoneticClusters or not
 * enough cluster-mates are in the current lesson, we fill out the
 * option set with random lesson items. The game still works, it's
 * just less 'phonetically hard' for that particular round.
 */
export class FindTheWordGame extends TapGame {
  get gameName()   { return 'find'; }
  get promptText() { return 'Listen carefully and tap'; }

  pickOptions(n) {
    // 1. Pick the target randomly from the lesson
    const target = pickOne(this.vocab);

    // 2. Look up phonetically-close confusable IDs for this target
    const confusableIds = getConfusablesFor(target.id);

    // 3. Intersect with current lesson's vocab (a cluster might include
    //    words from other lessons that aren't relevant right now)
    const lessonConfusables = this.vocab.filter(
      item => item.id !== target.id && confusableIds.includes(item.id)
    );

    // 4. Pick up to (n-1) distractors, preferring confusables first,
    //    topping up from the rest of the lesson if short.
    const distractors = [];
    const needed = n - 1;

    // Take confusables first (shuffled so we don't always show the
    // same ones when a cluster has > needed items)
    for (const item of shuffled(lessonConfusables)) {
      if (distractors.length >= needed) break;
      distractors.push(item);
    }

    // Top up with random other lesson items if we didn't have enough
    // confusables
    if (distractors.length < needed) {
      const remaining = this.vocab.filter(
        item => item.id !== target.id &&
                !distractors.some(d => d.id === item.id)
      );
      const topUp = pickRandom(remaining, needed - distractors.length);
      distractors.push(...topUp);
    }

    // 5. Shuffle target + distractors so the correct tile position is random
    const options = shuffled([target, ...distractors]);
    return { options, target };
  }
}
