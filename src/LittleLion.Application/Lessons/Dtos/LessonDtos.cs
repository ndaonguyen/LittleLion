namespace LittleLion.Application.Lessons.Dtos;

/// <summary>
/// Transport-layer DTO. Decouples API contract from Domain model,
/// so Domain can evolve without breaking frontend.
/// </summary>
public sealed record VocabularyItemDto(
    string Id,
    string Word,
    string Emoji,
    string Color,
    string AudioUrl);

public sealed record LessonSummaryDto(
    string Id,
    string Title,
    string Theme,
    int ItemCount);

public sealed record LessonDetailDto(
    string Id,
    string Title,
    string Theme,
    IReadOnlyList<VocabularyItemDto> Items);
