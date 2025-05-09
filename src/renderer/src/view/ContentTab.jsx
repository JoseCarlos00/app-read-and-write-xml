import { useState, useEffect } from 'react';

import useAppStore from './store'; // Importa tu store de Zustand
import EditorComponent from './Editor';

const ContentTab = ({ content, tabKey }) => {
  const [localContent, setLocalContent] = useState(content);
  const editorView = useAppStore((state) => state.editorView);
  const setFilesModified = useAppStore((state) => state.setFilesModified);
  const setTabState = useAppStore((state) => state.setTabState);
  const tabSpecificState = useAppStore(
    (state) => state.tabStates[tabKey] || {},
  );

  const handleContentChange = (newContent) => {
    setLocalContent(newContent);
    setFilesModified(true); // Marca que hay archivos modificados
    setTabState(tabKey, { isModified: true, content: newContent }); // Guarda el estado específico de la pestaña
  };

  useEffect(() => {
    // Aquí podrías reaccionar a cambios en el estado global de la vista (editorView)
    console.log(`Vista actual: ${editorView}`);
    // También podrías cargar el estado específico de la pestaña si existe
    if (tabSpecificState.content) {
      setLocalContent(tabSpecificState.content);
    }
  }, [editorView, tabKey, tabSpecificState.content]);

  return (
    <div className="content-tab">
      <h2>Contenido de la Tab {tabKey}</h2>
      {editorView === 'text' && (
        <textarea
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
        />
      )}
      {editorView === 'tree' && (
        <div> {/* Lógica para mostrar el contenido como un árbol */} </div>
      )}
      {editorView === 'form' && (
        <div> {/* Lógica para mostrar el contenido como un formulario */} </div>
      )}
      {tabSpecificState.isModified && <p>¡Este archivo ha sido modificado!</p>}
    </div>
  );
};

export default ContentTab;
