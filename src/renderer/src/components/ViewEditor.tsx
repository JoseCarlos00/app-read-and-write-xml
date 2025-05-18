import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const DEBOUNCE_DELAY = 500;

interface Props {
  xmlStringContent: string;
  onContentChange: (newContent: string) => void;
  tabKey: string;
}

function EditorComponent({ xmlStringContent, onContentChange, tabKey }: Props) {
  const [editorContent, setEditorContent] = useState(xmlStringContent);
  const debounceTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null> =
    useRef(null);

  // Sincronizar editorContent si la prop 'content' cambia desde el padre
  useEffect(() => {
    // Solo actualizar si el contenido de la prop es realmente diferente
    // al contenido actual del editor para evitar bucles o renders innecesarios.
    if (xmlStringContent !== editorContent) {
      setEditorContent(xmlStringContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmlStringContent]); // Este efecto se ejecuta cuando la prop 'content' cambia

  useEffect(() => {
    console.log('[EditorComponent] Render:', {
      propContent: xmlStringContent,
      stateEditorContent: editorContent,
      tabKey,
    });

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditorChange = (newValue = '') => {
    setEditorContent(newValue);

    // Limpiar el timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Configurar el nuevo timeout. Actualizar la ref no causa un re-render.
    debounceTimeoutRef.current = setTimeout(() => {
      if (editorContent !== newValue) {
        onContentChange(newValue);
      }
    }, DEBOUNCE_DELAY);
  };

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
