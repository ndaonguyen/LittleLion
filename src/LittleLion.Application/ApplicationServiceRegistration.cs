using LittleLion.Application.Common;
using LittleLion.Application.Lessons.Dtos;
using LittleLion.Application.Lessons.Queries;
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
        services.AddScoped<
            IQueryHandler<GetAllLessonsQuery, IReadOnlyList<LessonSummaryDto>>,
            GetAllLessonsQueryHandler>();

        services.AddScoped<
            IQueryHandler<GetLessonByIdQuery, Result<LessonDetailDto>>,
            GetLessonByIdQueryHandler>();

        return services;
    }
}
