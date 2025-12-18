using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Encoding;

public interface IEncoderFactory
{
    IEncoder CreateEncoder(OutputFormat format, GifEncoderType? gifEncoder = null);
}

public class EncoderFactory : IEncoderFactory
{
    public IEncoder CreateEncoder(OutputFormat format, GifEncoderType? gifEncoder = null)
    {
        return format switch
        {
            OutputFormat.Gif => CreateGifEncoder(gifEncoder ?? GifEncoderType.ScreenToGif),
            OutputFormat.Mp4 => new Mp4Encoder(),
            OutputFormat.Webm => new WebmEncoder(),
            OutputFormat.Apng => new ApngEncoder(),
            OutputFormat.Webp => new WebpEncoder(),
            OutputFormat.Avi => new AviEncoder(),
            _ => throw new NotSupportedException($"Format {format} is not supported.")
        };
    }

    private static IEncoder CreateGifEncoder(GifEncoderType encoderType)
    {
        return encoderType switch
        {
            GifEncoderType.ScreenToGif => new GifEncoder(),
            GifEncoderType.FFmpeg => new FFmpegGifEncoder(),
            GifEncoderType.Gifski => new GifskiEncoder(),
            GifEncoderType.System => new SystemGifEncoder(),
            _ => new GifEncoder()
        };
    }
}
