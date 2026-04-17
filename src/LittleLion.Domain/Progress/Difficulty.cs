namespace LittleLion.Domain.Progress;

/// <summary>
/// How challenging a game session is configured to be.
///
/// Medium is the original / legacy behavior - all pre-difficulty
/// progress records are interpreted as Medium so existing scores
/// aren't lost when this feature ships.
/// </summary>
public enum Difficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3,
}
