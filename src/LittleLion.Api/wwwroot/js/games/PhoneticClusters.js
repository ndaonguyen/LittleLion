/**
 * Phonetic confusion clusters.
 *
 * Each cluster is a group of word-IDs that sound similar to each other -
 * minimal pairs, same vowel, same onset, etc. When Find the Word picks
 * distractors for a target, it first looks up the target's cluster and
 * picks others from there. Missing from any cluster? Fall back to
 * random distractors from the lesson - the game still works, just
 * less "phonetically hard" for those rounds.
 *
 * IDs must match item IDs in lessons.json exactly. Items can belong
 * to multiple clusters if they naturally share sounds with multiple
 * groups.
 *
 * Coverage is intentionally partial - I picked ~35 clusters covering
 * the most valuable minimal pairs in our 212-word vocabulary. Easy to
 * extend later: just add to this list.
 */
export const PHONETIC_CLUSTERS = [
  // Short "i" vs "ee" - classic minimal pair problem for Vietnamese speakers
  ['fish', 'sheep', 'pig'],            // "i" vs "ee" sound
  ['bee', 'tree', 'three', 'sheep'],   // long "ee" endings

  // Short vowels
  ['cat', 'hat', 'rabbit'],            // short "a"
  ['cow', 'mouth', 'mountain'],        // "ow" sound
  ['dog', 'frog', 'ant'],              // short "o" / nasal endings
  ['duck', 'truck', 'tummy'],          // "u" sound

  // "-at" / "-ap" / "-an" endings
  ['cat', 'hat', 'bat', 'hand'],       // -at / "h-a" onset

  // Close pairs where kids commonly confuse
  ['pen', 'pear', 'peach'],            // "p" onsets with different vowels
  ['rain', 'train', 'brown'],          // "r"-blends
  ['star', 'stick', 'storm'],          // "st-" onsets
  ['ship', 'shirt', 'shoes', 'sheep'], // "sh-" onsets (note ship vs sheep is THE classic)
  ['fish', 'foot', 'finger', 'four'],  // "f-" onsets
  ['milk', 'mouth', 'monkey', 'mango'],// "m-" onsets
  ['bird', 'bear', 'bee', 'baby'],     // "b-" onsets
  ['cow', 'car', 'cat', 'cake'],       // "c/k-" onsets

  // Number confusions
  ['three', 'tree'],                   // classic
  ['two', 'tooth'],                    // "t" onset
  ['four', 'foot', 'fog'],             // "f" onset
  ['six', 'seven'],                    // "s" onset
  ['eight', 'apple'],                  // "ay" vs short "a" - trickier

  // Body parts kids mix up
  ['hand', 'head', 'hair'],            // "h-" body parts
  ['eye', 'ear'],                      // short face-word pair
  ['knee', 'nose'],                    // "n-" body parts

  // Color confusion
  ['blue', 'brown', 'black'],          // "b-" colors
  ['pink', 'purple', 'peach'],         // "p-" pink-ish
  ['green', 'grey', 'grass'],          // "gr-" words

  // Animal confusion
  ['cat', 'cow', 'crab'],              // "c-" animals
  ['dog', 'duck', 'dolphin'],          // "d-" animals
  ['horse', 'house', 'hat'],           // "h-" look-alikes
  ['shark', 'sheep', 'ship'],          // "sh-" animals-ish
  ['lion', 'leaf', 'lamp'],            // "l-" onsets

  // Vehicle confusion
  ['bus', 'boat', 'bike', 'bear'],     // "b-" transport + bear
  ['car', 'cat', 'crab'],              // "c-" kids often confuse car with cat
  ['ship', 'sheep', 'shirt'],          // (duplicate with earlier - kids confuse these a lot, worth repeating)
  ['plane', 'plant', 'pear'],          // "pl-"

  // Food confusion
  ['rice', 'red', 'rain'],             // "r-"
  ['bread', 'brown', 'bird'],          // "br-"
  ['egg', 'elbow'],                    // "e" onset
  ['cake', 'cat', 'kiwi'],             // "k-" sound
];

/**
 * Return a list of word-IDs that are phonetically close to the given
 * target ID, excluding the target itself. Empty array if the target
 * has no cluster.
 */
export function getConfusablesFor(targetId) {
  const confusables = new Set();
  for (const cluster of PHONETIC_CLUSTERS) {
    if (cluster.includes(targetId)) {
      for (const id of cluster) {
        if (id !== targetId) confusables.add(id);
      }
    }
  }
  return Array.from(confusables);
}
