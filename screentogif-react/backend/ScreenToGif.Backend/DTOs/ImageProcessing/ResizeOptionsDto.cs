namespace ScreenToGif.Backend.DTOs.ImageProcessing;

public record ResizeOptionsDto(
    int Width,
    int Height,
    bool MaintainAspectRatio,
    string InterpolationMode
);
