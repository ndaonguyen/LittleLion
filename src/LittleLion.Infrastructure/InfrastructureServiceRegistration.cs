using LittleLion.Application.Lessons.Abstractions;
using LittleLion.Infrastructure.Configuration;
using LittleLion.Infrastructure.Lessons.Audio;
using LittleLion.Infrastructure.Lessons.Persistence;
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
        services.Configure<LessonStorageOptions>(
            configuration.GetSection(LessonStorageOptions.SectionName));

        // Singleton - the JSON file is static, repository caches internally
        services.AddSingleton<ILessonRepository, JsonFileLessonRepository>();
        services.AddSingleton<IAudioUrlFactory, LocalAudioUrlFactory>();

        return services;
    }
}
