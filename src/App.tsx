import { useLayoutEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';

import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';
import { KeyCode, KeyMod } from "monaco-editor"

loader.config({ monaco });

import "./App.css";
import nordTheme from "./nord";
import phpTokenizer from "./php-tokenizer";

function App() {
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [res, setRes] = useState<string>("");
  const [folder, setFolder] = useState<string>("/Users/ahmadrosid/bitbucket.com/splade");

  async function runTinker() {
    setRes("");
    let res = await invoke('tinker_run', { code: monacoEditor.current?.getValue(), path: folder })
    setRes(res as string);
  }

  const handleOnClick = async () => {
    const appDataDirPath = await appDataDir();
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: appDataDirPath,
    });
    setFolder(`${selected}`)
  }

  const executeAction: monaco.editor.IActionDescriptor = {
    id: "run-code",
    label: "Run Code",
    contextMenuOrder: 0,
    contextMenuGroupId: "navigation",
    keybindings: [
      KeyMod.CtrlCmd | KeyCode.Enter,
    ],
    run: runTinker,
  }

  useLayoutEffect(() => {
    if (monacoEditor.current !== null) return;

    loader.init().then(monaco => {
      const wrapper = document.getElementById("editor");
      if (wrapper && monacoEditor.current === null) {
        wrapper.style.minHeight = "800px";
        monaco.editor.defineTheme("nord", nordTheme as monaco.editor.IStandaloneThemeData);
        monaco.editor.addEditorAction(executeAction)
        monaco.languages.register({ id: 'php' })
        monaco.languages.setMonarchTokensProvider('php', phpTokenizer as monaco.languages.IMonarchLanguage);

        const properties: monaco.editor.IStandaloneEditorConstructionOptions = {
          language: "php",
          minimap: {
            enabled: false
          },
          renderLineHighlight: 'none',
          automaticLayout: true,
          theme: "nord"
        }

        const editor = monaco.editor.create(wrapper, properties);
        monacoEditor.current = editor;
      }
    });
  }, [])

  return (
    <div className="container">
      <nav className="column-1">
        <div style={{ cursor: "pointer", padding: ".4rem" }} onClick={runTinker}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.5584 10.3579L6.6302 2.2335C6.32524 2.05416 5.97816 1.95892 5.62437 1.9575C5.27059 1.95609 4.92276 2.04854 4.61637 2.22544C4.30998 2.40233 4.05599 2.65733 3.88033 2.96443C3.70466 3.27152 3.6136 3.61972 3.61643 3.9735L3.68823 20.0979C3.68821 20.4505 3.78142 20.7968 3.9584 21.1018C4.13537 21.4068 4.38984 21.6595 4.69599 21.8345C5.00214 22.0094 5.3491 22.1003 5.7017 22.0979C6.0543 22.0955 6.4 22 6.70377 21.8209L20.5602 13.8209C20.8639 13.6452 21.116 13.3926 21.2912 13.0886C21.4664 12.7846 21.5586 12.4398 21.5584 12.0889C21.5582 11.738 21.4657 11.3933 21.2902 11.0895C21.1147 10.7856 20.8623 10.5333 20.5584 10.3579Z" stroke-width="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ cursor: "pointer", padding: ".4rem" }} onClick={async () => await handleOnClick()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
          </svg>
        </div>
      </nav>
      <div className="main">
        <div id="editor"></div>
        <div className="column-3" style={{ paddingLeft: "1em", overflow: "auto" }}>
          <p>{folder || "Please select input folder!"}</p>
          <pre>{res}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
