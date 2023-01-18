import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';

import "./App.css";

function App() {
  const [res, setRes] = useState<string>("");
  const [folder, setFolder] = useState<string>("");
  const [name, setName] = useState<string>("");

  async function runTinker() {
    let res = await invoke('tinker_run', { code: name, path: folder })
    setRes(res as string);
  }

  const handleOnClick = async (e: any) => {
    const appDataDirPath = await appDataDir();
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: appDataDirPath,
    });
    setFolder(`${selected}`)
  }

  return (
    <div className="container">
      <h1>TinkerTerm</h1>

      <p>Execute php code!</p>

      <div className="row">
        <div>
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Type php code..."
          />
          <button type="button" onClick={async() => await runTinker()}>
            Execute Code
          </button>
          <button onClick={handleOnClick}>Select folder</button>
        </div>
      </div>
      <p>Project folder: {folder}</p>
      <pre>{res}</pre>
    </div>
  );
}

export default App;
