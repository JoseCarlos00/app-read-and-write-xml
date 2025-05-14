import { useEffect, useState } from 'react';
import TableComponent from './Table';

const DEBOUNCE_DELAY = 500;
const { buildXML } = window.xml2jsAPI;

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

const getObjectGlobal = (baseObject, newDetailsContent) => {
  try {
    // Validación básica de la estructura de globalObject
    if (
      !baseObject ||
      !baseObject.WMWROOT ||
      !baseObject.WMWROOT.WMWDATA ||
      !baseObject.WMWROOT.WMWDATA[0] ||
      !baseObject.WMWROOT.WMWDATA[0].Shipments ||
      !baseObject.WMWROOT.WMWDATA[0].Shipments[0] ||
      !baseObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment ||
      !baseObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0] ||
      !baseObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details ||
      !baseObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0]
    ) {
      console.error(
        'Error: Estructura de globalObject inválida en getObjectGlobal.',
      );
      return null; // Indicar fallo
    }
    // Agregar al objecto global los cambios de la tabla
    // baseObject es globalObject.dataObject del estado, que es una copia y se puede mutar aquí.
    baseObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail =
      newDetailsContent;

    return baseObject;
  } catch (error) {
    console.error(
      'Error en getObjectGlobal al actualizar ShipmentDetail:',
      error,
    );
    return null; // Indicar fallo
  }
};

/**
 * @param {Object} sourceDataObject
 * @returns {Object} { tableContent: shipmentsDetail, dataObject }
 */
const createObjectGlobal = (sourceDataObject) => {
  try {
    // Validación básica de la estructura de sourceDataObject hasta Details[0]
    if (
      !sourceDataObject ||
      !sourceDataObject.WMWROOT ||
      !sourceDataObject.WMWROOT.WMWDATA ||
      !sourceDataObject.WMWROOT.WMWDATA[0] ||
      !sourceDataObject.WMWROOT.WMWDATA[0].Shipments ||
      !sourceDataObject.WMWROOT.WMWDATA[0].Shipments[0] ||
      !sourceDataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment ||
      !sourceDataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0] ||
      !sourceDataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details ||
      !sourceDataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0]
        .Details[0] ||
      !sourceDataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0]
        .ShipmentDetail
    ) {
      console.error(
        'Error: Estructura de sourceDataObject inválida en createObjectGlobal (ruta a Details).',
      );
      return null; // Indicar fallo
    }

    const detailsNodeSource =
      sourceDataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0];

    // Extraer tableContent. Si ShipmentDetail falta o no es un array, usar [].
    // Esto maneja el caso donde buildXML omite la etiqueta para arrays vacíos.
    const currentShipmentDetailsSource = Array.isArray(
      detailsNodeSource.ShipmentDetail,
    )
      ? detailsNodeSource.ShipmentDetail
      : [];

    const tableContent = [...currentShipmentDetailsSource];

    const templateDataObject = structuredClone(sourceDataObject);

    // Asegurar que ShipmentDetail sea un array vacío en el objeto de estado (template).
    templateDataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail =
      [];

    return { tableContent, dataObject: templateDataObject };
  } catch (error) {
    console.error('Error en createObjectGlobal:', error);
    return null; // Indicar fallo
  }
};

function ViewSummary({ content, onContentChange, tabKey }) {
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

  console.log('[ViewSummary]', {
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
