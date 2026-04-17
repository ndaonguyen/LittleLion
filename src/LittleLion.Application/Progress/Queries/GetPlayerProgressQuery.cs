using LittleLion.Application.Common;
using LittleLion.Application.Progress.Abstractions;
using LittleLion.Application.Progress.Dtos;
using LittleLion.Application.Progress.Mapping;

namespace LittleLion.Application.Progress.Queries;

public sealed record GetPlayerProgressQuery : IQuery<PlayerProgressDto>;

public sealed class GetPlayerProgressQueryHandler
    : IQueryHandler<GetPlayerProgressQuery, PlayerProgressDto>
{
    private readonly IProgressRepository _repository;

    public GetPlayerProgressQueryHandler(IProgressRepository repository)
    {
        _repository = repository;
    }

    public async Task<PlayerProgressDto> HandleAsync(
        GetPlayerProgressQuery query, CancellationToken ct = default)
    {
        var progress = await _repository.LoadAsync(ct);
        return ProgressMapper.ToDto(progress);
    }
}
