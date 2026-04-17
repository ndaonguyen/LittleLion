namespace LittleLion.Application.Lessons.Abstractions;

/// <summary>
/// Factory for building audio URLs. Today: local /audio/ path.
/// Tomorrow: swap to Azure Blob signed URLs without touching callers.
/// </summary>
public interface IAudioUrlFactory
{
    string BuildUrl(string word);
}
