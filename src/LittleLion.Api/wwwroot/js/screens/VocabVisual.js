import { el } from '../core/DomHelpers.js';

/**
 * Renders the visual for a vocabulary item. Prefers a Fluent 3D emoji image;
 * falls back to the Unicode emoji text if the image fails (or no fluentName).
 *
 * Usage:
 *   const visual = createVocabVisual(item, mediaService);
 *   tileElement.appendChild(visual);
 */
export function createVocabVisual(item, mediaService, { size = 'medium' } = {}) {
  const wrapper = el('span', { class: `vocab-visual vocab-visual--${size}` });

  const imageUrl = mediaService.getImageUrl(item);
  if (!imageUrl) {
    wrapper.textContent = item.emoji;
    return wrapper;
  }

  // Show emoji immediately (so there's no blank tile while the image loads),
  // then swap to the image once it's ready. If the image 404s, we keep the
  // emoji fallback visible.
  wrapper.textContent = item.emoji;

  const img = el('img', {
    class: 'vocab-visual__img',
    src: imageUrl,
    alt: item.word,
    loading: 'eager',
    draggable: 'false',
    decoding: 'async',
  });

  img.addEventListener('load', () => {
    wrapper.textContent = '';
    wrapper.appendChild(img);
    wrapper.classList.add('vocab-visual--ready');
  });
  img.addEventListener('error', () => {
    // Leave the emoji fallback visible - nothing to do.
  });

  return wrapper;
}
