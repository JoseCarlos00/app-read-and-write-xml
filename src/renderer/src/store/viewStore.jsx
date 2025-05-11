import { create } from 'zustand';

const useViewStore = create((set) => ({
  editorView: 'summary',
  setEditorView: (view) => set({ editorView: view }),
}));

const useModifiedStore = create((set) => ({
  // Estado para rastrear si algún archivo ha sido modificado
  areFilesModified: false,
  // Estado para rastrear si el contenido del editor ha sido modificado
  isEditorContentModified: false,
  setFilesModified: (modified) => set({ areFilesModified: modified }),
  setEditorContentModified: (modified) =>
    set({ isEditorContentModified: modified }),
}));

export { useViewStore, useModifiedStore };
