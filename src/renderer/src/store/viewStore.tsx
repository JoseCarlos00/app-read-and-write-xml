import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useViewStore = create(
  persist((set) => ({
    editorView: 'summary',
    setEditorView: (view) => set({ editorView: view }),
  })),
);

const useTabManagerStore = create((set, get) => ({
  tabState: [],
  activeKey: null,
  areFilesModified: false,
  modifiedTabs: {},

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

  setFilesModified: (modified) => set({ areFilesModified: modified }),

  setModifiedTabState: (tabKey) =>
    set((state) => ({
      modifiedTabs: {
        ...state.modifiedTabs,
        [tabKey]: { ...state.modifiedTabs[tabKey] },
      },
    })),

  removeModifiedTabState: (tabKey) =>
    set((state) => {
      const newModifiedTabs = { ...state.modifiedTabs };
      delete newModifiedTabs[tabKey];
      return { modifiedTabs: newModifiedTabs };
    }),

  saveFile: () => {
    const activeKey = get().activeKey;
    const removeModifiedTabState = get().removeModifiedTabState;
    const modifiedTabs = get().modifiedTabs;

    // Verifica si activeKey existe y está presente en modifiedTabs
    if (activeKey && modifiedTabs[activeKey]) {
      removeModifiedTabState(activeKey);
    }
  },
}));

export { useViewStore, useTabManagerStore };
