using System.Collections.Concurrent;
using System.Text.Json;
using ScreenToGif.Backend.DTOs.Project;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Services;

public class ProjectService : IProjectService
{
    private readonly ConcurrentDictionary<string, ProjectDto> _projects = new();
    private readonly string _projectsDirectory;

    public ProjectService()
    {
        _projectsDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ScreenToGif",
            "Projects"
        );

        Directory.CreateDirectory(_projectsDirectory);
    }

    public Task<ProjectResponseDto> CreateProjectAsync(CreateProjectRequestDto request)
    {
        var projectId = Guid.NewGuid().ToString();
        var projectPath = Path.Combine(_projectsDirectory, projectId);

        Directory.CreateDirectory(projectPath);
        Directory.CreateDirectory(Path.Combine(projectPath, "frames"));

        var project = new ProjectDto(
            Id: projectId,
            Name: request.Name,
            Path: projectPath,
            Width: request.Width,
            Height: request.Height,
            Dpi: request.Dpi,
            FrameCount: 0,
            TotalDuration: 0,
            CreatedAt: DateTime.UtcNow,
            ModifiedAt: DateTime.UtcNow
        );

        _projects[projectId] = project;

        // Save project metadata
        SaveProjectMetadata(project);

        return Task.FromResult(new ProjectResponseDto(projectId, true));
    }

    public Task<ProjectDto?> GetProjectAsync(string projectId)
    {
        if (_projects.TryGetValue(projectId, out var project))
        {
            return Task.FromResult<ProjectDto?>(project);
        }

        // Try to load from disk
        var projectPath = Path.Combine(_projectsDirectory, projectId);
        var metadataPath = Path.Combine(projectPath, "project.json");

        if (File.Exists(metadataPath))
        {
            var json = File.ReadAllText(metadataPath);
            project = JsonSerializer.Deserialize<ProjectDto>(json);
            if (project != null)
            {
                _projects[projectId] = project;
                return Task.FromResult<ProjectDto?>(project);
            }
        }

        return Task.FromResult<ProjectDto?>(null);
    }

    public Task<ProjectResponseDto> SaveProjectAsync(string projectId)
    {
        if (!_projects.TryGetValue(projectId, out var project))
        {
            return Task.FromResult(new ProjectResponseDto(projectId, false, "Project not found"));
        }

        var updatedProject = project with { ModifiedAt = DateTime.UtcNow };
        _projects[projectId] = updatedProject;

        SaveProjectMetadata(updatedProject);

        return Task.FromResult(new ProjectResponseDto(projectId, true));
    }

    public Task<ProjectResponseDto> DeleteProjectAsync(string projectId)
    {
        if (!_projects.TryRemove(projectId, out var project))
        {
            return Task.FromResult(new ProjectResponseDto(projectId, false, "Project not found"));
        }

        // Delete project directory
        if (Directory.Exists(project.Path))
        {
            try
            {
                Directory.Delete(project.Path, true);
            }
            catch
            {
                // Log error but continue
            }
        }

        return Task.FromResult(new ProjectResponseDto(projectId, true));
    }

    public Task<IEnumerable<ProjectDto>> GetRecentProjectsAsync(int count = 10)
    {
        var projects = _projects.Values
            .OrderByDescending(p => p.ModifiedAt)
            .Take(count);

        return Task.FromResult(projects);
    }

    private void SaveProjectMetadata(ProjectDto project)
    {
        var metadataPath = Path.Combine(project.Path, "project.json");
        var json = JsonSerializer.Serialize(project, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(metadataPath, json);
    }
}
