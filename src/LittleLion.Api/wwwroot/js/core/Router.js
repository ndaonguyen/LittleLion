import { clear } from './DomHelpers.js';

/**
 * Minimal screen router. Holds a registry of { name -> factory }
 * and ensures only one screen is mounted at a time.
 *
 * Factory receives (context, params) and returns a Component instance.
 */
export class Router {
  constructor(rootElement, context) {
    this.root = rootElement;
    this.context = context;
    this.routes = new Map();
    this.current = null;
  }

  register(name, factory) {
    this.routes.set(name, factory);
    return this;
  }

  navigate(name, params = {}) {
    const factory = this.routes.get(name);
    if (!factory) throw new Error(`Unknown route: ${name}`);

    this.current?.unmount();
    clear(this.root);

    this.current = factory(this.context, params);
    this.current.mount(this.root);
  }
}
