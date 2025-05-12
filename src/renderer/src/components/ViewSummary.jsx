import { useEffect, useState } from 'react';
import { useTabManagerStore } from '../store/viewStore';
import TableComponent from './Table';

const DEBOUNCE_DELAY = 500;
const { buildXML } = window.xml2jsAPI;

const useEditedContent = ({
  onContentChange,
  setIsModified,
  tabKey,
  globalObject,
}) => {
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const setFilesModified = useTabManagerStore(
    (state) => state.setFilesModified,
  );
  const setModifiedTabState = useTabManagerStore(
    (state) => state.setModifiedTabState,
  );

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
    // Comprobar tabKey antes de usarlo
    if (typeof tabKey === 'undefined' || tabKey === null) {
      console.warn(
        'handleModifiedChange: tabKey es undefined o null. Omitiendo setModifiedTabState.',
      );
    } else {
      setModifiedTabState(tabKey, { isModified: true });
    }

    setFilesModified(true);

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
    setIsModified(true);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    setDebounceTimeout(
      setTimeout(() => handleModifiedChange(newTableContent), DEBOUNCE_DELAY),
    );
  };

  return { handleObjectContentChange };
};

const getObjectGlobal = (globalObject, content) => {
  try {
    // Validación básica de la estructura de globalObject
    if (
      !globalObject ||
      !globalObject.WMWROOT ||
      !globalObject.WMWROOT.WMWDATA ||
      !globalObject.WMWROOT.WMWDATA[0] ||
      !globalObject.WMWROOT.WMWDATA[0].Shipments ||
      !globalObject.WMWROOT.WMWDATA[0].Shipments[0] ||
      !globalObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment ||
      !globalObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0] ||
      !globalObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details ||
      !globalObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0]
    ) {
      console.error(
        'Error: Estructura de globalObject inválida en getObjectGlobal.',
      );
      return null; // Indicar fallo
    }
    // Agregar al objecto global los cambios de la tabla
    globalObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail =
      content;

    return globalObject;
  } catch (error) {
    console.error(
      'Error en getObjectGlobal al actualizar ShipmentDetail:',
      error,
    );
    return null; // Indicar fallo
  }
};

const createObjectGlobal = (dataObject) => {
  try {
    // Validación básica de la estructura de dataObject
    if (
      !dataObject ||
      !dataObject.WMWROOT ||
      !dataObject.WMWROOT.WMWDATA ||
      !dataObject.WMWROOT.WMWDATA[0] ||
      !dataObject.WMWROOT.WMWDATA[0].Shipments ||
      !dataObject.WMWROOT.WMWDATA[0].Shipments[0] ||
      !dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment ||
      !dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0] ||
      !dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details ||
      !dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0] ||
      !dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0]
        .ShipmentDetail
    ) {
      console.error(
        'Error: Estructura de dataObject inválida en createObjectGlobal.',
      );
      return null; // Indicar fallo
    }

    const shipmentsDetail = [
      ...dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0]
        .ShipmentDetail,
    ];

    // Limpiar `Array` de shipments de dataObject
    dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail.length = 0;

    return { tableContent: shipmentsDetail, dataObject };
  } catch (error) {
    console.error('Error en createObjectGlobal:', error);
    return null; // Indicar fallo
  }
};

function ViewSummary({ content, onContentChange, setIsModified, tabKey }) {
  // Objecto separado del contenido que va hacia los componentes hijos
  // globalObject almacena { tableContent, dataObject } o un estado de error/vacío
  const [globalObject, setGlobalObject] = useState({});

  const { handleObjectContentChange } = useEditedContent({
    onContentChange,
    setIsModified,
    tabKey,
    setGlobalObject,
    globalObject,
  });

  useEffect(() => {
    const initialGlobalObject = createObjectGlobal(content);

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

  console.log('ViewSummary', {
    content,
    tableContent: globalObject.tableContent,
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
