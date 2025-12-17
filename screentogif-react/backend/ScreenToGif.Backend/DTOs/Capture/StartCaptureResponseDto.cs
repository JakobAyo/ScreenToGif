namespace ScreenToGif.Backend.DTOs.Capture;

public record StartCaptureResponseDto(string SessionId, bool Success, string? Error = null);
