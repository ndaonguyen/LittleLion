namespace LittleLion.Infrastructure.Progress.Persistence;

/// <summary>
/// JSON-serialization shape for persisted progress.
/// Kept internal and separate from Domain so on-disk format
/// can evolve independently of the domain model.
/// </summary>
internal sealed record PlayerProgressJsonRecord(
    int TotalStars,
    int StreakDays,
    DateOnly? LastActiveDate,
    List<LessonProgressJsonRecord> Lessons);

internal sealed record LessonProgressJsonRecord(
    string LessonId,
    int BestStars,
    int TotalPlays,
    DateTimeOffset LastPlayedAt);
