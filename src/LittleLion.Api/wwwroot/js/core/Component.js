/**
 * Abstract base component. Subclasses implement render() to return a DOM element.
 * Uses the Template Method pattern: mount/unmount lifecycle is fixed,
 * render/onMount/onUnmount are overridable hooks.
 */
export class Component {
  constructor(context) {
    this.context = context; // { bus, services, router }
    this.root = null;
    this._disposers = [];
  }

  /** Override: build and return the component's DOM root element. */
  render() {
    throw new Error(`${this.constructor.name} must implement render().`);
  }

  /** Override: called after the element is in the DOM. Start timers, fetch data, etc. */
  onMount() {}

  /** Override: called before the element is removed. Clean up. */
  onUnmount() {}

  /** Internal lifecycle - called by the Router. */
  mount(parent) {
    this.root = this.render();
    parent.appendChild(this.root);
    this.onMount();
  }

  unmount() {
    this.onUnmount();
    this._disposers.forEach(d => d());
    this._disposers = [];
    this.root?.remove();
    this.root = null;
  }

  /** Register a cleanup function that runs on unmount. */
  onDispose(fn) { this._disposers.push(fn); }

  /** Helper: subscribe to bus events with automatic cleanup on unmount. */
  listen(event, handler) {
    const off = this.context.bus.on(event, handler);
    this.onDispose(off);
  }
}
