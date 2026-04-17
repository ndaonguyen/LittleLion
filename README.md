# Little Lion 🦁

A playful English-learning web app for young children. Built with clean architecture in .NET 8 on the backend and vanilla HTML/CSS/JS on the frontend — no npm, no bundler, just open and run.

## Running

1. Open `LittleLion.sln` in Rider.
2. Make sure the **run configuration** is set to `LittleLion` (it's auto-created from `launchSettings.json`).
3. Press **Run** (green triangle) or `Shift+F10`.
4. A browser opens at `http://localhost:5080`.

That's it. No Node, no npm, no build step for the frontend.

## Project layout

```
LittleLion.sln
└── src/
    ├── LittleLion.Domain          Entities and business rules. No dependencies.
    ├── LittleLion.Application     Use cases, interfaces, DTOs. Depends on Domain only.
    ├── LittleLion.Infrastructure  Concrete implementations (JSON repo, URL factory).
    └── LittleLion.Api             ASP.NET Core host. Endpoints + wwwroot static frontend.
        ├── Data/lessons.json      Lesson content (easy to edit without rebuilding).
        └── wwwroot/               Static SPA - served directly by Kestrel.
            ├── index.html
            ├── css/
            │   ├── tokens.css     Design tokens (colors, spacing, fonts).
            │   ├── base.css       Reset + app frame.
            │   ├── components.css Reusable UI pieces.
            │   └── screens.css    Screen-specific styles.
            └── js/
                ├── api/           ApiClient - HTTP wrapper.
                ├── core/          Component, Router, EventBus, DomHelpers, Random.
                ├── services/      AudioService, LessonService, ProgressService.
                ├── screens/       HomeScreen, WinScreen, TopBar.
                ├── games/         BaseGame + TapGame, DragGame, BalloonGame.
                └── main.js        Composition root.
```

## Backend design

**Clean Architecture** — dependencies point inward:

```
  Api ──────► Infrastructure ──────► Application ──────► Domain
                                          │                  ▲
                                          └──────────────────┘
                                             (references)
```

**Patterns in use**

- **Repository** — `ILessonRepository` lives in Application, `JsonFileLessonRepository` implements it in Infrastructure. Swap for EF Core later by replacing one class.
- **CQRS-lite** — each use case is a `Query` record + `IQueryHandler<Q, R>`. Thin, no MediatR dependency for this scale.
- **Result pattern** — `Result<T>` replaces exceptions for expected failures (e.g. lesson not found).
- **Options pattern** — `LessonStorageOptions` bound from `appsettings.json`.
- **Factory** — `IAudioUrlFactory` builds audio URLs. Swap the local implementation for a signed-blob-URL variant when you add cloud storage.
- **Composition root** — each layer has its own `ServiceRegistration` extension. `Program.cs` calls them in order.
- **Value object** — `LessonId` wraps a string with validation.

## Frontend design

Vanilla ES modules — no framework. Patterns:

- **Component base class** — template method lifecycle (`render`, `onMount`, `onUnmount`).
- **Router** — owns the single-screen stage, mounts and unmounts components cleanly.
- **EventBus** — decoupled pub/sub. `ProgressService.addStars(n)` → `bus.emit('progress:changed')` → `HomeScreen` updates its star count.
- **Service layer** — `AudioService`, `LessonService`, `ProgressService`. Screens depend on services, never on fetch directly.
- **Design tokens in CSS** — only `tokens.css` uses raw colors. Everything else uses `var(--token)`.

## Adding a new lesson

Edit `src/LittleLion.Api/Data/lessons.json`, add a new lesson object, hit Run. That's it.

```json
{
  "id": "vehicles",
  "title": "Vehicles",
  "theme": "transport",
  "items": [
    { "id": "car", "word": "Car", "emoji": "🚗", "color": "#EF4444" }
  ]
}
```

## API endpoints

| Method | Path                    | Response |
|--------|-------------------------|----------|
| GET    | `/api/lessons`          | `LessonSummaryDto[]` |
| GET    | `/api/lessons/{id}`     | `LessonDetailDto` or `404` |

## Next steps

- Replace browser TTS with pre-generated MP3s (Azure Speech Service, `en-US-AnaNeural` voice — designed for kids). `AudioService` is already designed for this swap.
- Add a parent dashboard showing per-lesson progress.
- Add user profiles so multiple kids share one install.
- Replace JSON repo with EF Core + PostgreSQL once lesson content grows.
