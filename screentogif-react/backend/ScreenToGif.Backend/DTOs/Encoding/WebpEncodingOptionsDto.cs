namespace ScreenToGif.Backend.DTOs.Encoding;

public record WebpEncodingOptionsDto(
    int Quality,
    bool Lossless,
    int LoopCount,
    int Method
);
