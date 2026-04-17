namespace LittleLion.Domain.Lessons;

/// <summary>
/// A single learnable vocabulary item within a lesson.
/// Immutable - construct once, never mutate.
/// </summary>
public sealed class VocabularyItem
{
    public string Id { get; }
    public string Word { get; }
    public string Emoji { get; }
    public string Color { get; }

    /// <summary>
    /// Microsoft Fluent Emoji asset name (e.g. "Dog face", "Red apple").
    /// Null when we have no matching Fluent asset - UI falls back to the emoji.
    /// </summary>
    public string? FluentName { get; }

    public VocabularyItem(string id, string word, string emoji, string color, string? fluentName = null)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Id required.", nameof(id));
        if (string.IsNullOrWhiteSpace(word))
            throw new ArgumentException("Word required.", nameof(word));

        Id = id;
        Word = word;
        Emoji = emoji;
        Color = color;
        FluentName = string.IsNullOrWhiteSpace(fluentName) ? null : fluentName.Trim();
    }
}
