using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.DTOs.Frame;

public record FrameEditRequestDto(
    FrameEditOperation Operation,
    List<string> FrameIds,
    FrameEditOptionsDto? Options
);

public record FrameEditOptionsDto(int? ReduceBy, int? InsertPosition);
