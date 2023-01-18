#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;

mod tinker;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn tinker_run(code: &str, path: String) -> String {
    let path = PathBuf::from(path);
    let res = tinker::run(code.to_string(), path);
    match res {
        Ok(result) => result,
        Err(err) => err.to_string(),
    }
}

fn main() {
    let debug = false;
    use tauri::Manager;
    tauri::Builder::default()
        .setup(move |app| {
            if debug {
                // only include this code on debug builds
                #[cfg(debug_assertions)] 
                {
                    let window = app.get_window("main").unwrap();
                    window.open_devtools();
                    window.close_devtools();
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![tinker_run])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
