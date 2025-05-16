import { useState, useEffect } from 'react';

import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import { useTabManagerStore, useViewStore } from '../store/viewStore';

let counter = 0;

interface Props {
  content: string;
  tabKey: string;
}

const INITIAL_STATE = {
  currentXmlString: '',
};

function ContentTab({ content: initialContentString, tabKey }: Props) {
  const editorView = useViewStore((state) => state.editorView);

  const [currentXmlString, setCurrentXmlString] = useState(
    INITIAL_STATE.currentXmlString,
  );

  // const setFilesModified = useTabManagerStore(
  //   (state) => state.setFilesModified,
  // );
  // const setModifiedTabState = useTabManagerStore(
  //   (state) => state.setModifiedTabState,
  // );

  useEffect(() => {
    setCurrentXmlString(initialContentString);
  }, [initialContentString]);

  // Callback for EditorComponent to update content and modification status
  const handleEditorContentChange = (newContent: string) => {
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
      {editorView === 'summary' && (
        <ViewSummary
          content={currentXmlString}
          onContentChange={handleEditorContentChange}
          tabKey={tabKey}
        />
      )}
    </>
  );
}

export default ContentTab;
