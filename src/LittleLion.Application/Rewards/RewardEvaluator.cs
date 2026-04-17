using LittleLion.Application.Rewards.Abstractions;
using LittleLion.Domain.Progress;
using LittleLion.Domain.Rewards;

namespace LittleLion.Application.Rewards;

/// <summary>
/// Given the current player state (after a session was recorded), compute
/// which catalog rewards should now be unlocked. Pure logic - doesn't
/// mutate the player, just returns the list of rewards to unlock.
///
/// Separated from RecordSessionCommandHandler so it's unit-testable in
/// isolation and so other commands (backfill, admin tools) can reuse it.
/// </summary>
public sealed class RewardEvaluator
{
    private readonly IRewardCatalog _catalog;

    public RewardEvaluator(IRewardCatalog catalog) => _catalog = catalog;

    /// <summary>
    /// Returns rewards that the player has just qualified for but hasn't
    /// been granted yet. Caller is responsible for calling UnlockReward on
    /// each and persisting.
    /// </summary>
    public IReadOnlyList<RewardDefinition> EvaluateNewUnlocks(PlayerProgress progress)
    {
        var newlyUnlocked = new List<RewardDefinition>();

        foreach (var reward in _catalog.GetAll())
        {
            if (progress.HasUnlocked(reward.Id)) continue;
            if (IsQualified(reward, progress))
                newlyUnlocked.Add(reward);
        }

        return newlyUnlocked;
    }

    private static bool IsQualified(RewardDefinition reward, PlayerProgress progress)
    {
        return reward.Category switch
        {
            // Sticker: unlocks the first time the lesson is played at ANY
            // difficulty (any stars). An Easy play counts just as much as
            // a Hard one for sticker-book completion - the goal of stickers
            // is "you tried this topic", not "you mastered it".
            RewardCategory.Sticker when reward.LessonId is not null
                => progress.LessonHistory.Any(l =>
                    string.Equals(l.LessonId, reward.LessonId, StringComparison.OrdinalIgnoreCase)),

            // Badge: unlocks when best-stars for the lesson (across any
            // difficulty) reaches the threshold. So a 5-star Easy run can
            // grant a gold badge - intentional, keeps younger kids included.
            RewardCategory.Badge when reward.LessonId is not null && reward.RequiredBestStars > 0
                => progress.GetBestStarsAcrossDifficulties(reward.LessonId) >= reward.RequiredBestStars,

            // Costume: unlocks when streak days reach the threshold.
            RewardCategory.Costume when reward.StreakDays > 0
                => progress.Streak.CurrentDays >= reward.StreakDays,

            _ => false,
        };
    }
}
