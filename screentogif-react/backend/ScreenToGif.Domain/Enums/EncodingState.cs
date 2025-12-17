namespace ScreenToGif.Domain.Enums;

public enum EncodingState
{
    Queued,
    Preparing,
    Encoding,
    Optimizing,
    Completed,
    Failed,
    Cancelled
}
