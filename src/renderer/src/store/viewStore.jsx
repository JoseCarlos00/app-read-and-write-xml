import { create } from 'zustand';

const useViewStore = create((set) => ({
  editorView: 'summary',
  setEditorView: (view) => set({ editorView: view }),
}));

export default useViewStore;
