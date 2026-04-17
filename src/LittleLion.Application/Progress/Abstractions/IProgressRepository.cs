using LittleLion.Domain.Progress;

namespace LittleLion.Application.Progress.Abstractions;

/// <summary>
/// Persistence abstraction for player progress. Today: JSON file on disk.
/// Tomorrow: per-user rows in a database - swap implementation without
/// touching Application code.
/// </summary>
public interface IProgressRepository
{
    Task<PlayerProgress> LoadAsync(CancellationToken ct = default);
    Task SaveAsync(PlayerProgress progress, CancellationToken ct = default);
}
