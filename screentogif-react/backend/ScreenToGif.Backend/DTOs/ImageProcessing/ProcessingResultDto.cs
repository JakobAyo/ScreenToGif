namespace ScreenToGif.Backend.DTOs.ImageProcessing;

public record ProcessingResultDto(
    bool Success,
    int FramesProcessed,
    string? Error = null
);
