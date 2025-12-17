namespace ScreenToGif.Backend.DTOs.Encoding;

public record StartEncodingResponseDto(string JobId, bool Success, string? Error = null);
