import EditorComponent from './Editor';
import useViewStore from '../store/viewStore';

function ContentTab({ content, tabKey }) {
  const editorView = useViewStore((state) => state.editorView);

  console.log({ editorView });

  return (
    <>
      {editorView === 'tree' && <EditorComponent content={content} />}
      {editorView === 'summary' && <div> Resumen </div>}
    </>
  );
}

export default ContentTab;
