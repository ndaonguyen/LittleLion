namespace LittleLion.Domain.Progress;

/// <summary>
/// Immutable streak value object. Encapsulates the "days in a row" logic
/// so it's testable in isolation and can't get into invalid states.
/// </summary>
public readonly record struct Streak(int CurrentDays, DateOnly? LastActiveDate)
{
    public static Streak Empty => new(0, null);

    /// <summary>
    /// Returns a new Streak after recording activity on <paramref name="today"/>.
    /// - Same day: unchanged
    /// - Next day: +1
    /// - Gap &gt; 1 day: reset to 1
    /// </summary>
    public Streak RecordActivity(DateOnly today)
    {
        if (LastActiveDate is null)
            return new Streak(1, today);

        var last = LastActiveDate.Value;
        if (today == last) return this;

        var delta = today.DayNumber - last.DayNumber;
        return delta == 1
            ? new Streak(CurrentDays + 1, today)
            : new Streak(1, today);
    }
}
