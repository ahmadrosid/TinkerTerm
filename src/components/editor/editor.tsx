import { useEffect, useRef, useState } from "react";
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import { KeyCode, KeyMod } from "monaco-editor";

loader.config({ monaco });

import nordTheme from "../../utils/nord";
import phpTokenizer from "../../utils/php-tokenizer";

export default function Editor({
  runCode,
  onInitEditor,
}: {
  runCode: (code?: string) => void;
  onInitEditor: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}) {
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (monacoEditor.current !== null) return;

    loader.init().then((monaco) => {
      const wrapper = document.getElementById("editor");
      if (wrapper && monacoEditor.current === null) {
        const executeAction: monaco.editor.IActionDescriptor = {
          id: "run-code",
          label: "Run Code",
          contextMenuOrder: 0,
          contextMenuGroupId: "navigation",
          keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
          run: () => runCode(monacoEditor.current?.getValue()),
        };

        wrapper.style.minHeight = "800px";
        monaco.editor.defineTheme(
          "nord",
          nordTheme as monaco.editor.IStandaloneThemeData
        );
        monaco.editor.addEditorAction(executeAction);
        monaco.languages.register({ id: "php" });
        monaco.languages.setMonarchTokensProvider(
          "php",
          phpTokenizer as monaco.languages.IMonarchLanguage
        );

        const properties: monaco.editor.IStandaloneEditorConstructionOptions = {
          language: "php",
          minimap: {
            enabled: false,
          },
          renderLineHighlight: "none",
          automaticLayout: true,
          theme: "nord",
        };

        const editor = monaco.editor.create(wrapper, properties);
        monacoEditor.current = editor;
        onInitEditor(editor)
      }
    });
  }, [monacoEditor]);

  return <div id="editor"></div>;
}
