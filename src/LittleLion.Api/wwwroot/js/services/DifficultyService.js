/**
 * Remembers the global difficulty the child has selected.
 *
 * Was previously per-lesson with a Map<lessonId, Difficulty>. That
 * created a confusing model - each lesson card had its own dots, and
 * the child had to set the level on every topic. Simplified to a
 * single global value picked once on the home screen.
 *
 * State is in-memory for the session. On page reload, the level
 * defaults back to Medium. Deliberate choice - we don't want a child
 * who had a bad Hard run yesterday to land back on Hard today
 * without seeing it; Medium is the friendly default.
 *
 * The get(lessonId) signature is preserved (ignoring the arg) so
 * existing callers in game screens don't need changes. They still
 * work; the lessonId is just silently ignored.
 */
export class DifficultyService {
  static ALL = ['Easy', 'Medium', 'Hard'];
  static DEFAULT = 'Medium';

  constructor(bus) {
    this._bus = bus;
    this._level = DifficultyService.DEFAULT;
  }

  /**
   * Get the current global difficulty.
   *
   * The lessonId arg is accepted-but-ignored for backward compat with
   * callers that still pass it. Safe to call as either get() or
   * get(lessonId) - both return the same global value.
   */
  get(_lessonId) {
    return this._level;
  }

  /**
   * Set the global difficulty. The lessonId arg is accepted-but-
   * ignored for backward compat with the old per-lesson signature.
   */
  set(lessonIdOrLevel, maybeLevel) {
    // Tolerate both the old set(lessonId, level) and new set(level)
    // calling conventions.
    const level = (maybeLevel !== undefined) ? maybeLevel : lessonIdOrLevel;

    if (!DifficultyService.ALL.includes(level)) {
      console.warn(`DifficultyService: ignoring invalid difficulty '${level}'`);
      return;
    }
    if (this._level === level) return;

    this._level = level;
    this._bus.emit('difficulty:changed', { difficulty: level });
  }
}
