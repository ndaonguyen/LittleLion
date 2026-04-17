using System.Text.Json;
using LittleLion.Application.Lessons.Abstractions;
using LittleLion.Domain.Lessons;
using LittleLion.Infrastructure.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LittleLion.Infrastructure.Lessons.Persistence;

/// <summary>
/// Reads lessons from a JSON file. Results are cached in memory after first load
/// because the file is static content at this stage. Thread-safe via lazy init.
/// </summary>
public sealed class JsonFileLessonRepository : ILessonRepository
{
    private readonly IHostEnvironment _environment;
    private readonly LessonStorageOptions _options;
    private readonly ILogger<JsonFileLessonRepository> _logger;
    private readonly Lazy<Task<IReadOnlyList<Lesson>>> _lessonsCache;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public JsonFileLessonRepository(
        IHostEnvironment environment,
        IOptions<LessonStorageOptions> options,
        ILogger<JsonFileLessonRepository> logger)
    {
        _environment = environment;
        _options = options.Value;
        _logger = logger;
        _lessonsCache = new Lazy<Task<IReadOnlyList<Lesson>>>(LoadAsync);
    }

    public async Task<IReadOnlyList<Lesson>> GetAllAsync(CancellationToken ct = default)
        => await _lessonsCache.Value;

    public async Task<Lesson?> GetByIdAsync(LessonId id, CancellationToken ct = default)
    {
        var all = await _lessonsCache.Value;
        return all.FirstOrDefault(l => l.Id == id);
    }

    private async Task<IReadOnlyList<Lesson>> LoadAsync()
    {
        var fullPath = Path.Combine(_environment.ContentRootPath, _options.JsonFilePath);
        _logger.LogInformation("Loading lessons from {Path}", fullPath);

        if (!File.Exists(fullPath))
            throw new FileNotFoundException($"Lessons file not found: {fullPath}");

        await using var stream = File.OpenRead(fullPath);
        var records = await JsonSerializer.DeserializeAsync<List<LessonJsonRecord>>(stream, JsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize lessons file.");

        return records.Select(MapToDomain).ToList();
    }

    private static Lesson MapToDomain(LessonJsonRecord record)
    {
        var items = record.Items.Select(i =>
            new VocabularyItem(i.Id, i.Word, i.Emoji, i.Color, i.FluentName));

        return new Lesson(
            id: LessonId.From(record.Id),
            title: record.Title,
            theme: record.Theme,
            items: items);
    }
}
