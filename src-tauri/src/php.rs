use walkdir::WalkDir;
use std::path::{Path, PathBuf};
use std::vec::Vec;

fn find_php_binaries(path: &Path, match_path: &str) -> Vec<String> {
    let mut php_binaries = vec![];
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if !path.is_file() {
            let file_name = path.to_str().unwrap();
            if file_name.contains(match_path) {
                php_binaries.push(path.to_str().unwrap().to_string());
            }
        }
    }
    return php_binaries;
}

pub fn search(path: &str) -> Vec<String> {
    let folder_path = Path::new(path);
    let binaries = find_php_binaries(folder_path, "php");
    let mut result: Vec<String> = vec![];
    for item in &binaries {
        let mut php_binaries = find_php_binaries(PathBuf::from(&item).as_path(), "bin");
        if !php_binaries.is_empty() {
            result.append(&mut php_binaries)
        }
    }

    if result.is_empty() {
        return binaries;
    }

    result
}
