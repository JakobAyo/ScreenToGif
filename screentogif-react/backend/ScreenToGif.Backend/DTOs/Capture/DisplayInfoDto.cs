namespace ScreenToGif.Backend.DTOs.Capture;

public record DisplayInfoDto(
    string Id,
    string Name,
    int X,
    int Y,
    int Width,
    int Height,
    bool IsPrimary,
    double ScaleFactor
);
