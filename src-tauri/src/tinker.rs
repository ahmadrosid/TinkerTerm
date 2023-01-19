use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

pub fn run(code: String, path: PathBuf, env: &str) -> Result<String, Box<dyn std::error::Error>> {
    let command = Command::new("php")
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .current_dir(path.clone())
        .arg("artisan")
        .arg("tinker")
        .env("PATH", env)
        .spawn();

    if let Err(err) = command {
        return Ok(format!("Failed to init php command!\nError: {}\n{:?}", err.to_string(), path.to_str()));
    }

    let mut child = command.unwrap();

    let mut stdin = child.stdin.take().unwrap();
    std::thread::spawn(move || {
        stdin
            .write_all(code.as_bytes())
            .expect("Failed to write to stdin");
    });

    let output = child.wait_with_output()?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
