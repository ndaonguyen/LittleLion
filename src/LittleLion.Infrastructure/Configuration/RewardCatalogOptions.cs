namespace LittleLion.Infrastructure.Configuration;

public sealed class RewardCatalogOptions
{
    public const string SectionName = "RewardCatalog";

    public string JsonFilePath { get; set; } = "Data/rewards.json";
}
