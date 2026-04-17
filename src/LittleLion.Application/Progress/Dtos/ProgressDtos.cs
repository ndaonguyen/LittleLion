namespace LittleLion.Application.Progress.Dtos;

public sealed record LessonProgressDto(
    string LessonId,
    int BestStars,
    int TotalPlays,
    DateTimeOffset LastPlayedAt);

public sealed record PlayerProgressDto(
    int TotalStars,
    int StreakDays,
    DateOnly? LastActiveDate,
    IReadOnlyList<LessonProgressDto> Lessons);

public sealed record RecordSessionResultDto(
    PlayerProgressDto PlayerProgress,
    LessonProgressDto LessonProgress,
    int StarsEarned);
