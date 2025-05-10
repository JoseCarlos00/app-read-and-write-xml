import { useState, useEffect } from 'react';

import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import useViewStore from '../store/viewStore';

const { parseXML } = window.xml2jsAPI;

function ContentTab({ content: contentString, tabKey }) {
  const editorView = useViewStore((state) => state.editorView);
  const [contentObject, setContentObject] = useState(null);

  useEffect(() => {
    if (editorView === 'summary' && contentString) {
      const { data, error } = parseXML(contentString);

      if (error) {
        console.error('Error parsing XML:');
        setContentObject(null);
        return;
      }

      setContentObject(data);
    } else {
      setContentObject(null);
    }
  }, [editorView, contentString]);

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
