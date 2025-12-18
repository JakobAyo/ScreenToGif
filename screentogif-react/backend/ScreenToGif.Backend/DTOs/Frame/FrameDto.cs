namespace ScreenToGif.Backend.DTOs.Frame;

public record FrameDto(
    string Id,
    FrameMetadataDto Metadata,
    string? ImageDataUrl,
    string? ThumbnailUrl,
    string? FilePath,
    bool IsKeyFrame,
    bool IsSelected,
    bool IsDeleted
);
