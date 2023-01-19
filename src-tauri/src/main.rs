#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;
use std::env;

mod tinker;
mod php;

#[tauri::command]
fn tinker_run(app_handle: tauri::AppHandle, code: String, path: String) -> String {
    let mut app_dir = app_handle.path_resolver().app_cache_dir().unwrap();
    app_dir.push("config");
    app_dir.push("php-bin.conf");
    let res = tauri::api::file::read_string(app_dir);
    if res.is_err() {
        return "Please select your PHP binary!".to_string();
    }
    let path = PathBuf::from(path);
    match tinker::run(code.to_string(), path, res.unwrap()) {
        Ok(res) => res,
        Err(err) => err.to_string()
    }
}

#[tauri::command]
fn search_php_bin(some: &str) -> String {
    println!("You are serchig php bin! {}", some);
    php::search("/opt/homebrew/opt").join("\n")
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
        .invoke_handler(tauri::generate_handler![search_php_bin, tinker_run])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
