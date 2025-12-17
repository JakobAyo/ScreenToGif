namespace ScreenToGif.Backend.DTOs.Encoding;

public record ApngEncodingOptionsDto(
    int ColorDepth,
    int CompressionLevel,
    int LoopCount,
    bool EnableTransparency,
    bool DetectUnchangedPixels
);
