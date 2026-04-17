namespace LittleLion.Infrastructure.Lessons.Persistence;

/// <summary>
/// Internal JSON-shaped records. NOT exposed outside Infrastructure.
/// Kept separate from Domain entities so JSON format can change independently.
/// </summary>
internal sealed record LessonJsonRecord(
    string Id,
    string Title,
    string Theme,
    List<VocabularyItemJsonRecord> Items);

internal sealed record VocabularyItemJsonRecord(
    string Id,
    string Word,
    string Emoji,
    string Color);
