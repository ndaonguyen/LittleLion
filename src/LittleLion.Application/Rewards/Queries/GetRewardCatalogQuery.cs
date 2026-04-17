using LittleLion.Application.Common;
using LittleLion.Application.Progress.Dtos;
using LittleLion.Application.Progress.Mapping;
using LittleLion.Application.Rewards.Abstractions;

namespace LittleLion.Application.Rewards.Queries;

public sealed record GetRewardCatalogQuery : IQuery<IReadOnlyList<RewardDto>>;

public sealed class GetRewardCatalogQueryHandler
    : IQueryHandler<GetRewardCatalogQuery, IReadOnlyList<RewardDto>>
{
    private readonly IRewardCatalog _catalog;

    public GetRewardCatalogQueryHandler(IRewardCatalog catalog)
    {
        _catalog = catalog;
    }

    public Task<IReadOnlyList<RewardDto>> HandleAsync(
        GetRewardCatalogQuery query, CancellationToken ct = default)
    {
        IReadOnlyList<RewardDto> result = _catalog.GetAll()
            .Select(ProgressMapper.ToDto)
            .ToList();
        return Task.FromResult(result);
    }
}
