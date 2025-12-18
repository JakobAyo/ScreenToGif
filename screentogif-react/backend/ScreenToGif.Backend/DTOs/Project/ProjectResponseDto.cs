namespace ScreenToGif.Backend.DTOs.Project;

public record ProjectResponseDto(
    string ProjectId,
    bool Success,
    string? Error = null
);
