namespace LittleLion.Infrastructure.Rewards.Persistence;

/// <summary>
/// Internal JSON shape for rewards. Kept separate from Domain so the
/// on-disk format can evolve independently.
/// </summary>
internal sealed record RewardJsonRecord(
    string Id,
    string Name,
    string Emoji,
    string Category,            // "Sticker" | "Badge" | "Costume"
    string? LessonId,
    int RequiredBestStars,
    int StreakDays);
