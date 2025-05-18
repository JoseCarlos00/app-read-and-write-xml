import { useState, useEffect, useRef, useMemo } from 'react';

import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import { useTabManagerStore, useViewStore } from '../store/viewStore';

import { RootObject } from '../types/shipmentDetail';
import { extractTableDataFromParsedXML } from '../utils/xmlUtils';

const { parseXMLPromise } = window.xml2jsAPI;

interface Props {
  content: string;
  tabKey: string;
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
  const isChangeXmlText: boolean = lastParsedXml.current === currentXmlString;

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

  // Callback for child components (Editor or Summary) to update content
  const handleContentChange = (newContent: string) => {
    if (newContent !== currentXmlString) {
      setCurrentXmlString(newContent);
      setModifiedTabState(tabKey);
      console.log(
        '[ContentTab] Content changed, tab marked as modified:',
        tabKey,
      );
    }
  };

  // Calculamos tableContentForDisplay aquí, en ContentTab, usando useMemo.
  // Solo se recalculará si parsedXmlObject cambia.
  const tableContentForDisplay = useMemo(() => {
    if (!parsedXmlObject) {
      return [];
    }
    // Este log ayuda a confirmar cuándo se ejecuta realmente la extracción.
    console.log(
      '[ContentTab] Calculando tableContentForDisplay para la pestaña:',
      tabKey,
    );
    return extractTableDataFromParsedXML(parsedXmlObject);
  }, [parsedXmlObject, tabKey]); // tabKey es dependencia si extractTableDataFromParsedXML lo usa, sino solo parsedXmlObject

  console.log('[ContentTab]:', {
    editorView,
    currentXmlString,
    parsedXmlObject,
    lastParsedXml: lastParsedXml.current,
    isChangeXmlText,
    tableContentForDisplay,
  });

  return (
    <>
      {editorView === 'tree' && (
        <EditorComponent
          xmlStringContent={currentXmlString}
          onContentChange={handleContentChange}
          tabKey={tabKey}
        />
      )}
      {editorView === 'summary' && (
        <ViewSummary
          parsedXmlObject={parsedXmlObject}
          tableContentForDisplay={tableContentForDisplay}
          isParsingXml={isParsingXml}
          xmlParsingError={xmlParsingError}
          onContentChange={handleContentChange}
          tabKey={tabKey}
        />
      )}
    </>
  );
}

export default ContentTab;
