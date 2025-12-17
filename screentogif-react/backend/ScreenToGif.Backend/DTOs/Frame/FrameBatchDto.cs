namespace ScreenToGif.Backend.DTOs.Frame;

public record FrameBatchDto(
    string SessionId,
    int StartIndex,
    List<FrameDto> Frames,
    int TotalFrames,
    bool HasMore
);
