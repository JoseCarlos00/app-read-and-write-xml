import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';

import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import { useTabManagerStore, useViewStore } from '../store/viewStore';

import type {
  RootObject,
  ShipmentDetail,
  TableDetailSummary,
} from '../types/shipmentDetail';
import {
  extractTableDataFromParsedXML,
  extractTableDetailFromParsedXML,
} from '../utils/xmlUtils';

const { parseXMLPromise } = window.xml2jsAPI;

interface Props {
  content: string;
  tabKey: string;
}

export interface TableContentForDisplay {
  tableDetail: Array<ShipmentDetail> | null;
  tableSummary: TableDetailSummary | null;
}

function ContentTab({ content: initialContentString, tabKey }: Props) {
  const editorView = useViewStore((state) => state.editorView);

  const setModifiedTabState = useTabManagerStore(
    (state) => state.setModifiedTabState,
  );

  const [currentXmlString, setCurrentXmlString] =
    useState<string>(initialContentString);

  const [parsedXmlObject, setParsedXmlObject] = useState<RootObject | null>(
    null,
  );
  const [isParsingXml, setIsParsingXml] = useState<boolean>(false);
  const [xmlParsingError, setXmlParsingError] = useState<string | null>(null);

  const lastParsedXml = useRef<string | null>(null);

  useEffect(() => {
    setCurrentXmlString(initialContentString);
  }, [initialContentString]);

  // Parse XML when currentXmlString changes
  useEffect(() => {
    if (!currentXmlString) {
      setParsedXmlObject(null);
      setXmlParsingError(null);
      setIsParsingXml(false);
      return;
    }

    // Evita reparsear si el contenido no cambió realmente
    if (lastParsedXml.current === currentXmlString) {
      console.log('[ContentTab] XML no ha cambiado, se evita reprocesar.');
      return;
    }

    setIsParsingXml(true);
    setXmlParsingError(null);

    console.log('=== Creando parsedXmlObject ====');

    parseXMLPromise(currentXmlString)
      .then(({ status, data, error: parseError }) => {
        if (status === 'success' && data) {
          lastParsedXml.current = currentXmlString; // actualiza cache
          setParsedXmlObject(data as RootObject);
        } else {
          console.error(
            `[ContentTab] Error parsing XML for tab ${tabKey}:`,
            parseError,
          );
          setXmlParsingError(parseError || 'Failed to parse XML');
          setParsedXmlObject(null);
        }
      })
      .catch((err) => {
        console.error(
          `[ContentTab] Unhandled error during XML parsing for tab ${tabKey}:`,
          err,
        );
        setXmlParsingError(
          err.message || 'An unexpected error occurred during parsing.',
        );
        setParsedXmlObject(null);
      })
      .finally(() => {
        setIsParsingXml(false);
      });
  }, [currentXmlString, tabKey]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setCurrentXmlString((current) => {
        if (newContent !== current) {
          setModifiedTabState(tabKey);
          console.log(
            '[ContentTab] Content changed, tab marked as modified:',
            tabKey,
          );
          return newContent;
        }
        return current;
      });
    },
    [setModifiedTabState, tabKey], // Las dependencias son estables.
  );

  // Calculamos tableContentForDisplay aquí, en ContentTab, usando useMemo.
  // Solo se recalculará si parsedXmlObject cambia.
  const tableContentForDisplay: TableContentForDisplay | null = useMemo(() => {
    if (!parsedXmlObject) {
      return null;
    }

    return {
      tableDetail: extractTableDataFromParsedXML(parsedXmlObject),
      tableSummary: extractTableDetailFromParsedXML(parsedXmlObject),
    };
  }, [parsedXmlObject]);

  const editorComponent = useMemo(
    () => (
      <EditorComponent
        xmlStringContent={currentXmlString}
        onContentChange={handleContentChange}
      />
    ),
    [currentXmlString, handleContentChange],
  );

  const summaryComponent = useMemo(
    () => (
      <ViewSummary
        parsedXmlObject={parsedXmlObject}
        tableContentForDisplay={tableContentForDisplay}
        isParsingXml={isParsingXml}
        xmlParsingError={xmlParsingError}
        onContentChange={handleContentChange}
      />
    ),
    [
      parsedXmlObject,
      tableContentForDisplay,
      isParsingXml,
      xmlParsingError,
      handleContentChange,
    ],
  );

  return (
    <>
      {editorView === 'tree' && editorComponent}
      {editorView === 'summary' && summaryComponent}
    </>
  );
}

export default memo(ContentTab);
