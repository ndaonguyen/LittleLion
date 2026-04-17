namespace LittleLion.Domain.Progress;

/// <summary>
/// Per-(lesson, difficulty) progress statistics. Tracks best score and
/// total plays so the child sees their progress for each topic at each
/// level of challenge. Immutable - use WithSession() to record a new play.
///
/// Identity: the tuple (LessonId, Difficulty). A single lesson therefore
/// has up to three LessonProgress records on a given PlayerProgress.
/// </summary>
public sealed class LessonProgress
{
    public string LessonId { get; }
    public Difficulty Difficulty { get; }
    public int BestStars { get; }
    public int TotalPlays { get; }
    public DateTimeOffset LastPlayedAt { get; }

    public LessonProgress(
        string lessonId,
        Difficulty difficulty,
        int bestStars,
        int totalPlays,
        DateTimeOffset lastPlayedAt)
    {
        if (string.IsNullOrWhiteSpace(lessonId))
            throw new ArgumentException("LessonId required.", nameof(lessonId));
        if (bestStars < 0)
            throw new ArgumentOutOfRangeException(nameof(bestStars), "Best stars cannot be negative.");
        if (totalPlays < 0)
            throw new ArgumentOutOfRangeException(nameof(totalPlays), "Total plays cannot be negative.");

        LessonId = lessonId;
        Difficulty = difficulty;
        BestStars = bestStars;
        TotalPlays = totalPlays;
        LastPlayedAt = lastPlayedAt;
    }

    public static LessonProgress FirstPlay(
        string lessonId,
        Difficulty difficulty,
        int stars,
        DateTimeOffset at)
        => new(lessonId, difficulty, stars, 1, at);

    /// <summary>
    /// Returns a new LessonProgress reflecting a completed session.
    /// Best-stars only increases; total-plays always increments.
    /// Difficulty is the identity of the record and cannot change.
    /// </summary>
    public LessonProgress WithSession(int stars, DateTimeOffset at)
        => new(
            lessonId:     LessonId,
            difficulty:   Difficulty,
            bestStars:    Math.Max(BestStars, stars),
            totalPlays:   TotalPlays + 1,
            lastPlayedAt: at);
}
