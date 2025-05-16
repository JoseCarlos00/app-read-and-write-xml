import { useEffect, useState } from 'react';
import TableComponent from './Table';

const DEBOUNCE_DELAY = 500;
const { buildXML } = window.xml2jsAPI;

interface Props {
  content: string;
  onContentChange: (newContent: string) => void;
  tabKey: string;
}

const INITIAL_STATE = {
  currentXmlString: '',
  parsedContentObject: {},
};

let counter = 0;

const useEditedContent = ({ onContentChange, globalObject }) => {
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const buildObject = (newObjectGlobal) => {
    try {
      const { status, error, data } = buildXML(newObjectGlobal);

      if (status === 'error') {
        throw new Error(error);
      }

      return data;
    } catch (error) {
      console.error(
        'handleModifiedChange Error: Excepción durante la ejecución de buildObject.',
        error,
      );
      return null;
    }
  };

  const handleModifiedChange = (content) => {
    // 1. Validar globalObject y globalObject.dataObject
    if (!globalObject || !globalObject.dataObject) {
      console.error(
        'handleModifiedChange Error: globalObject o globalObject.dataObject es inválido.',
        globalObject,
      );
      // Aquí podrías revertir actualizaciones optimistas de UI o notificar al usuario
      return; // Detener el procesamiento
    }

    let newObjectGlobal;
    try {
      newObjectGlobal = getObjectGlobal(globalObject.dataObject, content);
      // 2. Verificar si getObjectGlobal falló (asumiendo que devuelve null en error)
      if (newObjectGlobal === null) {
        console.error(
          'handleModifiedChange Error: Falló la actualización del objeto global con el nuevo contenido.',
        );
        return; // Detener el procesamiento
      }
    } catch (error) {
      console.error(
        'handleModifiedChange Error: Excepción durante la ejecución de getObjectGlobal.',
        error,
      );
      return; // Detener el procesamiento
    }

    const xmlString = buildObject(newObjectGlobal);

    if (xmlString === null || typeof xmlString !== 'string') {
      // Asumiendo que buildObject puede devolver null o algo no-string en error
      console.error(
        'handleModifiedChange Error: buildObject no produjo una cadena XML válida.',
        { output: xmlString },
      );
      return; // Detener el procesamiento
    }

    // 4. Verificar que onContentChange sea una función antes de llamarla
    if (typeof onContentChange === 'function') {
      onContentChange(xmlString);
      console.log('Modificar remoto:');
    } else {
      console.error(
        'handleModifiedChange Error: onContentChange no es una función.',
      );
    }
  };

  const handleObjectContentChange = (newTableContent) => {
    console.log('[handleObjectContentChange]:', newTableContent);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    setDebounceTimeout(
      setTimeout(() => handleModifiedChange(newTableContent), DEBOUNCE_DELAY),
    );
  };

  return { handleObjectContentChange };
};

const useParsedObject = ({ content: initialContentString, tabKey }) => {
  const [currentXmlString, setCurrentXmlString] = useState(
    INITIAL_STATE.currentXmlString,
  );
  const [parsedContentObject, setParsedContentObject] = useState(
    INITIAL_STATE.parsedContentObject,
  );

  // Effect to parse XML whenever currentXmlString changes
  useEffect(() => {
    try {
      if (currentXmlString) {
        const { data, error, status } = parseXMLPromise(currentXmlString);

        if (status === 'error') {
          console.error('Error parsing XML:', error);
          return;
        }

        setParsedContentObject(data);
      } else {
        setParsedContentObject(INITIAL_STATE.parsedContentObject);
      }
    } catch (error) {
      console.error('Error parsing XML:', error);
      setParsedContentObject(INITIAL_STATE.parsedContentObject);
    }
  }, [currentXmlString]);

  useEffect(() => {
    setCurrentXmlString(initialContentString);
  }, [initialContentString]);

  // Callback for EditorComponent to update content and modification status
  const handleEditorContentChange = (newContent: string) => {
    setCurrentXmlString(newContent);
    // setFilesModified(true); // setFilesModified(true); // setModifiedTabState(tabKey, { isModified: true });
    console.log('Editor content changed:', ++counter);
  };

  return {
    editorView,
    currentXmlString,
    parsedContentObject,
    handleEditorContentChange,
  };
};

function ViewSummary({ content, onContentChange, tabKey }: Props) {
  // Objecto separado del contenido que va hacia los componentes hijos
  // globalObject almacena { tableContent, dataObject } o un estado de error/vacío
  const [globalObject, setGlobalObject] = useState({
    tableContent: [],
    dataObject: null,
  });

  const { handleObjectContentChange } = useEditedContent({
    onContentChange,
    setGlobalObject,
    globalObject,
  });

  useEffect(() => {
    const initialGlobalObject = createObjectGlobal(content);
    console.log('useEffect ViewSummary: [content]');

    if (initialGlobalObject) {
      setGlobalObject(initialGlobalObject);
    } else {
      console.error(
        'ViewSummary Error: Falló la creación del objeto global inicial. El contenido podría ser inválido.',
      );
      // Establecer un estado definido de vacío/error para evitar errores posteriores
      setGlobalObject({ tableContent: [], dataObject: null });
    }
  }, [content]);

  console.log('[ViewSummary] Render:', {
    content,
    tableContent: globalObject.tableContent,
    dataObject: globalObject.dataObject,
    tabKey,
  });

  return (
    <div style={{ maxWidth: '700px', marginRight: 'auto', marginLeft: 'auto' }}>
      <TableComponent
        tableContent={globalObject.tableContent}
        onContentChange={handleObjectContentChange}
      />
    </div>
  );
}

export default ViewSummary;
