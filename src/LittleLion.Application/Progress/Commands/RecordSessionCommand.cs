using LittleLion.Application.Common;
using LittleLion.Application.Progress.Abstractions;
using LittleLion.Application.Progress.Dtos;
using LittleLion.Application.Progress.Mapping;
using LittleLion.Application.Rewards;
using LittleLion.Domain.Common;

namespace LittleLion.Application.Progress.Commands;

/// <summary>
/// Records a completed game session: awards stars, updates per-lesson stats,
/// then evaluates the reward catalog to unlock any newly-qualified rewards.
/// Returns both the full updated player state AND the list of rewards that
/// were just unlocked (so the UI can celebrate them).
/// </summary>
public sealed record RecordSessionCommand(string LessonId, int StarsEarned)
    : ICommand<Result<RecordSessionResultDto>>;

public sealed class RecordSessionCommandHandler
    : ICommandHandler<RecordSessionCommand, Result<RecordSessionResultDto>>
{
    private readonly IProgressRepository _repository;
    private readonly IClock _clock;
    private readonly RewardEvaluator _rewardEvaluator;

    public RecordSessionCommandHandler(
        IProgressRepository repository,
        IClock clock,
        RewardEvaluator rewardEvaluator)
    {
        _repository = repository;
        _clock = clock;
        _rewardEvaluator = rewardEvaluator;
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

        // Evaluate new rewards AFTER recording the session so the evaluator sees
        // the latest state (updated best-stars, updated streak, etc.).
        var newlyUnlockedDefinitions = _rewardEvaluator.EvaluateNewUnlocks(progress);
        foreach (var reward in newlyUnlockedDefinitions)
            progress.UnlockReward(reward.Id, reward.Category, _clock.UtcNow);

        await _repository.SaveAsync(progress, ct);

        return Result<RecordSessionResultDto>.Success(new RecordSessionResultDto(
            PlayerProgress: ProgressMapper.ToDto(progress),
            LessonProgress: ProgressMapper.ToDto(updatedLesson),
            StarsEarned:    command.StarsEarned,
            NewlyUnlocked:  newlyUnlockedDefinitions.Select(ProgressMapper.ToDto).ToList()));
    }
}
