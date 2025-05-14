import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const DEBOUNCE_DELAY = 500;

function EditorComponent({ content, onContentChange, tabKey }) {
  const [editorContent, setEditorContent] = useState(content);
  const debounceTimeoutRef = useRef(null);

  // Sincronizar editorContent si la prop 'content' cambia desde el padre
  useEffect(() => {
    // Solo actualizar si el contenido de la prop es realmente diferente
    // al contenido actual del editor para evitar bucles o renders innecesarios.
    if (content !== editorContent) {
      setEditorContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]); // Este efecto se ejecuta cuando la prop 'content' cambia

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleEditorChange = (newValue) => {
    setEditorContent(newValue);

    // Limpiar el timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Configurar el nuevo timeout. Actualizar la ref no causa un re-render.
    debounceTimeoutRef.current = setTimeout(() => {
      onContentChange(newValue);
    }, DEBOUNCE_DELAY);
  };

  console.log('[EditorComponent] Render:', {
    propContent: content,
    stateEditorContent: editorContent,
    tabKey,
  });

  return (
    <>
      <Editor
        height="90vh"
        width="100%"
        theme="vs-dark"
        language="xml"
        value={editorContent || ''}
        onChange={handleEditorChange}
      />
    </>
  );
}

export default EditorComponent;
