using LittleLion.Application.Progress.Dtos;
using LittleLion.Domain.Progress;
using LittleLion.Domain.Rewards;

namespace LittleLion.Application.Progress.Mapping;

public static class ProgressMapper
{
    public static LessonProgressDto ToDto(LessonProgress lp)
        => new(lp.LessonId, lp.Difficulty.ToString(), lp.BestStars, lp.TotalPlays, lp.LastPlayedAt);

    public static UnlockedItemDto ToDto(UnlockedItem ui)
        => new(ui.Id, ui.Category.ToString(), ui.UnlockedAt);

    public static PlayerProgressDto ToDto(PlayerProgress pp)
        => new(
            TotalStars:     pp.TotalStars,
            StreakDays:     pp.Streak.CurrentDays,
            LastActiveDate: pp.Streak.LastActiveDate,
            Lessons:        pp.LessonHistory.Select(ToDto).ToList(),
            UnlockedItems:  pp.UnlockedItems.Select(ToDto).ToList());

    public static RewardDto ToDto(RewardDefinition r)
        => new(
            Id:                r.Id,
            Name:              r.Name,
            Emoji:             r.Emoji,
            Category:          r.Category.ToString(),
            LessonId:          r.LessonId,
            RequiredBestStars: r.RequiredBestStars,
            StreakDays:        r.StreakDays);
}
