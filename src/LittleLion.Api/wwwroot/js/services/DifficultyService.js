/**
 * Remembers which difficulty the child last selected per lesson.
 *
 * State is in-memory for the session. On page reload, each lesson
 * defaults back to Medium. That's a deliberate choice - we don't want
 * a child who had a bad Hard run yesterday to land back on Hard today
 * without seeing it; Medium is the friendly default.
 *
 * If we later want persistence, swap the Map for localStorage-backed
 * storage - no callers need to change.
 */
export class DifficultyService {
  static ALL = ['Easy', 'Medium', 'Hard'];
  static DEFAULT = 'Medium';

  constructor(bus) {
    this._bus = bus;
    this._byLesson = new Map();
  }

  /** 'Easy' | 'Medium' | 'Hard' - always a valid value. */
  get(lessonId) {
    return this._byLesson.get(lessonId) ?? DifficultyService.DEFAULT;
  }

  set(lessonId, difficulty) {
    if (!DifficultyService.ALL.includes(difficulty)) {
      console.warn(`DifficultyService: ignoring invalid difficulty '${difficulty}'`);
      return;
    }
    this._byLesson.set(lessonId, difficulty);
    this._bus.emit('difficulty:changed', { lessonId, difficulty });
  }
}
