import { el } from '../core/DomHelpers.js';

/**
 * Reusable top bar (back + home + progress + stars).
 *
 * Layout: [← back?] [🏠 home] ----progress---- [⭐ 0]
 *
 * The back button is optional - pass { onBack } to show it, omit to
 * hide. Home is always shown. Game screens pass onBack so the child
 * can return to the Game Picker for the same lesson without bouncing
 * all the way to home. Other screens (Home, Sticker Book) only pass
 * onHome or their own navigation.
 *
 * Returns { element, update } so consumers can refresh progress/stars
 * without rebuilding the DOM.
 */
export function createTopBar({ onBack, onHome }) {
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
    el('div', { class: 'topbar__stars' }, ['⭐', starsLabel]),
  );

  const element = el('div', { class: 'topbar' }, children);

  function update({ progress, stars }) {
    if (progress != null) fill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    if (stars != null) starsLabel.textContent = String(stars);
  }

  return { element, update };
}
