import { create } from 'zustand';

const useViewStore = create((set) => ({
  editorView: 'summary',
  setEditorView: (view) => set({ editorView: view }),
}));

const useTabManagerStore = create((set) => ({
  tabState: [],
  activeKey: null,

  setActiveKey: (key) => set({ activeKey: key }),

  addTab: (tab) =>
    set((state) => ({
      tabState: [...state.tabState, tab],
      activeKey: tab.key,
    })),

  removeTab: (key, newKey) =>
    set((state) => ({
      tabState: state.tabState.filter((tab) => tab.key !== key),
      activeKey: newKey,
    })),

  // Estado para rastrear si algún archivo ha sido modificado
  areFilesModified: false,
  setFilesModified: (modified) => set({ areFilesModified: modified }),

  // Estado específico para cada pestaña (podrías usar un objeto donde la clave es el key de la pestaña)
  modifiedTabs: {},
  setModifiedTabState: (tabKey) =>
    set((state) => ({
      modifiedTabs: {
        ...state.modifiedTabs,
        [tabKey]: { ...state.modifiedTabs[tabKey] },
      },
    })),

  removeModifiedTabState: (tabKey) =>
    set((state) => {
      const newModifiedTabs = structuredClone(state.modifiedTabs);
      delete newModifiedTabs[tabKey];
      return { tabStates: newModifiedTabs };
    }),
}));

export { useViewStore, useTabManagerStore };
