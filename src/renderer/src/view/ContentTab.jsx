import EditorComponent from '../components/ViewEditor';
import ViewSummary from '../components/ViewSummary';
import useViewStore from '../store/viewStore';

function ContentTab({ content, tabKey }) {
  const editorView = useViewStore((state) => state.editorView);

  return (
    <>
      {editorView === 'tree' && (
        <EditorComponent content={content} tabKey={tabKey} />
      )}
      {editorView === 'summary' && (
        <ViewSummary content={content} tabKey={tabKey} />
      )}
    </>
  );
}

export default ContentTab;
