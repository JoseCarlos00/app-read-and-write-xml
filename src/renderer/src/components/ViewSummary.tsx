import { useEffect, useRef, useCallback } from 'react';
import TableComponent from './Table';

import { ShipmentDetail, RootObject } from '../types/shipmentDetail';
import { updateParsedXMLWithTableData } from '../utils/objectGlobal';

const DEBOUNCE_DELAY = 500;
const { buildXML } = window.xml2jsAPI;

let counter = 0;

interface Props {
  parsedXmlObject: RootObject | null;
  tableContentForDisplay: Array<ShipmentDetail>;
  xmlParsingError: string | null;
  isParsingXml: boolean;
  tabKey: string;
  onContentChange: (newContent: string) => void;
}

interface PropsEdit {
  onContentChange: (newContent: string) => void;
  parsedXmlObject: RootObject | null;
}

const useEditedContent = ({ onContentChange, parsedXmlObject }: PropsEdit) => {
  // Usamos useRef para almacenar el ID del timeout.
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Limpiamos el timeout si existe cuando el componente se desmonta.
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []); // El array de dependencias vacío asegura que esto solo se ejecute al montar y desmontar.

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
    if (!parsedXmlObject) {
      console.error(
        'handleModifiedChange Error: currentParsedXmlObject es inválido.',
        parsedXmlObject,
      );
      // Aquí podrías revertir actualizaciones optimistas de UI o notificar al usuario
      return; // Detener el procesamiento
    }

    const { ojectGlobalToBuild, success, error } = updateParsedXMLWithTableData(
      parsedXmlObject,
      content,
    );

    console.log('[handleModifiedChange]:', {
      ojectGlobalToBuild,
      success,
      error,
    });

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
    } else {
      console.error(
        'handleModifiedChange Error: onContentChange no es una función.',
      );
    }
  };

  const handleTableContentChange = useCallback(
    (newTableContent: Array<ShipmentDetail>) => {
      console.log('[handleObjectContentChange]:', newTableContent);
      console.log('Modificar en local:', ++counter);

      // Si ya hay un timeout pendiente, lo limpiamos.
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Establecemos un nuevo timeout.
      debounceTimeoutRef.current = setTimeout(
        () => handleModifiedChange(newTableContent),
        DEBOUNCE_DELAY,
      );
    },
    [parsedXmlObject],
  );

  return { handleTableContentChange };
};

function ViewSummary({
  parsedXmlObject,
  tableContentForDisplay,
  xmlParsingError,
  onContentChange,
  tabKey,
  isParsingXml,
}: Props) {
  const { handleTableContentChange } = useEditedContent({
    onContentChange,
    parsedXmlObject,
  });

  console.log(`[ViewSummary] Render para la pestaña ${tabKey}:`, {
    tabKey,
    parsedXmlObject,
    isParsingXml,
    xmlParsingError,
    tableContentForDisplay,
  });

  if (isParsingXml) {
    console.log('isParsingXml');

    return <div>Cargando datos XML para la tabla...</div>;
  }

  if (xmlParsingError) {
    console.log('xmlParsingError');

    return <div>Error cargando datos XML: {xmlParsingError}</div>;
  }

  if (parsedXmlObject) {
    console.log('receivedParsedXmlObject');

    return (
      <div
        style={{ maxWidth: '700px', marginRight: 'auto', marginLeft: 'auto' }}
      >
        <TableComponent
          tableContent={tableContentForDisplay || []}
          onContentChange={handleTableContentChange}
        />
      </div>
    );
  }
}

export default ViewSummary;
