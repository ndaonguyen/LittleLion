namespace LittleLion.Domain.Lessons;

/// <summary>
/// Aggregate root representing a complete lesson (e.g. "Animals", "Colors").
/// Encapsulates the list of vocabulary items and basic invariants.
/// </summary>
public sealed class Lesson
{
    private readonly List<VocabularyItem> _items;

    public LessonId Id { get; }
    public string Title { get; }
    public string Theme { get; }
    public IReadOnlyList<VocabularyItem> Items => _items.AsReadOnly();

    public Lesson(LessonId id, string title, string theme, IEnumerable<VocabularyItem> items)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title required.", nameof(title));

        var itemList = items?.ToList() ?? throw new ArgumentNullException(nameof(items));
        if (itemList.Count < 4)
            throw new ArgumentException("A lesson needs at least 4 vocabulary items.", nameof(items));

        Id = id;
        Title = title;
        Theme = theme;
        _items = itemList;
    }

    public VocabularyItem? FindItem(string itemId)
        => _items.FirstOrDefault(i => i.Id == itemId);
}
