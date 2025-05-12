import { useEffect, useState } from 'react';
import { useTabManagerStore } from '../store/viewStore';
import TableComponent from './Table';

const DEBOUNCE_DELAY = 500;

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

  const buildObject = () => {
    return 'buildObject XML String';
  };

  const handleModifiedChange = (content) => {
    // setFilesModified(true);
    setModifiedTabState(tabKey, { isModified: true });

    console.log('handleModifiedChange:', {
      content,
      globalObject,
    });

    const newObjectGlobal = getObjectGlobal(globalObject.dataObject, content);
    const xmlString = buildObject(newObjectGlobal);

    // Parser Object -> xmlString
    // onContentChange(xmlString); // -> Mandar cambios a la fuente de verdad
    console.log('Modificar remoto:', xmlString);
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
    // Agregar al objecto global los cambios de la tabla
    globalObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail =
      content;

    return [globalObject];
  } catch (error) {
    console.log('Error al obtener el contenido de la tabla:', error);
    return {};
  }
};

const createObjectGlobal = (dataObject) => {
  try {
    const shipmentsDetail = [
      ...dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0]
        .ShipmentDetail,
    ];

    // Limpiar `Array` de shipments de dataObject
    dataObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail.length = 0;

    return { tableContent: shipmentsDetail, dataObject };
  } catch (error) {
    console.log('Error al obtener el contenido de la tabla:', error);
    return {};
  }
};

function ViewSummary({ content, onContentChange, setIsModified, tabKey }) {
  // Objecto separado del contenido que va hacia los componentes hijos
  // ObjectGlobal - Sin modificaciones
  const [globalObject, setGlobalObject] = useState({});

  const { handleObjectContentChange } = useEditedContent({
    onContentChange,
    setIsModified,
    tabKey,
    setGlobalObject,
    globalObject,
  });

  useEffect(() => {
    setGlobalObject(createObjectGlobal(content));
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
