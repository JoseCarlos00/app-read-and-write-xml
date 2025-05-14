import { useState, useEffect } from 'react';

import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import { useTabManagerStore, useViewStore } from '../store/viewStore';

let counter = 0;
const { parseXML } = window.xml2jsAPI;

function ContentTab({ content: initialContentString, tabKey }) {
  const editorView = useViewStore((state) => state.editorView);

  const [currentXmlString, setCurrentXmlString] = useState(null);
  const [parsedContentObject, setParsedContentObject] = useState(null);

  const setFilesModified = useTabManagerStore(
    (state) => state.setFilesModified,
  );
  const setModifiedTabState = useTabManagerStore(
    (state) => state.setModifiedTabState,
  );

  useEffect(() => {
    setCurrentXmlString(initialContentString);
  }, [initialContentString]);

  // Effect to parse XML whenever currentXmlString changes
  useEffect(() => {
    try {
      if (currentXmlString) {
        const { data, error, status } = parseXML(currentXmlString);

        if (status === 'error') {
          console.error('Error parsing XML:', error);
          return;
        }

        setParsedContentObject(data);
      } else {
        setParsedContentObject(null);
      }
    } catch (error) {
      console.error('Error parsing XML:', error);
      setParsedContentObject(null);
    }
  }, [currentXmlString]);

  // Callback for EditorComponent to update content and modification status
  const handleEditorContentChange = (newContent) => {
    setCurrentXmlString(newContent);
    // setFilesModified(true);
    // setFilesModified(true);
    // setModifiedTabState(tabKey, { isModified: true });
    console.log('Editor content changed:', ++counter);
  };

  console.log('[ContentTab]:', {
    editorView,
    tabKey,
    initialContentString,
    currentXmlString,
    parsedContentObject,
  });

  return (
    <>
      {editorView === 'tree' && (
        <EditorComponent
          content={currentXmlString}
          onContentChange={handleEditorContentChange}
          tabKey={tabKey}
        />
      )}
      {editorView === 'summary' && parsedContentObject && (
        <ViewSummary
          content={parsedContentObject}
          onContentChange={handleEditorContentChange}
          tabKey={tabKey}
        />
      )}
    </>
  );
}

export default ContentTab;
