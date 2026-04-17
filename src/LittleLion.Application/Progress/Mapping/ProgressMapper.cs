using LittleLion.Application.Progress.Dtos;
using LittleLion.Domain.Progress;

namespace LittleLion.Application.Progress.Mapping;

public static class ProgressMapper
{
    public static LessonProgressDto ToDto(LessonProgress lp)
        => new(lp.LessonId, lp.BestStars, lp.TotalPlays, lp.LastPlayedAt);

    public static PlayerProgressDto ToDto(PlayerProgress pp)
        => new(
            TotalStars:     pp.TotalStars,
            StreakDays:     pp.Streak.CurrentDays,
            LastActiveDate: pp.Streak.LastActiveDate,
            Lessons:        pp.LessonHistory.Select(ToDto).ToList());
}
