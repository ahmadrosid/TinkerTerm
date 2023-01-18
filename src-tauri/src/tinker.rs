use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

pub fn run(code: String, path: PathBuf) -> String {
    let mut child = Command::new("php")
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .current_dir(path)
        .arg("artisan")
        .arg("tinker")
        .spawn()
        .expect("Failed to spawn child process");

    let mut stdin = child.stdin.take().expect("Failed to open stdin");
    std::thread::spawn(move || {
        stdin
            .write_all(code.as_bytes())
            .expect("Failed to write to stdin");
    });

    let output = child.wait_with_output().expect("Failed to read stdout");
    String::from_utf8_lossy(&output.stdout).to_string()
}
