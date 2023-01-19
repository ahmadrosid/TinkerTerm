import { BaseDirectory, writeTextFile, readTextFile } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";

type LocaStorageResult = [string|undefined, (env: string) => Promise<void>];

export default function useLocalStorage(filePath: string): LocaStorageResult {
    let [fileContent, setFileContent] = useState<string>();
    let dir = {
        dir: BaseDirectory.AppConfig,
    };

    const writeFileContent = async (env: string) => {
        try {
            await writeTextFile({ contents: env, path: filePath }, dir);
            setFileContent(env)
        } catch (e) {
            setFileContent(env);
        }
    };

    const updateFile = () => {
        readTextFile(filePath, dir)
            .then(text => setFileContent(text))
    }

    useEffect(() => {
        updateFile()
    }, [fileContent])

    return [fileContent, writeFileContent]
}