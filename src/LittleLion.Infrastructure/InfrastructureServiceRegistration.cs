using LittleLion.Application.Common;
using LittleLion.Application.Lessons.Abstractions;
using LittleLion.Application.Progress.Abstractions;
using LittleLion.Infrastructure.Configuration;
using LittleLion.Infrastructure.Lessons.Audio;
using LittleLion.Infrastructure.Lessons.Persistence;
using LittleLion.Infrastructure.Progress.Persistence;
using LittleLion.Infrastructure.Time;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LittleLion.Infrastructure;

/// <summary>
/// Composition of Infrastructure services. Called once from API's Program.cs.
/// </summary>
public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Options
        services.Configure<LessonStorageOptions>(
            configuration.GetSection(LessonStorageOptions.SectionName));
        services.Configure<ProgressStorageOptions>(
            configuration.GetSection(ProgressStorageOptions.SectionName));

        // Lessons - singleton because lessons.json is static
        services.AddSingleton<ILessonRepository, JsonFileLessonRepository>();
        services.AddSingleton<IAudioUrlFactory, LocalAudioUrlFactory>();

        // Progress - singleton so the SemaphoreSlim serializes writes across requests
        services.AddSingleton<IProgressRepository, JsonFileProgressRepository>();

        // Clock
        services.AddSingleton<IClock, SystemClock>();

        return services;
    }
}
