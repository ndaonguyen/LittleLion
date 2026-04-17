using System.Text.Json;
using LittleLion.Application.Rewards.Abstractions;
using LittleLion.Domain.Rewards;
using LittleLion.Infrastructure.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LittleLion.Infrastructure.Rewards.Persistence;

/// <summary>
/// Loads the reward catalog from rewards.json on first access and caches
/// it in memory. The catalog is static content - no reason to reload.
/// </summary>
public sealed class JsonFileRewardCatalog : IRewardCatalog
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IHostEnvironment _environment;
    private readonly RewardCatalogOptions _options;
    private readonly ILogger<JsonFileRewardCatalog> _logger;
    private readonly Lazy<IReadOnlyList<RewardDefinition>> _rewards;
    private readonly Lazy<Dictionary<string, RewardDefinition>> _byId;

    public JsonFileRewardCatalog(
        IHostEnvironment environment,
        IOptions<RewardCatalogOptions> options,
        ILogger<JsonFileRewardCatalog> logger)
    {
        _environment = environment;
        _options = options.Value;
        _logger = logger;
        _rewards = new Lazy<IReadOnlyList<RewardDefinition>>(Load);
        _byId = new Lazy<Dictionary<string, RewardDefinition>>(() =>
            _rewards.Value.ToDictionary(r => r.Id, StringComparer.OrdinalIgnoreCase));
    }

    public IReadOnlyList<RewardDefinition> GetAll() => _rewards.Value;

    public RewardDefinition? FindById(string id)
        => _byId.Value.TryGetValue(id, out var r) ? r : null;

    private IReadOnlyList<RewardDefinition> Load()
    {
        var fullPath = Path.Combine(_environment.ContentRootPath, _options.JsonFilePath);
        _logger.LogInformation("Loading reward catalog from {Path}", fullPath);

        if (!File.Exists(fullPath))
        {
            _logger.LogWarning("Reward catalog file not found - catalog will be empty.");
            return Array.Empty<RewardDefinition>();
        }

        using var stream = File.OpenRead(fullPath);
        var records = JsonSerializer.Deserialize<List<RewardJsonRecord>>(stream, JsonOptions)
            ?? new List<RewardJsonRecord>();

        return records.Select(MapToDomain).ToList();
    }

    private static RewardDefinition MapToDomain(RewardJsonRecord r)
    {
        if (!Enum.TryParse<RewardCategory>(r.Category, ignoreCase: true, out var category))
            throw new InvalidOperationException(
                $"Reward '{r.Id}' has invalid category '{r.Category}'.");

        return new RewardDefinition(
            id:                r.Id,
            name:              r.Name,
            emoji:             r.Emoji,
            category:          category,
            lessonId:          r.LessonId,
            requiredBestStars: r.RequiredBestStars,
            streakDays:        r.StreakDays);
    }
}
