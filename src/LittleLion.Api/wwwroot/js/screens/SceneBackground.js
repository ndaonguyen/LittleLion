import { el } from '../core/DomHelpers.js';

/**
 * Themed animated background for games. Renders a decorative layer that
 * sits behind the interactive content (tiles, balloons, chips).
 *
 * Each theme is pure CSS/DOM - no images, so it's instant and colorful.
 * Scenes include ambient motion (clouds drifting, leaves swaying, etc.)
 * that's subtle enough not to distract from the gameplay.
 */
export function createSceneBackground(theme) {
  const builder = SCENE_BUILDERS[theme] ?? SCENE_BUILDERS.default;
  const scene = builder();
  scene.classList.add('scene');
  scene.dataset.theme = theme ?? 'default';
  return scene;
}

const SCENE_BUILDERS = {
  animals: () => el('div', { class: 'scene scene--jungle' }, [
    el('div', { class: 'scene__leaf scene__leaf--1' }, ['🌿']),
    el('div', { class: 'scene__leaf scene__leaf--2' }, ['🍃']),
    el('div', { class: 'scene__leaf scene__leaf--3' }, ['🌱']),
    el('div', { class: 'scene__leaf scene__leaf--4' }, ['🌴']),
  ]),

  transport: () => el('div', { class: 'scene scene--road' }, [
    el('div', { class: 'scene__sun' }, ['☀️']),
    el('div', { class: 'scene__cloud scene__cloud--1' }, ['☁️']),
    el('div', { class: 'scene__cloud scene__cloud--2' }, ['☁️']),
    el('div', { class: 'scene__road' }),
  ]),

  weather: () => el('div', { class: 'scene scene--sky' }, [
    el('div', { class: 'scene__cloud scene__cloud--1' }, ['☁️']),
    el('div', { class: 'scene__cloud scene__cloud--2' }, ['☁️']),
    el('div', { class: 'scene__cloud scene__cloud--3' }, ['☁️']),
    el('div', { class: 'scene__star scene__star--1' }, ['✨']),
    el('div', { class: 'scene__star scene__star--2' }, ['⭐']),
  ]),

  food: () => el('div', { class: 'scene scene--orchard' }, [
    el('div', { class: 'scene__leaf scene__leaf--1' }, ['🍃']),
    el('div', { class: 'scene__petal scene__petal--1' }, ['🌸']),
    el('div', { class: 'scene__petal scene__petal--2' }, ['🌸']),
    el('div', { class: 'scene__petal scene__petal--3' }, ['🌼']),
  ]),

  colors: () => el('div', { class: 'scene scene--rainbow' }, [
    el('div', { class: 'scene__bubble scene__bubble--1' }),
    el('div', { class: 'scene__bubble scene__bubble--2' }),
    el('div', { class: 'scene__bubble scene__bubble--3' }),
    el('div', { class: 'scene__bubble scene__bubble--4' }),
  ]),

  body: () => el('div', { class: 'scene scene--playroom' }, [
    el('div', { class: 'scene__heart scene__heart--1' }, ['💖']),
    el('div', { class: 'scene__heart scene__heart--2' }, ['💛']),
    el('div', { class: 'scene__heart scene__heart--3' }, ['💚']),
  ]),

  clothes: () => el('div', { class: 'scene scene--closet' }, [
    el('div', { class: 'scene__sparkle scene__sparkle--1' }, ['✨']),
    el('div', { class: 'scene__sparkle scene__sparkle--2' }, ['✨']),
    el('div', { class: 'scene__sparkle scene__sparkle--3' }, ['💫']),
  ]),

  default: () => el('div', { class: 'scene' }),
};
