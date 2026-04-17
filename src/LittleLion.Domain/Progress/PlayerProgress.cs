using LittleLion.Domain.Rewards;

namespace LittleLion.Domain.Progress;

/// <summary>
/// Aggregate root for a single player's progress.
/// For v1 there's only one anonymous "local" player - when multi-user
/// support arrives we can add a PlayerId and key records by it.
/// </summary>
public sealed class PlayerProgress
{
    private readonly Dictionary<string, LessonProgress> _byLesson;
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
            .ToDictionary(l => l.LessonId, StringComparer.OrdinalIgnoreCase);
        _unlocked = (unlockedItems ?? [])
            .ToDictionary(u => u.Id, StringComparer.OrdinalIgnoreCase);
    }

    public static PlayerProgress Empty() => new(0, Streak.Empty, [], []);

    public LessonProgress? GetLessonProgress(string lessonId)
        => _byLesson.TryGetValue(lessonId, out var progress) ? progress : null;

    public bool HasUnlocked(string rewardId) => _unlocked.ContainsKey(rewardId);

    /// <summary>
    /// Record a completed game session. Returns the updated lesson progress
    /// for convenience (e.g. to return to callers).
    /// </summary>
    public LessonProgress RecordSession(string lessonId, int stars, DateTimeOffset at)
    {
        if (stars < 0)
            throw new ArgumentOutOfRangeException(nameof(stars), "Stars cannot be negative.");

        TotalStars += stars;
        Streak = Streak.RecordActivity(DateOnly.FromDateTime(at.UtcDateTime));

        var existing = GetLessonProgress(lessonId);
        var updated = existing is null
            ? LessonProgress.FirstPlay(lessonId, stars, at)
            : existing.WithSession(stars, at);

        _byLesson[updated.LessonId] = updated;
        return updated;
    }

    /// <summary>
    /// Mark a reward as unlocked. Idempotent - unlocking the same id twice is a no-op
    /// and returns false (so callers can detect "was this actually new?").
    /// </summary>
    public bool UnlockReward(string rewardId, RewardCategory category, DateTimeOffset at)
    {
        if (_unlocked.ContainsKey(rewardId)) return false;
        _unlocked[rewardId] = new UnlockedItem(rewardId, category, at);
        return true;
    }
}
