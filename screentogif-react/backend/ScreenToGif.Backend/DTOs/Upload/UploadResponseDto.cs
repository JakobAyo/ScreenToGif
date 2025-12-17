namespace ScreenToGif.Backend.DTOs.Upload;

public record UploadResponseDto(
    bool Success,
    string? Url,
    string? DeleteHash,
    string? Error = null
);
