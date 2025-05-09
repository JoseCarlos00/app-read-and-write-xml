import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Estado para la vista del editor (por ejemplo, 'text' | 'tree' | 'form')
  editorView: 'text',
  setEditorView: (view) => set({ editorView: view }),

  // Estado para rastrear si algún archivo ha sido modificado
  areFilesModified: false,
  setFilesModified: (modified) => set({ areFilesModified: modified }),

  // Estado específico para cada pestaña (podrías usar un objeto donde la clave es el key de la pestaña)
  tabStates: {},
  setTabState: (tabKey, newState) =>
    set((state) => ({
      tabStates: {
        ...state.tabStates,
        [tabKey]: { ...state.tabStates[tabKey], ...newState },
      },
    })),
  removeTabState: (tabKey) =>
    set((state) => {
      const newTabStates = { ...state.tabStates };
      delete newTabStates[tabKey];
      return { tabStates: newTabStates };
    }),
}));

export default useAppStore;
