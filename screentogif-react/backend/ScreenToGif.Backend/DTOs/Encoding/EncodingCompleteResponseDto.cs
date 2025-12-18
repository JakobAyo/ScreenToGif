namespace ScreenToGif.Backend.DTOs.Encoding;

public record EncodingCompleteResponseDto(
    string JobId,
    string OutputPath,
    long FileSize,
    long Duration,
    bool Success,
    string? Error = null
);
