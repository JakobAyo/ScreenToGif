using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.DTOs.Capture;

public record CaptureSessionDto(
    string Id,
    CaptureState State,
    CaptureOptionsDto Options,
    DateTime? StartedAt,
    int FrameCount,
    long Duration,
    DateTime? LastFrameTimestamp
);
