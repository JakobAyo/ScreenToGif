namespace ScreenToGif.Backend.DTOs.Capture;

public record StopCaptureResponseDto(
    string SessionId,
    int FrameCount,
    long Duration,
    bool Success,
    string? Error = null
);
