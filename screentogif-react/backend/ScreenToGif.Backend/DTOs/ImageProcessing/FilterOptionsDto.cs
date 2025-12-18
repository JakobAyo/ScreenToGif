namespace ScreenToGif.Backend.DTOs.ImageProcessing;

public record FilterOptionsDto(
    string FilterType,
    double Intensity,
    Dictionary<string, object>? Parameters
);
