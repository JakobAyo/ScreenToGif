namespace ScreenToGif.Backend.DTOs.Project;

public record ProjectDto(
    string Id,
    string Name,
    string Path,
    int Width,
    int Height,
    double Dpi,
    int FrameCount,
    long TotalDuration,
    DateTime CreatedAt,
    DateTime ModifiedAt
);
