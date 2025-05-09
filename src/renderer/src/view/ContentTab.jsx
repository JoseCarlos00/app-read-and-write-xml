import { useEffect, useState } from 'react';
import EditorComponent from './Editor';
import useAppStore from '../store/viewStore';

function ContentTab({ content, tabKey }) {
  const [localContent, setLocalContent] = useState(content);
  const editorView = useAppStore((state) => state.editorView);

  console.log({ editorView });

  return (
    <>
      <h2>Contenido de la Tab {tabKey}</h2>

      {editorView === 'tree' && (
        <div> {/* Lógica para mostrar el contenido como un árbol */} </div>
      )}
      {editorView === 'form' && (
        <div> {/* Lógica para mostrar el contenido como un formulario */} </div>
      )}
    </>
  );
}

export default ContentTab;
