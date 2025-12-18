using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.DTOs.Encoding;

public record EncodingProgressDto(
    string JobId,
    EncodingState State,
    double Progress,
    int CurrentFrame,
    int TotalFrames,
    string Stage,
    long? EstimatedTimeRemaining,
    long? OutputFileSize,
    string? Error,
    DateTime StartedAt,
    DateTime? CompletedAt
);
