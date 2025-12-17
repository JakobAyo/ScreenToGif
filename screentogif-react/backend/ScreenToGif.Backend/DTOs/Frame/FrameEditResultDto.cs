namespace ScreenToGif.Backend.DTOs.Frame;

public record FrameEditResultDto(
    bool Success,
    List<string> AffectedFrameIds,
    int NewFrameCount,
    string? Error
);
