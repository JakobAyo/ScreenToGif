using System.Collections.Concurrent;
using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.Encoding;
using ScreenToGif.Backend.Services.Interfaces;
using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Services;

public class EncodingService : IEncodingService, IDisposable
{
    private readonly IEncoderFactory _encoderFactory;
    private readonly IProjectService _projectService;
    private readonly ConcurrentDictionary<string, EncodingJobState> _jobs = new();

    public event EventHandler<EncodingProgressDto>? OnProgressUpdated;

    public EncodingService(IEncoderFactory encoderFactory, IProjectService projectService)
    {
        _encoderFactory = encoderFactory;
        _projectService = projectService;
    }

    public async Task<StartEncodingResponseDto> StartEncodingAsync(StartEncodingRequestDto request)
    {
        try
        {
            var project = await _projectService.GetProjectAsync(request.ProjectId);
            if (project == null)
            {
                return new StartEncodingResponseDto(string.Empty, false, "Project not found");
            }

            var gifEncoder = request.Options.Gif?.Encoder;
            var encoder = _encoderFactory.CreateEncoder(request.Options.Format, gifEncoder);

            await encoder.InitializeAsync(request.Options);

            var jobId = Guid.NewGuid().ToString();
            var jobState = new EncodingJobState(jobId, encoder, request);

            encoder.OnProgress += (_, progress) =>
            {
                jobState.LastProgress = progress;
                OnProgressUpdated?.Invoke(this, progress);
            };

            _jobs[jobId] = jobState;

            // Start encoding in background
            _ = RunEncodingAsync(jobState);

            return new StartEncodingResponseDto(jobId, true);
        }
        catch (Exception ex)
        {
            return new StartEncodingResponseDto(string.Empty, false, ex.Message);
        }
    }

    public Task<EncodingProgressDto?> GetProgressAsync(string jobId)
    {
        if (!_jobs.TryGetValue(jobId, out var jobState))
        {
            return Task.FromResult<EncodingProgressDto?>(null);
        }

        return Task.FromResult<EncodingProgressDto?>(jobState.LastProgress);
    }

    public Task CancelEncodingAsync(string jobId)
    {
        if (_jobs.TryGetValue(jobId, out var jobState))
        {
            jobState.CancellationSource.Cancel();
        }

        return Task.CompletedTask;
    }

    private async Task RunEncodingAsync(EncodingJobState jobState)
    {
        try
        {
            // TODO: Get frames from project and encode them
            // For now, simulate encoding with placeholder frames
            var totalFrames = 100;

            for (int i = 0; i < totalFrames; i++)
            {
                if (jobState.CancellationSource.Token.IsCancellationRequested)
                {
                    break;
                }

                // Simulate frame processing
                await Task.Delay(50, jobState.CancellationSource.Token);

                var progress = new EncodingProgressDto(
                    JobId: jobState.JobId,
                    State: EncodingState.Encoding,
                    Progress: (double)i / totalFrames * 100,
                    CurrentFrame: i,
                    TotalFrames: totalFrames,
                    Stage: $"Encoding frame {i + 1} of {totalFrames}",
                    EstimatedTimeRemaining: null,
                    OutputFileSize: null,
                    Error: null,
                    StartedAt: jobState.StartedAt,
                    CompletedAt: null
                );

                jobState.LastProgress = progress;
                OnProgressUpdated?.Invoke(this, progress);
            }

            // Finalize encoding
            var result = await jobState.Encoder.FinalizeAsync();

            var completeProgress = new EncodingProgressDto(
                JobId: jobState.JobId,
                State: result.Success ? EncodingState.Completed : EncodingState.Failed,
                Progress: 100,
                CurrentFrame: totalFrames,
                TotalFrames: totalFrames,
                Stage: result.Success ? "Complete" : "Failed",
                EstimatedTimeRemaining: 0,
                OutputFileSize: result.FileSize,
                Error: result.Error,
                StartedAt: jobState.StartedAt,
                CompletedAt: DateTime.UtcNow
            );

            jobState.LastProgress = completeProgress;
            OnProgressUpdated?.Invoke(this, completeProgress);
        }
        catch (OperationCanceledException)
        {
            var cancelledProgress = new EncodingProgressDto(
                JobId: jobState.JobId,
                State: EncodingState.Cancelled,
                Progress: 0,
                CurrentFrame: 0,
                TotalFrames: 0,
                Stage: "Cancelled",
                EstimatedTimeRemaining: null,
                OutputFileSize: null,
                Error: null,
                StartedAt: jobState.StartedAt,
                CompletedAt: DateTime.UtcNow
            );

            jobState.LastProgress = cancelledProgress;
            OnProgressUpdated?.Invoke(this, cancelledProgress);
        }
        catch (Exception ex)
        {
            var errorProgress = new EncodingProgressDto(
                JobId: jobState.JobId,
                State: EncodingState.Failed,
                Progress: 0,
                CurrentFrame: 0,
                TotalFrames: 0,
                Stage: "Error",
                EstimatedTimeRemaining: null,
                OutputFileSize: null,
                Error: ex.Message,
                StartedAt: jobState.StartedAt,
                CompletedAt: DateTime.UtcNow
            );

            jobState.LastProgress = errorProgress;
            OnProgressUpdated?.Invoke(this, errorProgress);
        }
        finally
        {
            jobState.Encoder.Dispose();
        }
    }

    public void Dispose()
    {
        foreach (var job in _jobs.Values)
        {
            job.CancellationSource.Cancel();
            job.Encoder.Dispose();
        }

        _jobs.Clear();
        GC.SuppressFinalize(this);
    }

    private class EncodingJobState
    {
        public string JobId { get; }
        public IEncoder Encoder { get; }
        public StartEncodingRequestDto Request { get; }
        public DateTime StartedAt { get; }
        public CancellationTokenSource CancellationSource { get; } = new();
        public EncodingProgressDto? LastProgress { get; set; }

        public EncodingJobState(string jobId, IEncoder encoder, StartEncodingRequestDto request)
        {
            JobId = jobId;
            Encoder = encoder;
            Request = request;
            StartedAt = DateTime.UtcNow;
        }
    }
}
