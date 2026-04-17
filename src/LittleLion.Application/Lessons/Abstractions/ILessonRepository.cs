using LittleLion.Domain.Lessons;

namespace LittleLion.Application.Lessons.Abstractions;

/// <summary>
/// Abstraction over lesson storage. Allows JSON file implementation now,
/// EF Core / SQL / blob storage later - without changing any Application code.
/// </summary>
public interface ILessonRepository
{
    Task<IReadOnlyList<Lesson>> GetAllAsync(CancellationToken ct = default);
    Task<Lesson?> GetByIdAsync(LessonId id, CancellationToken ct = default);
}
