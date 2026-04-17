using LittleLion.Application.Common;

namespace LittleLion.Infrastructure.Time;

/// <summary>
/// Real-clock implementation. Unit tests should use a test-double instead.
/// </summary>
public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
