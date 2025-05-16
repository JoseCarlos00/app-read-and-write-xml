import { useEffect, useMemo, useState } from 'react';
import TableComponent from './Table';

import { ShipmentDetail, RootObject } from '../types/shipmentDetail';
import {
  getArrayObjectShipmentDetail,
  updateParsedXMLWithTableData,
} from '../utils/objectGlobal';

const DEBOUNCE_DELAY = 500;
const { buildXML, parseXMLPromise } = window.xml2jsAPI;

interface Props {
  content: string;
  onContentChange: (newContent: string) => void;
  tabKey: string;
}
interface PropsEdit {
  onContentChange: (newContent: string) => void;
  parsedXmlObject: RootObject | null;
}

type ParseObject = {
  content: string;
  tabKey: string;
};

// const counter = 0;

const useEditedContent = ({ onContentChange, parsedXmlObject }: PropsEdit) => {
  // callback: () => void
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const buildObject = (ojectGlobalToBuild: RootObject) => {
    try {
      const { status, error, data } = buildXML(ojectGlobalToBuild);

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

  const handleModifiedChange = (content: Array<ShipmentDetail>) => {
    // 1. Validar globalObject y globalObject.dataObject
    if (!parsedXmlObject) {
      console.error(
        'handleModifiedChange Error: parsedXmlObject es inválido.',
        parsedXmlObject,
      );
      // Aquí podrías revertir actualizaciones optimistas de UI o notificar al usuario
      return; // Detener el procesamiento
    }

    const { ojectGlobalToBuild, success, error } = updateParsedXMLWithTableData(
      parsedXmlObject,
      content,
    );

    if (!success || !ojectGlobalToBuild) {
      console.error(
        'handleModifiedChange Error: updateParsedXMLWithTableData: ',
        error,
      );
      return;
    }

    const xmlString = buildObject(ojectGlobalToBuild);

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

  const handleTableContentChange = (newTableContent: Array<ShipmentDetail>) => {
    console.log('[handleObjectContentChange]:', newTableContent);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    setDebounceTimeout(
      setTimeout(() => handleModifiedChange(newTableContent), DEBOUNCE_DELAY),
    );
  };

  return { handleTableContentChange };
};

const extractTableDataFromParsedXML = (
  parsedXmlObject: RootObject,
): Array<ShipmentDetail> => {
  if (!parsedXmlObject) {
    return [];
  }

  const { success, shipmentDetailArray } =
    getArrayObjectShipmentDetail(parsedXmlObject);

  if (success && shipmentDetailArray) {
    return shipmentDetailArray;
  }

  return [];
};

const useParsedObject = ({ content, tabKey }: ParseObject) => {
  const [currentXmlString, setCurrentXmlString] = useState(content);
  const [parsedXmlObject, setParsedXmlObject] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  // Efecto para parsear XML cuando la prop 'content' cambia
  useEffect(() => {
    if (!content) {
      setParsedXmlObject(null);
      setParsingError(null);
      setIsParsing(false);
      return;
    }

    setIsParsing(true);
    setParsingError(null);

    parseXMLPromise(content)
      .then(({ status, data, error: parseError }) => {
        if (status === 'success' && data) {
          setParsedXmlObject(data);
        } else {
          console.error(
            `[ViewSummary] Error parseando XML para la pestaña ${tabKey}:`,
            parseError,
          );

          setParsingError(parseError || 'Falló el parseo del XML');
          setParsedXmlObject(null);
        }
      })
      .catch((err) => {
        console.error(
          `[ViewSummary] Error no manejado durante parseo de XML para la pestaña ${tabKey}:`,
          err,
        );
        setParsingError(
          err.message || 'Ocurrió un error inesperado durante el parseo.',
        );
        setParsedXmlObject(null);
      })
      .finally(() => {
        setIsParsing(false);
      });
  }, [content, tabKey]);

  useEffect(() => {
    if (currentXmlString !== content) {
      setCurrentXmlString(content);
    }
  }, [content, currentXmlString]);

  return {
    parsedXmlObject,
    isParsing,
    parsingError,
  };
};

function ViewSummary({ content, onContentChange, tabKey }: Props) {
  const { parsedXmlObject, isParsing, parsingError } = useParsedObject({
    content,
    tabKey,
  });

  const { handleTableContentChange } = useEditedContent({
    onContentChange,
    parsedXmlObject,
  });
  // Memoriza la extracción de datos para la tabla
  const tableContentForDisplay = useMemo(() => {
    if (!parsedXmlObject) return [];
    return extractTableDataFromParsedXML(parsedXmlObject);
  }, [parsedXmlObject]);

  console.log(`[ViewSummary] Render para la pestaña ${tabKey}:`, {
    content,
    tabKey,
  });

  if (isParsing) {
    return <div>Cargando datos XML para la tabla...</div>;
  }

  if (parsingError) {
    return <div>Error cargando datos XML: {parsingError}</div>;
  }

  if (!parsedXmlObject) {
    return <div>No hay contenido XML para mostrar en la tabla.</div>;
  }

  return (
    <div style={{ maxWidth: '700px', marginRight: 'auto', marginLeft: 'auto' }}>
      <TableComponent
        tableContent={tableContentForDisplay}
        onContentChange={handleTableContentChange}
      />
    </div>
  );
}

export default ViewSummary;
