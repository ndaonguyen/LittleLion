namespace LittleLion.Domain.Rewards;

/// <summary>
/// A single reward definition. The catalog (in the Application layer) knows
/// the full list; this struct is the shape each entry takes.
///
/// Unlock rules are encoded via the optional fields:
///   - LessonId set             -> unlocks when that lesson is completed / scored
///   - RequiredBestStars > 0    -> unlocks when best-stars for LessonId reaches this
///   - StreakDays > 0           -> unlocks when streak hits this many days
/// Exactly one rule should be active per reward.
/// </summary>
public sealed class RewardDefinition
{
    public string Id { get; }
    public string Name { get; }
    public string Emoji { get; }
    public RewardCategory Category { get; }
    public string? LessonId { get; }
    public int RequiredBestStars { get; }
    public int StreakDays { get; }

    public RewardDefinition(
        string id,
        string name,
        string emoji,
        RewardCategory category,
        string? lessonId = null,
        int requiredBestStars = 0,
        int streakDays = 0)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Id required.", nameof(id));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name required.", nameof(name));

        Id = id;
        Name = name;
        Emoji = emoji;
        Category = category;
        LessonId = lessonId;
        RequiredBestStars = requiredBestStars;
        StreakDays = streakDays;
    }
}
