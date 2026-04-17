import { el } from '../core/DomHelpers.js';

/**
 * Reusable top bar (home button + progress + stars count).
 * Returns both the element and an update() function so game screens
 * can refresh it without rebuilding the DOM.
 */
export function createTopBar({ onHome }) {
  const fill = el('div', { class: 'topbar__progress-fill' });
  const starsLabel = el('span', {}, ['0']);

  const element = el('div', { class: 'topbar' }, [
    el('button', {
      class: 'topbar__home',
      'aria-label': 'Home',
      onclick: onHome,
    }, ['🏠']),
    el('div', { class: 'topbar__progress' }, [fill]),
    el('div', { class: 'topbar__stars' }, ['⭐', starsLabel]),
  ]);

  function update({ progress, stars }) {
    if (progress != null) fill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    if (stars != null) starsLabel.textContent = String(stars);
  }

  return { element, update };
}
