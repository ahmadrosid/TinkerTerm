import { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';

import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

import useLocalStorage from "../../hooks/useLocalStorage";
import SettingIcon from "../../icons/setting";
import DialogChoice from "../dialog/dialog-choice";
import Editor from "../editor/editor";

type SetFolderFunc = (path: string) => Promise<void>;

export default function App() {
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [res, setRes] = useState<string>("");
  const [folder, setFolder] = useState<string>("/Users/ahmadrosid/bitbucket.com/splade");
  const [phpBin, writeFileContent] = useLocalStorage('config/php-bin.conf');
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [phpBinOptions, setPhpBinOptions] = useState<string[]>([]);

  async function runTinker(code?: string) {
    if (!code && !monacoEditor.current) return;
    if (!code && monacoEditor.current) {
      code = monacoEditor.current.getValue();
    }

    if (phpBin === "") {
      setRes("Please set php bin env!");
      return
    }

    try {
      setRes("");
      let res = await invoke('tinker_run', { code, path: folder }) as string;
      setRes(res);
    } catch (e) {
      setRes(e as string)
    }
  }

  const openFolderDialog = async (setData: SetFolderFunc) => {
    const appDataDirPath = await appDataDir();
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: appDataDirPath,
    });
    await setData(`${selected}`)
  }

  const updateProjectFolder = async () => {
    await openFolderDialog(async (folder) => setFolder(folder))
  }

  const openSelectEnv = async () => {
    try {
      let res = await invoke('search_php_bin', { some: "test" }) as string;
      let bins = res.split("\n");
      setPhpBinOptions(bins)
      setIsOpenDialog(true)
    } catch (e) {
      setRes(e as string)
    }
  }

  const onSubmitDialog = (option?: string) => {
    setIsOpenDialog(false)
    if (option) writeFileContent(option);
  }

  const setCurentEditor = (editor: monaco.editor.IStandaloneCodeEditor) => {
    monacoEditor.current = editor
  }

  return (
    <>
      <DialogChoice options={phpBinOptions} isOpenDialog={isOpenDialog} onSubmit={onSubmitDialog}/>
      <div className="container">
        <nav className="column-1">
          <div style={{ cursor: "pointer", padding: ".4rem" }} onClick={() => runTinker()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.5584 10.3579L6.6302 2.2335C6.32524 2.05416 5.97816 1.95892 5.62437 1.9575C5.27059 1.95609 4.92276 2.04854 4.61637 2.22544C4.30998 2.40233 4.05599 2.65733 3.88033 2.96443C3.70466 3.27152 3.6136 3.61972 3.61643 3.9735L3.68823 20.0979C3.68821 20.4505 3.78142 20.7968 3.9584 21.1018C4.13537 21.4068 4.38984 21.6595 4.69599 21.8345C5.00214 22.0094 5.3491 22.1003 5.7017 22.0979C6.0543 22.0955 6.4 22 6.70377 21.8209L20.5602 13.8209C20.8639 13.6452 21.116 13.3926 21.2912 13.0886C21.4664 12.7846 21.5586 12.4398 21.5584 12.0889C21.5582 11.738 21.4657 11.3933 21.2902 11.0895C21.1147 10.7856 20.8623 10.5333 20.5584 10.3579Z" stroke-width="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ cursor: "pointer", padding: ".4rem" }} onClick={updateProjectFolder}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
            </svg>
          </div>
          <div style={{ cursor: "pointer", paddingLeft: ".4rem", paddingRight: ".4rem" }} onClick={async () => openSelectEnv()}>
            <SettingIcon />
          </div>
        </nav>
        <div className="main">
          <Editor onInitEditor={(editor) => setCurentEditor(editor)} runCode={runTinker} />
          <div className="column-3 result-container">
            <div className="result-header">
              {!phpBin && <p>Please select your PHP binary.</p>}
              {phpBin && <p>PHP binary folder : {phpBin}</p>}
              <p>{ "Project folder : " + folder || "Please select your project folder!"}</p>
            </div>
            <p>
              <pre>{res}</pre>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
