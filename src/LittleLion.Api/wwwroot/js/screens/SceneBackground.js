import { el } from '../core/DomHelpers.js';

/**
 * Themed animated background for games. Renders a decorative layer that
 * sits behind the interactive content (tiles, balloons, chips).
 *
 * Each theme is pure CSS/DOM - no images, so it's instant and colorful.
 * Scenes include ambient motion (clouds drifting, leaves swaying, etc.)
 * that's subtle enough not to distract from the gameplay.
 *
 * Dispatch is by the lesson's `theme` string from lessons.json, falling
 * back to `default` (empty) if no builder matches.
 */
export function createSceneBackground(theme) {
  const builder = SCENE_BUILDERS[theme] ?? SCENE_BUILDERS.default;
  const scene = builder();
  scene.classList.add('scene');
  scene.dataset.theme = theme ?? 'default';
  return scene;
}

/** Tiny helper: N shapes with --i index for stagger, used heavily below. */
const repeat = (n, builder) =>
  Array.from({ length: n }, (_, i) => builder(i));

const SCENE_BUILDERS = {
  // ---------- Original 7 lessons (fixed to match theme strings) ----------

  jungle: () => el('div', { class: 'scene scene--jungle' }, [
    el('div', { class: 'scene__leaf scene__leaf--1' }, ['🌿']),
    el('div', { class: 'scene__leaf scene__leaf--2' }, ['🍃']),
    el('div', { class: 'scene__leaf scene__leaf--3' }, ['🌱']),
    el('div', { class: 'scene__leaf scene__leaf--4' }, ['🌴']),
  ]),

  road: () => el('div', { class: 'scene scene--road' }, [
    el('div', { class: 'scene__sun' }, ['☀️']),
    el('div', { class: 'scene__cloud scene__cloud--1' }, ['☁️']),
    el('div', { class: 'scene__cloud scene__cloud--2' }, ['☁️']),
    el('div', { class: 'scene__road' }),
  ]),

  sky: () => el('div', { class: 'scene scene--sky' }, [
    el('div', { class: 'scene__cloud scene__cloud--1' }, ['☁️']),
    el('div', { class: 'scene__cloud scene__cloud--2' }, ['☁️']),
    el('div', { class: 'scene__cloud scene__cloud--3' }, ['☁️']),
    el('div', { class: 'scene__star scene__star--1' }, ['✨']),
    el('div', { class: 'scene__star scene__star--2' }, ['⭐']),
  ]),

  orchard: () => el('div', { class: 'scene scene--orchard' }, [
    el('div', { class: 'scene__leaf scene__leaf--1' }, ['🍃']),
    el('div', { class: 'scene__petal scene__petal--1' }, ['🌸']),
    el('div', { class: 'scene__petal scene__petal--2' }, ['🌸']),
    el('div', { class: 'scene__petal scene__petal--3' }, ['🌼']),
  ]),

  rainbow: () => el('div', { class: 'scene scene--rainbow' }, [
    el('div', { class: 'scene__bubble scene__bubble--1' }),
    el('div', { class: 'scene__bubble scene__bubble--2' }),
    el('div', { class: 'scene__bubble scene__bubble--3' }),
    el('div', { class: 'scene__bubble scene__bubble--4' }),
  ]),

  playroom: () => el('div', { class: 'scene scene--playroom' }, [
    el('div', { class: 'scene__heart scene__heart--1' }, ['💖']),
    el('div', { class: 'scene__heart scene__heart--2' }, ['💛']),
    el('div', { class: 'scene__heart scene__heart--3' }, ['💚']),
  ]),

  closet: () => el('div', { class: 'scene scene--closet' }, [
    el('div', { class: 'scene__sparkle scene__sparkle--1' }, ['✨']),
    el('div', { class: 'scene__sparkle scene__sparkle--2' }, ['✨']),
    el('div', { class: 'scene__sparkle scene__sparkle--3' }, ['💫']),
  ]),

  // ---------- 10 new lessons ----------

  // Family - warm cozy home: soft orange glow + two house silhouettes
  'home-warm': () => el('div', { class: 'scene scene--home-warm' }, [
    el('div', { class: 'scene__house scene__house--1' }, ['🏠']),
    el('div', { class: 'scene__house scene__house--2' }, ['🏡']),
    el('div', { class: 'scene__heart scene__heart--1' }, ['💛']),
    el('div', { class: 'scene__heart scene__heart--2' }, ['💖']),
  ]),

  // Food - kitchen: warm yellow with floating utensils
  kitchen: () => el('div', { class: 'scene scene--kitchen' }, [
    el('div', { class: 'scene__utensil scene__utensil--1' }, ['🥄']),
    el('div', { class: 'scene__utensil scene__utensil--2' }, ['🍴']),
    el('div', { class: 'scene__utensil scene__utensil--3' }, ['🥢']),
    el('div', { class: 'scene__steam scene__steam--1' }, ['💨']),
  ]),

  // Numbers - soft lavender with floating digits
  counting: () => el('div', { class: 'scene scene--counting' },
    ['1', '2', '3', '4', '5'].map((d, i) =>
      el('div', { class: `scene__digit scene__digit--${i + 1}` }, [d]))
  ),

  // Toys - bright pastels with block shapes at corners
  'playroom-bright': () => el('div', { class: 'scene scene--playroom-bright' }, [
    el('div', { class: 'scene__block scene__block--1' }),
    el('div', { class: 'scene__block scene__block--2' }),
    el('div', { class: 'scene__block scene__block--3' }),
    el('div', { class: 'scene__block scene__block--4' }),
    el('div', { class: 'scene__sparkle scene__sparkle--1' }, ['✨']),
  ]),

  // Actions - motion: horizontal speed-lines radiating out
  motion: () => el('div', { class: 'scene scene--motion' },
    repeat(5, i => el('div', { class: `scene__speedline scene__speedline--${i + 1}` }))
  ),

  // Feelings - pink/red gradient with floating hearts
  heart: () => el('div', { class: 'scene scene--heart' }, [
    el('div', { class: 'scene__heart scene__heart--1' }, ['💖']),
    el('div', { class: 'scene__heart scene__heart--2' }, ['💗']),
    el('div', { class: 'scene__heart scene__heart--3' }, ['💓']),
    el('div', { class: 'scene__heart scene__heart--4' }, ['💘']),
  ]),

  // House - cool blue with architectural grid lines
  blueprint: () => el('div', { class: 'scene scene--blueprint' }, [
    el('div', { class: 'scene__grid' }),
    el('div', { class: 'scene__house scene__house--1' }, ['🏠']),
  ]),

  // Nature - green forest with tree silhouettes at the bottom
  forest: () => el('div', { class: 'scene scene--forest' }, [
    el('div', { class: 'scene__tree scene__tree--1' }, ['🌳']),
    el('div', { class: 'scene__tree scene__tree--2' }, ['🌲']),
    el('div', { class: 'scene__tree scene__tree--3' }, ['🌳']),
    el('div', { class: 'scene__leaf scene__leaf--1' }, ['🍃']),
    el('div', { class: 'scene__leaf scene__leaf--2' }, ['🍂']),
  ]),

  // Bugs - bright green garden with flower shapes scattered
  garden: () => el('div', { class: 'scene scene--garden' }, [
    el('div', { class: 'scene__petal scene__petal--1' }, ['🌼']),
    el('div', { class: 'scene__petal scene__petal--2' }, ['🌸']),
    el('div', { class: 'scene__petal scene__petal--3' }, ['🌺']),
    el('div', { class: 'scene__leaf scene__leaf--1' }, ['🌱']),
  ]),

  // Sea - deep blue with wave lines + rising bubbles
  ocean: () => el('div', { class: 'scene scene--ocean' }, [
    el('div', { class: 'scene__wave scene__wave--1' }),
    el('div', { class: 'scene__wave scene__wave--2' }),
    ...repeat(5, i => el('div', { class: `scene__bubble scene__bubble--${i + 1}` })),
  ]),

  default: () => el('div', { class: 'scene' }),
};
