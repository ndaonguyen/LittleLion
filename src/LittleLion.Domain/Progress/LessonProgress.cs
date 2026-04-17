namespace LittleLion.Domain.Progress;

/// <summary>
/// Per-lesson progress statistics. Tracks best score and total plays
/// so we can show the child their progress per topic.
/// Immutable - use WithSession() to record a new play.
/// </summary>
public sealed class LessonProgress
{
    public string LessonId { get; }
    public int BestStars { get; }
    public int TotalPlays { get; }
    public DateTimeOffset LastPlayedAt { get; }

    public LessonProgress(string lessonId, int bestStars, int totalPlays, DateTimeOffset lastPlayedAt)
    {
        if (string.IsNullOrWhiteSpace(lessonId))
            throw new ArgumentException("LessonId required.", nameof(lessonId));
        if (bestStars < 0)
            throw new ArgumentOutOfRangeException(nameof(bestStars), "Best stars cannot be negative.");
        if (totalPlays < 0)
            throw new ArgumentOutOfRangeException(nameof(totalPlays), "Total plays cannot be negative.");

        LessonId = lessonId;
        BestStars = bestStars;
        TotalPlays = totalPlays;
        LastPlayedAt = lastPlayedAt;
    }

    public static LessonProgress FirstPlay(string lessonId, int stars, DateTimeOffset at)
        => new(lessonId, stars, 1, at);

    /// <summary>
    /// Returns a new LessonProgress reflecting a completed session.
    /// Best-stars only increases; total-plays always increments.
    /// </summary>
    public LessonProgress WithSession(int stars, DateTimeOffset at)
        => new(
            lessonId:   LessonId,
            bestStars:  Math.Max(BestStars, stars),
            totalPlays: TotalPlays + 1,
            lastPlayedAt: at);
}
