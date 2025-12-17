namespace ScreenToGif.Backend.DTOs.Project;

public record CreateProjectRequestDto(
    string Name,
    int Width,
    int Height,
    double Dpi,
    string? SessionId
);
