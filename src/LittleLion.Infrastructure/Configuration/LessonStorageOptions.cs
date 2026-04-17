namespace LittleLion.Infrastructure.Configuration;

/// <summary>
/// Strongly-typed options bound from appsettings.json.
/// </summary>
public sealed class LessonStorageOptions
{
    public const string SectionName = "LessonStorage";

    /// <summary>
    /// Relative path from content root to the lessons JSON file.
    /// </summary>
    public string JsonFilePath { get; set; } = "Data/lessons.json";
}
