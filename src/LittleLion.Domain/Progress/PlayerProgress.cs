using LittleLion.Domain.Rewards;

namespace LittleLion.Domain.Progress;

/// <summary>
/// Aggregate root for a single player's progress.
/// For v1 there's only one anonymous "local" player - when multi-user
/// support arrives we can add a PlayerId and key records by it.
///
/// LessonProgress records are keyed by the (LessonId, Difficulty)
/// tuple - a single lesson can have separate best-star records for
/// Easy, Medium, and Hard.
/// </summary>
public sealed class PlayerProgress
{
    private readonly Dictionary<LessonKey, LessonProgress> _byLesson;
    private readonly Dictionary<string, UnlockedItem> _unlocked;

    public int TotalStars { get; private set; }
    public Streak Streak { get; private set; }
    public IReadOnlyCollection<LessonProgress> LessonHistory => _byLesson.Values;
    public IReadOnlyCollection<UnlockedItem> UnlockedItems => _unlocked.Values;

    public PlayerProgress(
        int totalStars,
        Streak streak,
        IEnumerable<LessonProgress> lessonHistory,
        IEnumerable<UnlockedItem>? unlockedItems = null)
    {
        if (totalStars < 0)
            throw new ArgumentOutOfRangeException(nameof(totalStars));

        TotalStars = totalStars;
        Streak = streak;
        _byLesson = (lessonHistory ?? [])
            .ToDictionary(LessonKey.For);
        _unlocked = (unlockedItems ?? [])
            .ToDictionary(u => u.Id, StringComparer.OrdinalIgnoreCase);
    }

    public static PlayerProgress Empty() => new(0, Streak.Empty, [], []);

    /// <summary>
    /// Progress for a specific lesson at a specific difficulty, or null.
    /// </summary>
    public LessonProgress? GetLessonProgress(string lessonId, Difficulty difficulty)
        => _byLesson.TryGetValue(new LessonKey(lessonId, difficulty), out var progress)
            ? progress
            : null;

    /// <summary>
    /// Best-stars achieved on this lesson at ANY difficulty. Used by
    /// reward unlock rules so the player earns stickers regardless of
    /// which difficulty they play at.
    /// </summary>
    public int GetBestStarsAcrossDifficulties(string lessonId)
        => _byLesson.Values
            .Where(l => string.Equals(l.LessonId, lessonId, StringComparison.OrdinalIgnoreCase))
            .Select(l => l.BestStars)
            .DefaultIfEmpty(0)
            .Max();

    public bool HasUnlocked(string rewardId) => _unlocked.ContainsKey(rewardId);

    /// <summary>
    /// Record a completed game session at a given difficulty. Returns the
    /// updated lesson progress for convenience.
    /// </summary>
    public LessonProgress RecordSession(
        string lessonId,
        Difficulty difficulty,
        int stars,
        DateTimeOffset at)
    {
        if (stars < 0)
            throw new ArgumentOutOfRangeException(nameof(stars), "Stars cannot be negative.");

        TotalStars += stars;
        Streak = Streak.RecordActivity(DateOnly.FromDateTime(at.UtcDateTime));

        var existing = GetLessonProgress(lessonId, difficulty);
        var updated = existing is null
            ? LessonProgress.FirstPlay(lessonId, difficulty, stars, at)
            : existing.WithSession(stars, at);

        _byLesson[LessonKey.For(updated)] = updated;
        return updated;
    }

    /// <summary>
    /// Mark a reward as unlocked. Idempotent - unlocking the same id
    /// twice is a no-op and returns false (callers can detect "was
    /// this actually new?").
    /// </summary>
    public bool UnlockReward(string rewardId, RewardCategory category, DateTimeOffset at)
    {
        if (_unlocked.ContainsKey(rewardId)) return false;
        _unlocked[rewardId] = new UnlockedItem(rewardId, category, at);
        return true;
    }

    /// <summary>
    /// Internal composite key for the progress dictionary. Case-insensitive
    /// on LessonId to match legacy behavior.
    /// </summary>
    private readonly record struct LessonKey(string LessonId, Difficulty Difficulty)
    {
        public static LessonKey For(LessonProgress lp) => new(lp.LessonId, lp.Difficulty);

        public bool Equals(LessonKey other)
            => string.Equals(LessonId, other.LessonId, StringComparison.OrdinalIgnoreCase)
            && Difficulty == other.Difficulty;

        public override int GetHashCode()
            => HashCode.Combine(
                LessonId?.ToLowerInvariant(),
                Difficulty);
    }
}
