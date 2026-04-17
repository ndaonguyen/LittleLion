namespace LittleLion.Application.Common;

/// <summary>
/// Marker interface for a command - a mutating request returning a result.
/// </summary>
public interface ICommand<TResult> { }

public interface ICommandHandler<TCommand, TResult> where TCommand : ICommand<TResult>
{
    Task<TResult> HandleAsync(TCommand command, CancellationToken ct = default);
}
