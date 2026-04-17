using LittleLion.Application.Common;
using LittleLion.Application.Lessons.Abstractions;
using LittleLion.Application.Lessons.Dtos;
using LittleLion.Application.Lessons.Mapping;
using LittleLion.Domain.Common;
using LittleLion.Domain.Lessons;

namespace LittleLion.Application.Lessons.Queries;

public sealed record GetLessonByIdQuery(string LessonId) : IQuery<Result<LessonDetailDto>>;

public sealed class GetLessonByIdQueryHandler
    : IQueryHandler<GetLessonByIdQuery, Result<LessonDetailDto>>
{
    private readonly ILessonRepository _repository;
    private readonly IAudioUrlFactory _audioUrls;

    public GetLessonByIdQueryHandler(
        ILessonRepository repository,
        IAudioUrlFactory audioUrls)
    {
        _repository = repository;
        _audioUrls = audioUrls;
    }

    public async Task<Result<LessonDetailDto>> HandleAsync(
        GetLessonByIdQuery query, CancellationToken ct = default)
    {
        LessonId id;
        try { id = LessonId.From(query.LessonId); }
        catch (ArgumentException ex) { return Result<LessonDetailDto>.Failure(ex.Message); }

        var lesson = await _repository.GetByIdAsync(id, ct);
        if (lesson is null)
            return Result<LessonDetailDto>.Failure($"Lesson '{query.LessonId}' not found.");

        return Result<LessonDetailDto>.Success(LessonMapper.ToDetail(lesson, _audioUrls));
    }
}
