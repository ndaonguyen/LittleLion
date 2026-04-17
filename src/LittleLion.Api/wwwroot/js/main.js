/**
 * Composition root for the frontend.
 * Creates services, wires the router, registers screens, mounts home.
 *
 * This is the ONLY file that knows about concrete classes.
 * Everything else depends on abstractions passed via `context`.
 */
import { ApiClient }          from './api/ApiClient.js';
import { EventBus }           from './core/EventBus.js';
import { Router }             from './core/Router.js';
import { AudioService }       from './services/AudioService.js';
import { SoundEffectService } from './services/SoundEffectService.js';
import { LessonService }      from './services/LessonService.js';
import { ProgressService }    from './services/ProgressService.js';
import { MediaService }       from './services/MediaService.js';

import { HomeScreen }       from './screens/HomeScreen.js';
import { GamePickerScreen } from './screens/GamePickerScreen.js';
import { WinScreen }        from './screens/WinScreen.js';
import { TapGame }     from './games/TapGame.js';
import { DragGame }    from './games/DragGame.js';
import { BalloonGame } from './games/BalloonGame.js';

function bootstrap() {
  const bus = new EventBus();
  const api = new ApiClient();

  const services = {
    audio:    new AudioService(),
    sfx:      new SoundEffectService(),
    lessons:  new LessonService(api),
    progress: new ProgressService(api, bus),
    media:    new MediaService(),
  };

  // Kick off initial progress load (non-blocking - UI renders immediately)
  services.progress.refresh();

  const rootEl = document.getElementById('app');
  const router = new Router(rootEl, null);

  const context = { bus, services, router };
  router.context = context; // complete the circular reference intentionally

  router
    .register('home',       (ctx)         => new HomeScreen(ctx))
    .register('gamePicker', (ctx, params) => new GamePickerScreen(ctx, params))
    .register('tap',        (ctx, params) => new TapGame(ctx, params))
    .register('drag',       (ctx, params) => new DragGame(ctx, params))
    .register('balloon',    (ctx, params) => new BalloonGame(ctx, params))
    .register('win',        (ctx, params) => new WinScreen(ctx, params));

  router.navigate('home');
}

bootstrap();
