namespace ScreenToGif.Backend.DTOs.Upload;

public record UploadRequestDto(
    string FilePath,
    string Service,
    Dictionary<string, string>? Credentials
);
