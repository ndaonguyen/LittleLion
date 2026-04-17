namespace LittleLion.Application.Progress.Dtos;

public sealed record LessonProgressDto(
    string LessonId,
    string Difficulty,
    int BestStars,
    int TotalPlays,
    DateTimeOffset LastPlayedAt);

public sealed record UnlockedItemDto(
    string Id,
    string Category,
    DateTimeOffset UnlockedAt);

public sealed record PlayerProgressDto(
    int TotalStars,
    int StreakDays,
    DateOnly? LastActiveDate,
    IReadOnlyList<LessonProgressDto> Lessons,
    IReadOnlyList<UnlockedItemDto> UnlockedItems);

/// <summary>
/// Session outcome. 'NewlyUnlocked' is the list of rewards that this
/// specific session just qualified the player for - so the UI can show
/// a celebration toast.
/// </summary>
public sealed record RecordSessionResultDto(
    PlayerProgressDto PlayerProgress,
    LessonProgressDto LessonProgress,
    int StarsEarned,
    IReadOnlyList<RewardDto> NewlyUnlocked);

public sealed record RewardDto(
    string Id,
    string Name,
    string Emoji,
    string Category,
    string? LessonId,
    int RequiredBestStars,
    int StreakDays);
