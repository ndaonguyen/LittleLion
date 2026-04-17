using LittleLion.Application.Common;
using LittleLion.Application.Progress.Dtos;
using LittleLion.Application.Rewards.Queries;

namespace LittleLion.Api.Endpoints;

public static class RewardEndpoints
{
    public static IEndpointRouteBuilder MapRewardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/rewards").WithTags("Rewards");

        group.MapGet("/", GetCatalog)
            .WithName("GetRewardCatalog")
            .Produces<IReadOnlyList<RewardDto>>();

        return app;
    }

    private static async Task<IResult> GetCatalog(
        IQueryHandler<GetRewardCatalogQuery, IReadOnlyList<RewardDto>> handler,
        CancellationToken ct)
    {
        var result = await handler.HandleAsync(new GetRewardCatalogQuery(), ct);
        return Results.Ok(result);
    }
}
