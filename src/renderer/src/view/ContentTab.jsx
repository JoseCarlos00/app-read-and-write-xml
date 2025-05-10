import { useState, useEffect, useMemo } from 'react';

import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import useViewStore from '../store/viewStore';

const { parseXML } = window.xml2jsAPI;

function ContentTab({ content: contentString, tabKey }) {
  const editorView = useViewStore((state) => state.editorView);
  const [parsedContentObject, setParsedContentObject] = useState(null);

  useEffect(() => {
    if (contentString) {
      const { data, error } = parseXML(contentString);

      console.log('Parsed XML:', data, 'Error:', error);

      if (error) {
        console.error('Error parsing XML:');
        setParsedContentObject(null);
        return;
      }

      setParsedContentObject(data);
    } else {
      setParsedContentObject(null);
    }
  }, [contentString]);

  const contentObject = useMemo(() => {
    return parsedContentObject;
  }, [parsedContentObject]);

  return (
    <>
      {editorView === 'tree' && (
        <EditorComponent content={contentString} tabKey={tabKey} />
      )}
      {editorView === 'summary' && contentObject && (
        <ViewSummary content={contentObject} tabKey={tabKey} />
      )}
    </>
  );
}

export default ContentTab;
