namespace ScreenToGif.Backend.DTOs.Capture;

public record WindowInfoDto(
    string Id,
    string Title,
    string ProcessName,
    CaptureRegionDto Bounds,
    bool IsMinimized,
    bool IsVisible
);
