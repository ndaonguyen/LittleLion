namespace LittleLion.Domain.Lessons;

/// <summary>
/// Strongly-typed lesson identifier. Prevents accidentally passing raw strings around.
/// </summary>
public readonly record struct LessonId(string Value)
{
    public static LessonId From(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("LessonId cannot be empty.", nameof(value));
        return new LessonId(value.Trim().ToLowerInvariant());
    }

    public override string ToString() => Value;
}
