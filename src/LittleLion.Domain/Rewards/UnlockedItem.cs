namespace LittleLion.Domain.Rewards;

/// <summary>
/// A reward the player has unlocked. Items are referenced by id (the canonical
/// identifier from the reward catalog) and also carry the category they belong to,
/// so the UI can group them without looking up the catalog again.
/// </summary>
public sealed class UnlockedItem
{
    public string Id { get; }
    public RewardCategory Category { get; }
    public DateTimeOffset UnlockedAt { get; }

    public UnlockedItem(string id, RewardCategory category, DateTimeOffset unlockedAt)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Reward id required.", nameof(id));

        Id = id;
        Category = category;
        UnlockedAt = unlockedAt;
    }
}

/// <summary>
/// The three reward categories. Each has a different unlock rule.
/// </summary>
public enum RewardCategory
{
    /// <summary>Awarded when a lesson is completed for the first time.</summary>
    Sticker,
    /// <summary>Bronze/Silver/Gold medal based on best-stars per lesson.</summary>
    Badge,
    /// <summary>Awarded at streak milestones (3 / 7 / 14 days etc.).</summary>
    Costume,
}
