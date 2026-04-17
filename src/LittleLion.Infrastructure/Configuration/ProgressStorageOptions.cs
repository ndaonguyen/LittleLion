namespace LittleLion.Infrastructure.Configuration;

public sealed class ProgressStorageOptions
{
    public const string SectionName = "ProgressStorage";

    /// <summary>
    /// Relative path from the content root to the progress JSON file.
    /// The file is created on first write.
    /// </summary>
    public string JsonFilePath { get; set; } = "Data/progress.json";
}
