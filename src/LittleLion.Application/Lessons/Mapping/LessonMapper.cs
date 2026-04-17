using LittleLion.Application.Lessons.Abstractions;
using LittleLion.Application.Lessons.Dtos;
using LittleLion.Domain.Lessons;

namespace LittleLion.Application.Lessons.Mapping;

/// <summary>
/// Explicit mapping between Domain and DTOs.
/// Kept as simple static methods - no AutoMapper magic for this scale.
/// </summary>
public static class LessonMapper
{
    public static VocabularyItemDto ToDto(VocabularyItem item, IAudioUrlFactory audioUrls)
        => new(
            Id: item.Id,
            Word: item.Word,
            Emoji: item.Emoji,
            Color: item.Color,
            AudioUrl: audioUrls.BuildUrl(item.Word));

    public static LessonSummaryDto ToSummary(Lesson lesson)
        => new(
            Id: lesson.Id.Value,
            Title: lesson.Title,
            Theme: lesson.Theme,
            ItemCount: lesson.Items.Count);

    public static LessonDetailDto ToDetail(Lesson lesson, IAudioUrlFactory audioUrls)
        => new(
            Id: lesson.Id.Value,
            Title: lesson.Title,
            Theme: lesson.Theme,
            Items: lesson.Items.Select(i => ToDto(i, audioUrls)).ToList());
}
