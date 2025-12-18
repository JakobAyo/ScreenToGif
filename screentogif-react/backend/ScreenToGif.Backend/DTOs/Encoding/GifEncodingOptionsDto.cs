using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.DTOs.Encoding;

public record GifEncodingOptionsDto(
    GifEncoderType Encoder,
    int ColorCount,
    QuantizationMethod Quantization,
    DitheringAlgorithm Dithering,
    int Quality,
    int LoopCount,
    bool EnableTransparency,
    string? TransparencyColor,
    bool DetectUnchangedPixels,
    bool PaintTransparent
);
