import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "./ThemeContext";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  onEditorMount?: (editor: any, monaco: any) => void;
}

export default function CodeEditor({
  value,
  onChange,
  language = "markdown",
  onEditorMount,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    if (onEditorMount) {
      onEditorMount(editor, monaco);
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={language}
      defaultValue={value}
      value={value}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
