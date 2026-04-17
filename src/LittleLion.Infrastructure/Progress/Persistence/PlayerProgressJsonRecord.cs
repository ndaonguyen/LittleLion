namespace LittleLion.Infrastructure.Progress.Persistence;

/// <summary>
/// JSON-serialization shape for persisted progress.
/// Kept internal and separate from Domain so on-disk format
/// can evolve independently of the domain model.
///
/// UnlockedItems is nullable so older progress.json files from before
/// rewards existed can still deserialize (we treat null as empty).
/// </summary>
internal sealed record PlayerProgressJsonRecord(
    int TotalStars,
    int StreakDays,
    DateOnly? LastActiveDate,
    List<LessonProgressJsonRecord> Lessons,
    List<UnlockedItemJsonRecord>? UnlockedItems);

internal sealed record LessonProgressJsonRecord(
    string LessonId,
    int BestStars,
    int TotalPlays,
    DateTimeOffset LastPlayedAt);

internal sealed record UnlockedItemJsonRecord(
    string Id,
    string Category,
    DateTimeOffset UnlockedAt);
