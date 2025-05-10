import { create } from 'zustand';

const useViewStore = create((set) => ({
  editorView: 'tree',
  setEditorView: (view) => set({ editorView: view }),
}));

export default useViewStore;
