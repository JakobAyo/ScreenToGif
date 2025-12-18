using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.DTOs.Encoding;

public record VideoEncodingOptionsDto(
    VideoCodec Codec,
    int Bitrate,
    int Quality,
    EncodingPreset Preset,
    string PixelFormat,
    bool AudioEnabled,
    int? AudioBitrate
);
