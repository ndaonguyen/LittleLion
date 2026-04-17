namespace LittleLion.Application.Common;

/// <summary>
/// Abstraction over DateTimeOffset.UtcNow so time-dependent logic
/// (streaks, timestamps) can be unit-tested deterministically.
/// </summary>
public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
