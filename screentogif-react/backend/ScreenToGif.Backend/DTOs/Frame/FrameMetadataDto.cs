namespace ScreenToGif.Backend.DTOs.Frame;

public record FrameMetadataDto(
    int Index,
    long Timestamp,
    int Delay,
    int Width,
    int Height,
    int? CursorX,
    int? CursorY,
    bool? MouseClicked,
    string? KeyPressed
);
