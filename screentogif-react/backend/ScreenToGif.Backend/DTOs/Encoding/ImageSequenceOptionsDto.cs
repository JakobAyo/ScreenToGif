namespace ScreenToGif.Backend.DTOs.Encoding;

public record ImageSequenceOptionsDto(
    string Format,
    int Quality,
    string NamePattern,
    bool IncludeTimestamp,
    bool ZipOutput
);
