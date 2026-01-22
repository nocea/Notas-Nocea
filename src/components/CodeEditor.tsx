
import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export default function CodeEditor({ value, onChange, language = 'markdown' }: CodeEditorProps) {
  
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Configure editor settings here if needed
    // e.g. minmap, wordWrap, etc.
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={language}
      defaultValue={value}
      value={value}
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        wordWrap: 'on',
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
