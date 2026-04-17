using LittleLion.Application.Common;
using LittleLion.Application.Lessons.Abstractions;
using LittleLion.Application.Lessons.Dtos;
using LittleLion.Application.Lessons.Mapping;

namespace LittleLion.Application.Lessons.Queries;

public sealed record GetAllLessonsQuery : IQuery<IReadOnlyList<LessonSummaryDto>>;

public sealed class GetAllLessonsQueryHandler
    : IQueryHandler<GetAllLessonsQuery, IReadOnlyList<LessonSummaryDto>>
{
    private readonly ILessonRepository _repository;

    public GetAllLessonsQueryHandler(ILessonRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<LessonSummaryDto>> HandleAsync(
        GetAllLessonsQuery query, CancellationToken ct = default)
    {
        var lessons = await _repository.GetAllAsync(ct);
        return lessons.Select(LessonMapper.ToSummary).ToList();
    }
}
