import { el } from '../core/DomHelpers.js';

/**
 * Reusable top bar (back + home + progress + [difficulty?] + stars).
 *
 * Layout: [← back?] [🏠 home] ----progress---- [🟢/🟡/🔴]? [⭐ 0]
 *
 * The back button is optional - pass { onBack } to show it, omit to
 * hide. Home is always shown. The difficulty badge is also optional -
 * pass { difficulty: 'Easy' | 'Medium' | 'Hard' } to show a small
 * colored dot indicating the current level. Game screens pass it so
 * the parent can see at a glance what level their kid is on; Home /
 * Sticker Book / Game Picker omit it.
 *
 * Returns { element, update } so consumers can refresh progress/stars
 * without rebuilding the DOM.
 */
export function createTopBar({ onBack, onHome, difficulty }) {
  const fill = el('div', { class: 'topbar__progress-fill' });
  const starsLabel = el('span', {}, ['0']);

  const children = [];

  if (onBack) {
    children.push(el('button', {
      class: 'topbar__btn topbar__back',
      'aria-label': 'Back to game picker',
      onclick: onBack,
    }, ['←']));
  }

  children.push(
    el('button', {
      class: 'topbar__btn topbar__home',
      'aria-label': 'Home',
      onclick: onHome,
    }, ['🏠']),
    el('div', { class: 'topbar__progress' }, [fill]),
  );

  // Difficulty badge - emoji circle sized by difficulty. 4yo can read
  // 'bigger and redder = harder' without needing to read the word.
  if (difficulty) {
    const emoji = { Easy: '🟢', Medium: '🟡', Hard: '🔴' }[difficulty] ?? '🟡';
    const sizeClass = `topbar__difficulty--${difficulty.toLowerCase()}`;
    children.push(el('div', {
      class: `topbar__difficulty ${sizeClass}`,
      'aria-label': `Difficulty: ${difficulty}`,
      title: difficulty,
    }, [emoji]));
  }

  children.push(
    el('div', { class: 'topbar__stars' }, ['⭐', starsLabel]),
  );

  const element = el('div', { class: 'topbar' }, children);

  function update({ progress, stars }) {
    if (progress != null) fill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    if (stars != null) starsLabel.textContent = String(stars);
  }

  return { element, update };
}
