using System.Diagnostics;
using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Encoding;

/// <summary>
/// MP4 video encoder using FFmpeg as the backend.
/// </summary>
public class Mp4Encoder : BaseEncoder
{
    public override string Name => "FFmpeg MP4";
    public override bool IsAvailable => CheckFfmpegAvailable();

    private string? _tempDirectory;
    private string? _concatFilePath;
    private VideoEncodingOptionsDto? _videoOptions;
    private readonly List<string> _framePaths = new();

    public override async Task InitializeAsync(EncodingOptionsDto options)
    {
        await base.InitializeAsync(options);

        _videoOptions = options.Video;
        _tempDirectory = Path.Combine(Path.GetTempPath(), $"stg_encode_{JobId}");
        Directory.CreateDirectory(_tempDirectory);
        _concatFilePath = Path.Combine(_tempDirectory, "concat.txt");
    }

    public override async Task AddFrameAsync(FrameDto frame, byte[] imageData)
    {
        if (_tempDirectory == null)
            throw new InvalidOperationException("Encoder not initialized");

        // Save frame to temp directory
        var framePath = Path.Combine(_tempDirectory, $"frame_{ProcessedFrames:D6}.png");
        await File.WriteAllBytesAsync(framePath, imageData);
        _framePaths.Add(framePath);

        ProcessedFrames++;
        ReportProgress(EncodingState.Encoding, $"Processing frame {ProcessedFrames}");
    }

    public override async Task<EncodingCompleteResponseDto> FinalizeAsync()
    {
        if (_tempDirectory == null || _concatFilePath == null)
            throw new InvalidOperationException("Encoder not initialized");

        ReportProgress(EncodingState.Encoding, "Building video...");

        try
        {
            // Create concat file for FFmpeg
            await CreateConcatFileAsync();

            // Run FFmpeg
            var success = await RunFfmpegAsync();

            if (!success)
            {
                return new EncodingCompleteResponseDto(
                    JobId: JobId,
                    OutputPath: OutputPath,
                    FileSize: 0,
                    Duration: (long)(DateTime.UtcNow - StartTime).TotalMilliseconds,
                    Success: false,
                    Error: "FFmpeg encoding failed"
                );
            }

            var fileSize = File.Exists(OutputPath) ? new FileInfo(OutputPath).Length : 0;
            var duration = (long)(DateTime.UtcNow - StartTime).TotalMilliseconds;

            ReportProgress(EncodingState.Completed, "Encoding complete");

            return new EncodingCompleteResponseDto(
                JobId: JobId,
                OutputPath: OutputPath,
                FileSize: fileSize,
                Duration: duration,
                Success: true,
                Error: null
            );
        }
        finally
        {
            // Cleanup temp files
            CleanupTempFiles();
        }
    }

    private async Task CreateConcatFileAsync()
    {
        if (_concatFilePath == null) return;

        var lines = new List<string>();
        foreach (var framePath in _framePaths)
        {
            lines.Add($"file '{framePath}'");
            lines.Add($"duration {Options?.FrameRate ?? 30}");
        }

        await File.WriteAllLinesAsync(_concatFilePath, lines);
    }

    private async Task<bool> RunFfmpegAsync()
    {
        var codec = _videoOptions?.Codec switch
        {
            VideoCodec.H264 => "libx264",
            VideoCodec.H265 => "libx265",
            VideoCodec.Vp8 => "libvpx",
            VideoCodec.Vp9 => "libvpx-vp9",
            VideoCodec.Av1 => "libaom-av1",
            _ => "libx264"
        };

        var preset = _videoOptions?.Preset.ToString().ToLower() ?? "medium";
        var crf = _videoOptions?.Quality ?? 23;
        var pixelFormat = _videoOptions?.PixelFormat ?? "yuv420p";

        var arguments = $"-y -f concat -safe 0 -i \"{_concatFilePath}\" " +
                       $"-c:v {codec} -preset {preset} -crf {crf} " +
                       $"-pix_fmt {pixelFormat} \"{OutputPath}\"";

        var startInfo = new ProcessStartInfo
        {
            FileName = "ffmpeg",
            Arguments = arguments,
            UseShellExecute = false,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        try
        {
            using var process = Process.Start(startInfo);
            if (process == null) return false;

            // Read stderr for progress
            while (!process.StandardError.EndOfStream)
            {
                var line = await process.StandardError.ReadLineAsync();
                ParseFfmpegProgress(line);
            }

            await process.WaitForExitAsync();
            return process.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }

    private void ParseFfmpegProgress(string? line)
    {
        if (string.IsNullOrEmpty(line)) return;

        // Parse FFmpeg output for frame progress
        // Example: frame=  100 fps=30 q=28.0 size=    1024kB time=00:00:03.33 bitrate=2516.8kbits/s
        if (line.StartsWith("frame="))
        {
            var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length > 1 && int.TryParse(parts[0].Replace("frame=", ""), out var frame))
            {
                ReportProgress(EncodingState.Encoding, $"Encoding frame {frame}", frame);
            }
        }
    }

    private void CleanupTempFiles()
    {
        if (_tempDirectory != null && Directory.Exists(_tempDirectory))
        {
            try
            {
                Directory.Delete(_tempDirectory, true);
            }
            catch
            {
                // Ignore cleanup errors
            }
        }
    }

    private static bool CheckFfmpegAvailable()
    {
        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg",
                Arguments = "-version",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(startInfo);
            process?.WaitForExit(1000);
            return process?.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }

    public override void Dispose()
    {
        CleanupTempFiles();
        base.Dispose();
    }
}
