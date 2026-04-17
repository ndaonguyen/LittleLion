using System.Text.Json;
using LittleLion.Application.Progress.Abstractions;
using LittleLion.Domain.Progress;
using LittleLion.Infrastructure.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LittleLion.Infrastructure.Progress.Persistence;

/// <summary>
/// Reads and writes player progress to a JSON file on disk.
/// Thread-safe via a SemaphoreSlim around reads/writes so concurrent
/// requests don't corrupt the file.
/// </summary>
public sealed class JsonFileProgressRepository : IProgressRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
    };

    private readonly IHostEnvironment _environment;
    private readonly ProgressStorageOptions _options;
    private readonly ILogger<JsonFileProgressRepository> _logger;
    private readonly SemaphoreSlim _fileLock = new(1, 1);

    public JsonFileProgressRepository(
        IHostEnvironment environment,
        IOptions<ProgressStorageOptions> options,
        ILogger<JsonFileProgressRepository> logger)
    {
        _environment = environment;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<PlayerProgress> LoadAsync(CancellationToken ct = default)
    {
        await _fileLock.WaitAsync(ct);
        try
        {
            var fullPath = ResolvePath();
            if (!File.Exists(fullPath))
                return PlayerProgress.Empty();

            await using var stream = File.OpenRead(fullPath);
            var record = await JsonSerializer.DeserializeAsync<PlayerProgressJsonRecord>(
                stream, JsonOptions, ct);

            return record is null ? PlayerProgress.Empty() : MapToDomain(record);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Progress file is corrupt - starting fresh.");
            return PlayerProgress.Empty();
        }
        finally
        {
            _fileLock.Release();
        }
    }

    public async Task SaveAsync(PlayerProgress progress, CancellationToken ct = default)
    {
        await _fileLock.WaitAsync(ct);
        try
        {
            var fullPath = ResolvePath();
            var directory = Path.GetDirectoryName(fullPath)!;
            Directory.CreateDirectory(directory);

            var record = MapToJson(progress);

            // Write to a temp file first, then atomically move into place -
            // avoids a half-written file if the process dies mid-save.
            var tempPath = fullPath + ".tmp";
            await using (var stream = File.Create(tempPath))
            {
                await JsonSerializer.SerializeAsync(stream, record, JsonOptions, ct);
            }
            File.Move(tempPath, fullPath, overwrite: true);
        }
        finally
        {
            _fileLock.Release();
        }
    }

    private string ResolvePath()
        => Path.Combine(_environment.ContentRootPath, _options.JsonFilePath);

    private static PlayerProgress MapToDomain(PlayerProgressJsonRecord record)
    {
        var streak = new Streak(record.StreakDays, record.LastActiveDate);
        var lessons = record.Lessons.Select(l =>
            new LessonProgress(l.LessonId, l.BestStars, l.TotalPlays, l.LastPlayedAt));
        return new PlayerProgress(record.TotalStars, streak, lessons);
    }

    private static PlayerProgressJsonRecord MapToJson(PlayerProgress progress)
        => new(
            TotalStars:     progress.TotalStars,
            StreakDays:     progress.Streak.CurrentDays,
            LastActiveDate: progress.Streak.LastActiveDate,
            Lessons: progress.LessonHistory
                .Select(l => new LessonProgressJsonRecord(
                    l.LessonId, l.BestStars, l.TotalPlays, l.LastPlayedAt))
                .ToList());
}
