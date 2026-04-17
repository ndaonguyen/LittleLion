using LittleLion.Application.Common;
using LittleLion.Application.Lessons.Dtos;
using LittleLion.Application.Lessons.Queries;
using LittleLion.Application.Progress.Commands;
using LittleLion.Application.Progress.Dtos;
using LittleLion.Application.Progress.Queries;
using LittleLion.Application.Rewards;
using LittleLion.Application.Rewards.Queries;
using LittleLion.Domain.Common;
using Microsoft.Extensions.DependencyInjection;

namespace LittleLion.Application;

/// <summary>
/// Single extension method to wire up the Application layer.
/// Composition root (API) calls this - no hidden assembly scanning.
/// </summary>
public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Lesson handlers
        services.AddScoped<
            IQueryHandler<GetAllLessonsQuery, IReadOnlyList<LessonSummaryDto>>,
            GetAllLessonsQueryHandler>();

        services.AddScoped<
            IQueryHandler<GetLessonByIdQuery, Result<LessonDetailDto>>,
            GetLessonByIdQueryHandler>();

        // Progress handlers
        services.AddScoped<
            IQueryHandler<GetPlayerProgressQuery, PlayerProgressDto>,
            GetPlayerProgressQueryHandler>();

        services.AddScoped<
            ICommandHandler<RecordSessionCommand, Result<RecordSessionResultDto>>,
            RecordSessionCommandHandler>();

        // Reward handlers
        services.AddScoped<RewardEvaluator>();
        services.AddScoped<
            IQueryHandler<GetRewardCatalogQuery, IReadOnlyList<RewardDto>>,
            GetRewardCatalogQueryHandler>();

        return services;
    }
}
