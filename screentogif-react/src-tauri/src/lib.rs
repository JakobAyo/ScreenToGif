mod commands;

use commands::{sidecar, window};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            window::minimize_window,
            window::maximize_window,
            window::close_window,
            window::set_window_title,
            sidecar::start_backend,
            sidecar::stop_backend,
            sidecar::get_backend_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
