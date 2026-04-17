using LittleLion.Application.Common;
using LittleLion.Application.Progress.Abstractions;
using LittleLion.Application.Progress.Dtos;
using LittleLion.Application.Progress.Mapping;
using LittleLion.Domain.Common;

namespace LittleLion.Application.Progress.Commands;

/// <summary>
/// Records a completed game session: awards stars to the player and
/// updates the per-lesson stats.
/// </summary>
public sealed record RecordSessionCommand(string LessonId, int StarsEarned)
    : ICommand<Result<RecordSessionResultDto>>;

public sealed class RecordSessionCommandHandler
    : ICommandHandler<RecordSessionCommand, Result<RecordSessionResultDto>>
{
    private readonly IProgressRepository _repository;
    private readonly IClock _clock;

    public RecordSessionCommandHandler(IProgressRepository repository, IClock clock)
    {
        _repository = repository;
        _clock = clock;
    }

    public async Task<Result<RecordSessionResultDto>> HandleAsync(
        RecordSessionCommand command, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(command.LessonId))
            return Result<RecordSessionResultDto>.Failure("LessonId is required.");
        if (command.StarsEarned < 0)
            return Result<RecordSessionResultDto>.Failure("StarsEarned cannot be negative.");
        if (command.StarsEarned > 100)
            return Result<RecordSessionResultDto>.Failure("StarsEarned looks unreasonable (>100).");

        var progress = await _repository.LoadAsync(ct);
        var updatedLesson = progress.RecordSession(command.LessonId, command.StarsEarned, _clock.UtcNow);
        await _repository.SaveAsync(progress, ct);

        return Result<RecordSessionResultDto>.Success(new RecordSessionResultDto(
            PlayerProgress: ProgressMapper.ToDto(progress),
            LessonProgress: ProgressMapper.ToDto(updatedLesson),
            StarsEarned: command.StarsEarned));
    }
}
