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
  const [isEditorContentModified, setIsEditorContentModified] = useState(false);

  useEffect(() => {
    setCurrentXmlString(initialContentString);
    setIsEditorContentModified(false);
  }, [initialContentString]);

  // Effect to parse XML whenever currentXmlString changes
  useEffect(() => {
    if (currentXmlString) {
      // console.log('Attempting to parse XML:', currentXmlString); // For debugging
      const { data, error } = parseXML(currentXmlString);

      // console.log('Parsed XML result:', data, 'Error:', error); // For debugging

      if (error) {
        console.error('Error parsing XML:', error.message);

        setParsedContentObject({
          error: 'Failed to parse XML',
          details: error.message,
        });
        return;
      }
      setParsedContentObject(data);
    } else {
      setParsedContentObject(null);
    }
  }, [currentXmlString]);

  // Callback for EditorComponent to update content and modification status
  const handleEditorContentChange = useCallback((newContent) => {
    setCurrentXmlString(newContent);
    setIsEditorContentModified(true);
    console.log('Editor content changed:', ++counter);
  }, []);

  const handleModified = (isModified) => {
    setIsEditorContentModified(isModified);
  };

  return (
    <>
      {editorView === 'tree' && (
        <EditorComponent
          content={currentXmlString}
          onContentChange={handleEditorContentChange}
          setIsModified={setIsEditorContentModified}
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
