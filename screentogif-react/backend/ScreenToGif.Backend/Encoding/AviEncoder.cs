using System.Diagnostics;
using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Encoding;

/// <summary>
/// AVI video encoder using FFmpeg.
/// </summary>
public class AviEncoder : BaseEncoder
{
    public override string Name => "FFmpeg AVI";
    public override bool IsAvailable => CheckFfmpegAvailable();

    private string? _tempDirectory;
    private readonly List<string> _framePaths = new();

    public override async Task InitializeAsync(EncodingOptionsDto options)
    {
        await base.InitializeAsync(options);
        _tempDirectory = Path.Combine(Path.GetTempPath(), $"stg_avi_{JobId}");
        Directory.CreateDirectory(_tempDirectory);
    }

    public override async Task AddFrameAsync(FrameDto frame, byte[] imageData)
    {
        if (_tempDirectory == null)
            throw new InvalidOperationException("Encoder not initialized");

        var framePath = Path.Combine(_tempDirectory, $"frame_{ProcessedFrames:D6}.png");
        await File.WriteAllBytesAsync(framePath, imageData);
        _framePaths.Add(framePath);

        ProcessedFrames++;
        ReportProgress(EncodingState.Encoding, $"Processing frame {ProcessedFrames}");
    }

    public override async Task<EncodingCompleteResponseDto> FinalizeAsync()
    {
        if (_tempDirectory == null)
            throw new InvalidOperationException("Encoder not initialized");

        try
        {
            var inputPattern = Path.Combine(_tempDirectory, "frame_%06d.png");
            var success = await RunFfmpegAsync($"-i \"{inputPattern}\" -c:v mpeg4 -q:v 5 -y \"{OutputPath}\"");

            var fileSize = File.Exists(OutputPath) ? new FileInfo(OutputPath).Length : 0;
            var duration = (long)(DateTime.UtcNow - StartTime).TotalMilliseconds;

            ReportProgress(EncodingState.Completed, "Encoding complete");

            return new EncodingCompleteResponseDto(JobId, OutputPath, fileSize, duration, success);
        }
        finally
        {
            CleanupTempFiles();
        }
    }

    private async Task<bool> RunFfmpegAsync(string arguments)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "ffmpeg",
            Arguments = arguments,
            UseShellExecute = false,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        using var process = Process.Start(startInfo);
        if (process == null) return false;

        await process.WaitForExitAsync();
        return process.ExitCode == 0;
    }

    private void CleanupTempFiles()
    {
        if (_tempDirectory != null && Directory.Exists(_tempDirectory))
        {
            try { Directory.Delete(_tempDirectory, true); } catch { }
        }
    }

    private static bool CheckFfmpegAvailable()
    {
        try
        {
            using var process = Process.Start(new ProcessStartInfo
            {
                FileName = "ffmpeg", Arguments = "-version",
                UseShellExecute = false, RedirectStandardOutput = true, CreateNoWindow = true
            });
            process?.WaitForExit(1000);
            return process?.ExitCode == 0;
        }
        catch { return false; }
    }

    public override void Dispose()
    {
        CleanupTempFiles();
        base.Dispose();
    }
}
