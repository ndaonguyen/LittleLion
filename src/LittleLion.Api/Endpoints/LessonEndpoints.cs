using LittleLion.Application.Common;
using LittleLion.Application.Lessons.Dtos;
using LittleLion.Application.Lessons.Queries;
using LittleLion.Domain.Common;

namespace LittleLion.Api.Endpoints;

/// <summary>
/// Lesson HTTP endpoints. Keep this file TINY - endpoints only dispatch
/// to query handlers and shape HTTP responses. No business logic here.
/// </summary>
public static class LessonEndpoints
{
    public static IEndpointRouteBuilder MapLessonEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/lessons").WithTags("Lessons");

        group.MapGet("/", GetAll)
            .WithName("GetAllLessons")
            .Produces<IReadOnlyList<LessonSummaryDto>>();

        group.MapGet("/{id}", GetById)
            .WithName("GetLessonById")
            .Produces<LessonDetailDto>()
            .Produces(404);

        return app;
    }

    private static async Task<IResult> GetAll(
        IQueryHandler<GetAllLessonsQuery, IReadOnlyList<LessonSummaryDto>> handler,
        CancellationToken ct)
    {
        var result = await handler.HandleAsync(new GetAllLessonsQuery(), ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetById(
        string id,
        IQueryHandler<GetLessonByIdQuery, Result<LessonDetailDto>> handler,
        CancellationToken ct)
    {
        var result = await handler.HandleAsync(new GetLessonByIdQuery(id), ct);
        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.NotFound(new { error = result.Error });
    }
}
