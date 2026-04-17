namespace LittleLion.Application.Common;

/// <summary>
/// Marker interface for a query - a read-only request returning a result.
/// </summary>
public interface IQuery<TResult> { }

/// <summary>
/// Handler for a specific query type. Kept minimal to avoid MediatR dependency for this scale.
/// </summary>
public interface IQueryHandler<TQuery, TResult> where TQuery : IQuery<TResult>
{
    Task<TResult> HandleAsync(TQuery query, CancellationToken ct = default);
}
