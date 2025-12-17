using System.Collections.Concurrent;
using ScreenToGif.Backend.Capture;
using ScreenToGif.Backend.DTOs.Capture;
using ScreenToGif.Backend.Services.Interfaces;
using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Services;

public class CaptureService : ICaptureService, IDisposable
{
    private readonly ICaptureStrategyFactory _strategyFactory;
    private readonly ConcurrentDictionary<string, CaptureSessionState> _sessions = new();

    public CaptureService(ICaptureStrategyFactory strategyFactory)
    {
        _strategyFactory = strategyFactory;
    }

    public Task<IEnumerable<DisplayInfoDto>> GetDisplaysAsync()
    {
        using var strategy = _strategyFactory.CreateStrategy();
        var displays = strategy.GetDisplays().ToList();
        return Task.FromResult<IEnumerable<DisplayInfoDto>>(displays);
    }

    public Task<IEnumerable<WindowInfoDto>> GetWindowsAsync()
    {
        using var strategy = _strategyFactory.CreateStrategy();
        var windows = strategy.GetWindows().ToList();
        return Task.FromResult<IEnumerable<WindowInfoDto>>(windows);
    }

    public async Task<StartCaptureResponseDto> StartCaptureAsync(CaptureOptionsDto options)
    {
        var sessionId = Guid.NewGuid().ToString();

        try
        {
            var strategy = _strategyFactory.CreateStrategy();
            await strategy.InitializeAsync(options);

            var sessionState = new CaptureSessionState(sessionId, strategy, options);
            _sessions[sessionId] = sessionState;

            // Start capture loop in background
            _ = RunCaptureLoopAsync(sessionState);

            return new StartCaptureResponseDto(sessionId, true);
        }
        catch (Exception ex)
        {
            return new StartCaptureResponseDto(sessionId, false, ex.Message);
        }
    }

    public async Task<StopCaptureResponseDto> StopCaptureAsync(string sessionId)
    {
        if (!_sessions.TryRemove(sessionId, out var sessionState))
        {
            return new StopCaptureResponseDto(sessionId, 0, 0, false, "Session not found");
        }

        sessionState.CancellationSource.Cancel();
        await sessionState.Strategy.StopAsync();

        var duration = (long)(DateTime.UtcNow - sessionState.StartedAt).TotalMilliseconds;

        sessionState.Strategy.Dispose();

        return new StopCaptureResponseDto(sessionId, sessionState.FrameCount, duration, true);
    }

    public Task<CaptureSessionDto?> GetSessionAsync(string sessionId)
    {
        if (!_sessions.TryGetValue(sessionId, out var sessionState))
        {
            return Task.FromResult<CaptureSessionDto?>(null);
        }

        var duration = (long)(DateTime.UtcNow - sessionState.StartedAt).TotalMilliseconds;

        var dto = new CaptureSessionDto(
            Id: sessionId,
            State: sessionState.State,
            Options: sessionState.Options,
            StartedAt: sessionState.StartedAt,
            FrameCount: sessionState.FrameCount,
            Duration: duration,
            LastFrameTimestamp: sessionState.LastFrameTimestamp
        );

        return Task.FromResult<CaptureSessionDto?>(dto);
    }

    public Task PauseCaptureAsync(string sessionId)
    {
        if (_sessions.TryGetValue(sessionId, out var sessionState))
        {
            sessionState.State = CaptureState.Paused;
        }

        return Task.CompletedTask;
    }

    public Task ResumeCaptureAsync(string sessionId)
    {
        if (_sessions.TryGetValue(sessionId, out var sessionState))
        {
            sessionState.State = CaptureState.Recording;
        }

        return Task.CompletedTask;
    }

    private async Task RunCaptureLoopAsync(CaptureSessionState sessionState)
    {
        sessionState.State = CaptureState.Recording;
        var frameDelay = sessionState.Options.FrameRate > 0
            ? TimeSpan.FromMilliseconds(1000.0 / sessionState.Options.FrameRate)
            : TimeSpan.FromMilliseconds(33);

        while (!sessionState.CancellationSource.Token.IsCancellationRequested)
        {
            if (sessionState.State == CaptureState.Paused)
            {
                await Task.Delay(100, sessionState.CancellationSource.Token);
                continue;
            }

            try
            {
                var frame = sessionState.Options.CaptureMouseCursor
                    ? await sessionState.Strategy.CaptureFrameWithCursorAsync(sessionState.FrameCount)
                    : await sessionState.Strategy.CaptureFrameAsync(sessionState.FrameCount);

                if (frame != null)
                {
                    sessionState.Frames.Add(frame);
                    sessionState.FrameCount++;
                    sessionState.LastFrameTimestamp = DateTime.UtcNow;
                }

                // Check limits
                if (sessionState.Options.MaxFrames.HasValue &&
                    sessionState.FrameCount >= sessionState.Options.MaxFrames.Value)
                {
                    break;
                }

                var duration = (DateTime.UtcNow - sessionState.StartedAt).TotalSeconds;
                if (sessionState.Options.MaxDuration.HasValue &&
                    duration >= sessionState.Options.MaxDuration.Value)
                {
                    break;
                }

                await Task.Delay(frameDelay, sessionState.CancellationSource.Token);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch
            {
                // Log error and continue
            }
        }

        sessionState.State = CaptureState.Stopping;
    }

    public void Dispose()
    {
        foreach (var session in _sessions.Values)
        {
            session.CancellationSource.Cancel();
            session.Strategy.Dispose();
        }

        _sessions.Clear();
        GC.SuppressFinalize(this);
    }

    private class CaptureSessionState
    {
        public string SessionId { get; }
        public ICaptureStrategy Strategy { get; }
        public CaptureOptionsDto Options { get; }
        public CaptureState State { get; set; }
        public DateTime StartedAt { get; }
        public DateTime? LastFrameTimestamp { get; set; }
        public int FrameCount { get; set; }
        public CancellationTokenSource CancellationSource { get; } = new();
        public List<DTOs.Frame.FrameDto> Frames { get; } = new();

        public CaptureSessionState(string sessionId, ICaptureStrategy strategy, CaptureOptionsDto options)
        {
            SessionId = sessionId;
            Strategy = strategy;
            Options = options;
            State = CaptureState.Starting;
            StartedAt = DateTime.UtcNow;
        }
    }
}
