import Editor from '@monaco-editor/react';

function EditorComponent({ content }) {
  return (
    <>
      <Editor
        height="90vh"
        width="100%"
        theme="vs-dark"
        language="xml"
        defaultValue={content}
      />
    </>
  );
}

export default EditorComponent;
