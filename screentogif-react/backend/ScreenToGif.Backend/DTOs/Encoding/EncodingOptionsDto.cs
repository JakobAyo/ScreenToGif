using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.DTOs.Encoding;

public record EncodingOptionsDto(
    OutputFormat Format,
    string OutputPath,
    int? Width,
    int? Height,
    double? Scale,
    int? FrameRate,
    int? TrimStart,
    int? TrimEnd,
    GifEncodingOptionsDto? Gif,
    VideoEncodingOptionsDto? Video,
    ApngEncodingOptionsDto? Apng,
    WebpEncodingOptionsDto? Webp,
    ImageSequenceOptionsDto? ImageSequence
);
