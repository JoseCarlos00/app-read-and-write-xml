import { useState, useEffect, useCallback } from 'react';

import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import { useViewStore } from '../store/viewStore';

let counter = 0;
const { parseXML } = window.xml2jsAPI;

function ContentTab({ content: initialContentString, tabKey }) {
  const editorView = useViewStore((state) => state.editorView);

  const [currentXmlString, setCurrentXmlString] =
    useState(initialContentString);
  const [parsedContentObject, setParsedContentObject] = useState(null);

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
  const handleEditorContentChange = useCallback((newContent) => {
    setCurrentXmlString(newContent);
    console.log('Editor content changed:', ++counter);
  }, []);

  const handleModified = (isModified) => {
    console.log('Modificar localmente:', isModified);
  };

  return (
    <>
      {editorView === 'tree' && (
        <EditorComponent
          content={currentXmlString}
          onContentChange={handleEditorContentChange}
          setIsModified={handleModified}
          tabKey={tabKey}
        />
      )}
      {editorView === 'summary' && parsedContentObject && (
        <ViewSummary
          content={parsedContentObject}
          onContentChange={handleEditorContentChange}
          setIsModified={handleModified}
          tabKey={tabKey}
        />
      )}
    </>
  );
}

export default ContentTab;
