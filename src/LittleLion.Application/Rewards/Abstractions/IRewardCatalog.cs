using LittleLion.Domain.Rewards;

namespace LittleLion.Application.Rewards.Abstractions;

/// <summary>
/// Read-only catalog of all defined rewards. Implementations typically load
/// from JSON on startup and cache in memory.
/// </summary>
public interface IRewardCatalog
{
    IReadOnlyList<RewardDefinition> GetAll();
    RewardDefinition? FindById(string id);
}
