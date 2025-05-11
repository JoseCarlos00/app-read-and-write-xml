import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const DEBOUNCE_DELAY = 500;

function EditorComponent({ content, onContentChange, setIsModified }) {
  const [editorContent, setEditorContent] = useState(content);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setIsModified(true);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    setDebounceTimeout(
      setTimeout(() => onContentChange(value), DEBOUNCE_DELAY),
    );
  };

  return (
    <>
      <Editor
        height="90vh"
        width="100%"
        theme="vs-dark"
        language="xml"
        value={editorContent}
        onChange={handleEditorChange}
      />
    </>
  );
}
export default EditorComponent;
