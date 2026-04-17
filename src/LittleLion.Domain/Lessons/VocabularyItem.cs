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

    public VocabularyItem(string id, string word, string emoji, string color)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Id required.", nameof(id));
        if (string.IsNullOrWhiteSpace(word))
            throw new ArgumentException("Word required.", nameof(word));

        Id = id;
        Word = word;
        Emoji = emoji;
        Color = color;
    }
}
