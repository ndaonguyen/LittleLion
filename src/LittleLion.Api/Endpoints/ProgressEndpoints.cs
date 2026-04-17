using LittleLion.Application.Common;
using LittleLion.Application.Progress.Commands;
using LittleLion.Application.Progress.Dtos;
using LittleLion.Application.Progress.Queries;
using LittleLion.Domain.Common;

namespace LittleLion.Api.Endpoints;

/// <summary>
/// Progress HTTP endpoints. Mirror LessonEndpoints in style:
/// endpoints are one-liners that dispatch to handlers.
/// </summary>
public static class ProgressEndpoints
{
    public static IEndpointRouteBuilder MapProgressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/progress").WithTags("Progress");

        group.MapGet("/", GetPlayerProgress)
            .WithName("GetPlayerProgress")
            .Produces<PlayerProgressDto>();

        group.MapPost("/sessions", RecordSession)
            .WithName("RecordSession")
            .Produces<RecordSessionResultDto>()
            .Produces(400);

        return app;
    }

    private static async Task<IResult> GetPlayerProgress(
        IQueryHandler<GetPlayerProgressQuery, PlayerProgressDto> handler,
        CancellationToken ct)
    {
        var result = await handler.HandleAsync(new GetPlayerProgressQuery(), ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> RecordSession(
        RecordSessionRequest request,
        ICommandHandler<RecordSessionCommand, Result<RecordSessionResultDto>> handler,
        CancellationToken ct)
    {
        var cmd = new RecordSessionCommand(request.LessonId, request.StarsEarned);
        var result = await handler.HandleAsync(cmd, ct);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : Results.BadRequest(new { error = result.Error });
    }

    /// <summary>Request body for POST /api/progress/sessions.</summary>
    public sealed record RecordSessionRequest(string LessonId, int StarsEarned);
}
