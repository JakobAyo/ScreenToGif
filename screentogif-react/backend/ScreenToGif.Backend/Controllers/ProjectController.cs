using Microsoft.AspNetCore.Mvc;
using ScreenToGif.Backend.DTOs.Project;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpPost]
    public async Task<ActionResult<ProjectResponseDto>> CreateProject([FromBody] CreateProjectRequestDto request)
    {
        var response = await _projectService.CreateProjectAsync(request);
        return response.Success ? CreatedAtAction(nameof(GetProject), new { projectId = response.ProjectId }, response) : BadRequest(response);
    }

    [HttpGet("{projectId}")]
    public async Task<ActionResult<ProjectDto>> GetProject(string projectId)
    {
        var project = await _projectService.GetProjectAsync(projectId);
        return project != null ? Ok(project) : NotFound();
    }

    [HttpPut("{projectId}")]
    public async Task<ActionResult<ProjectResponseDto>> SaveProject(string projectId)
    {
        var response = await _projectService.SaveProjectAsync(projectId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{projectId}")]
    public async Task<ActionResult<ProjectResponseDto>> DeleteProject(string projectId)
    {
        var response = await _projectService.DeleteProjectAsync(projectId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetRecentProjects([FromQuery] int count = 10)
    {
        var projects = await _projectService.GetRecentProjectsAsync(count);
        return Ok(projects);
    }
}
