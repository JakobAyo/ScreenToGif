using ScreenToGif.Backend.DTOs.Project;

namespace ScreenToGif.Backend.Services.Interfaces;

public interface IProjectService
{
    Task<ProjectResponseDto> CreateProjectAsync(CreateProjectRequestDto request);
    Task<ProjectDto?> GetProjectAsync(string projectId);
    Task<ProjectResponseDto> SaveProjectAsync(string projectId);
    Task<ProjectResponseDto> DeleteProjectAsync(string projectId);
    Task<IEnumerable<ProjectDto>> GetRecentProjectsAsync(int count = 10);
}
