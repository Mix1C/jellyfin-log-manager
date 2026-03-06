using System;
using System.IO;
using System.Net.Mime;
using System.Threading.Tasks;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Controller.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.LogManager.Api;

[ApiController]
[Route("Plugins/LogManager")]
[Produces(MediaTypeNames.Application.Json)]
public class LogManagerController : ControllerBase
{
    private readonly IApplicationPaths _appPaths;
    private readonly ILogger<LogManagerController> _logger;

    public LogManagerController(IApplicationPaths appPaths, ILogger<LogManagerController> logger)
    {
        _appPaths = appPaths;
        _logger = logger;
    }

    private string GetDbPath()
    {
        return Path.Combine(_appPaths.DataPath, "jellyfin.db");
    }

    /// <summary>
    /// Clears all entries from the ActivityLogs table.
    /// </summary>
    [HttpDelete("ClearLog")]
    [Authorize(Policy = "RequiresElevation")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ClearActivityLog()
    {
        var dbPath = GetDbPath();

        if (!System.IO.File.Exists(dbPath))
        {
            _logger.LogError("Database not found at {Path}", dbPath);
            return StatusCode(500, new { error = "Database file not found", path = dbPath });
        }

        try
        {
            var connectionString = $"Data Source={dbPath};Mode=ReadWrite;";
            await using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            await using var command = connection.CreateCommand();
            command.CommandText = "DELETE FROM ActivityLogs;";
            var rows = await command.ExecuteNonQueryAsync();

            _logger.LogInformation("Cleared {Count} activity log entries", rows);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear activity log");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Returns the path to the Jellyfin database file.
    /// </summary>
    [HttpGet("DbPath")]
    [Authorize(Policy = "RequiresElevation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<object> GetDbPathInfo() 
    {
        var dbPath = GetDbPath();
        return Ok(new { path = dbPath, exists = System.IO.File.Exists(dbPath) });
    }

    /// <summary>
    /// Returns the row count of the ActivityLogs table.
    /// </summary>
    [HttpGet("LogCount")]
    [Authorize(Policy = "RequiresElevation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> GetLogCount()
    {
        var dbPath = GetDbPath();
        try
        {
            var connectionString = $"Data Source={dbPath};Mode=ReadOnly;";
            await using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT COUNT(*) FROM ActivityLogs;";
            var count = await command.ExecuteScalarAsync();
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
