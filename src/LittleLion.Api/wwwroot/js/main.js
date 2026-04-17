/**
 * Composition root for the frontend.
 * Creates services, wires the router, registers screens, mounts home.
 *
 * This is the ONLY file that knows about concrete classes.
 * Everything else depends on abstractions passed via `context`.
 */
import { ApiClient }       from './api/ApiClient.js';
import { EventBus }        from './core/EventBus.js';
import { Router }          from './core/Router.js';
import { AudioService }    from './services/AudioService.js';
import { LessonService }   from './services/LessonService.js';
import { ProgressService } from './services/ProgressService.js';

import { HomeScreen }  from './screens/HomeScreen.js';
import { WinScreen }   from './screens/WinScreen.js';
import { TapGame }     from './games/TapGame.js';
import { DragGame }    from './games/DragGame.js';
import { BalloonGame } from './games/BalloonGame.js';

function bootstrap() {
  const bus = new EventBus();
  const api = new ApiClient();

  const services = {
    audio:    new AudioService(),
    lessons:  new LessonService(api),
    progress: new ProgressService(bus),
  };

  const rootEl = document.getElementById('app');
  const router = new Router(rootEl, null);

  const context = { bus, services, router };
  router.context = context; // complete the circular reference intentionally

  router
    .register('home',    (ctx)          => new HomeScreen(ctx))
    .register('tap',     (ctx, params)  => new TapGame(ctx, params))
    .register('drag',    (ctx, params)  => new DragGame(ctx, params))
    .register('balloon', (ctx, params)  => new BalloonGame(ctx, params))
    .register('win',     (ctx, params)  => new WinScreen(ctx, params));

  router.navigate('home');
}

bootstrap();
