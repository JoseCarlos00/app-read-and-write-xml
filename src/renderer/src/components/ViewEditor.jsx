import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

import { useTabManagerStore } from '../store/viewStore';

const DEBOUNCE_DELAY = 500;

function EditorComponent({ content, onContentChange, setIsModified, tabKey }) {
  const [editorContent, setEditorContent] = useState(content);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const setFilesModified = useTabManagerStore(
    (state) => state.setFilesModified,
  );
  const setModifiedTabState = useTabManagerStore(
    (state) => state.setModifiedTabState,
  );

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

  const handleModifiedChange = (content) => {
    setFilesModified(true);
    setModifiedTabState(tabKey, { isModified: true });
    onContentChange(content);
  };

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setIsModified(true);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    setDebounceTimeout(
      setTimeout(() => handleModifiedChange(value), DEBOUNCE_DELAY),
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
