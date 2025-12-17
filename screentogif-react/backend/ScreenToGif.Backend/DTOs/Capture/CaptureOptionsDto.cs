using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.DTOs.Capture;

public record CaptureOptionsDto(
    CaptureMode Mode,
    CaptureRegionDto? Region,
    string? DisplayId,
    string? WindowId,
    int FrameRate,
    bool CaptureMouseCursor,
    bool CaptureMouseClicks,
    int? MaxDuration,
    int? MaxFrames
);
