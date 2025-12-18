use std::sync::Mutex;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

static BACKEND_PROCESS: Mutex<Option<CommandChild>> = Mutex::new(None);

#[derive(serde::Serialize)]
pub struct BackendStatus {
    running: bool,
    port: Option<u16>,
}

#[tauri::command]
pub async fn start_backend(app: tauri::AppHandle) -> Result<BackendStatus, String> {
    // Check if already running
    {
        let process_guard = BACKEND_PROCESS.lock().map_err(|e| e.to_string())?;
        if process_guard.is_some() {
            return Ok(BackendStatus {
                running: true,
                port: Some(5001),
            });
        }
    }

    let sidecar_command = app
        .shell()
        .sidecar("screentogif-backend")
        .map_err(|e| e.to_string())?
        .args(["--port", "5001"]);

    let (mut _rx, child) = sidecar_command
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

    {
        let mut process_guard = BACKEND_PROCESS.lock().map_err(|e| e.to_string())?;
        *process_guard = Some(child);
    }

    // Give the backend time to start
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    Ok(BackendStatus {
        running: true,
        port: Some(5001),
    })
}

#[tauri::command]
pub fn stop_backend() -> Result<(), String> {
    let mut process_guard = BACKEND_PROCESS.lock().map_err(|e| e.to_string())?;

    if let Some(child) = process_guard.take() {
        child.kill().map_err(|e| format!("Failed to kill backend: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_backend_status() -> BackendStatus {
    let process_guard = BACKEND_PROCESS.lock();

    match process_guard {
        Ok(guard) => BackendStatus {
            running: guard.is_some(),
            port: if guard.is_some() { Some(5001) } else { None },
        },
        Err(_) => BackendStatus {
            running: false,
            port: None,
        },
    }
}
