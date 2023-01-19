import { BaseDirectory, writeTextFile, readTextFile, createDir, exists } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";

type LocaStorageResult = [string|undefined, (env: string) => Promise<void>];

export default function useLocalStorage(filePath: string): LocaStorageResult {
    let [fileContent, setFileContent] = useState<string>();
    let dir = {
        dir: BaseDirectory.AppCache,
    };

    const writeFileContent = async (env: string) => {
        try {
            await writeTextFile({ contents: env, path: filePath }, dir);
            setFileContent(env)
        } catch (e) {
            setFileContent(e as string);
        }
    };

    const createFolder = async () => {
        let exist = await exists('config', dir)
        if (!exist) {
            await createDir('config', {...dir, recursive: true});
        }
    }

    const updateFile = () => {
        readTextFile(filePath, dir)
            .then(text => setFileContent(text))
    }

    useEffect(() => {
        updateFile()
        createFolder().then().catch(err => setFileContent(err as string));
    }, [fileContent])

    return [fileContent, writeFileContent]
}