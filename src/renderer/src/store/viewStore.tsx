import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define la interfaz para el estado del ViewStore
interface ViewStoreState {
  editorView: 'summary' | 'tree';
}

// Define la interfaz para las acciones del ViewStore
interface ViewStoreActions {
  setEditorView: (view: ViewType) => void;
}

// Combina el estado y las acciones para el tipo completo del ViewStore
type ViewStore = ViewStoreState & ViewStoreActions;
type ViewType = ViewStoreState['editorView'];

const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      editorView: 'summary',
      setEditorView: (view: ViewType) => set({ editorView: view }),
    }),
    {
      name: 'view-storage',
    },
  ),
);

interface Tab {
  key: string;
  label: string;
  children: React.ReactNode;
}

// Define la interfaz para el estado del TabManagerStore
interface TabManagerStoreState {
  tabState: Tab[];
  activeKey: string | '';
  areFilesModified: boolean;
  modifiedTabs: {
    [key: string]: {
      isModified: boolean;
    };
  };
}

// Define la interfaz para las acciones del TabManagerStore
interface TabManagerStoreActions {
  setActiveKey: (key: string | null) => void;
  addTab: (tab: Tab) => void;
  removeTab: (key: string, newKey: string | null) => void;
  setFilesModified: (modified: boolean) => void;
  setModifiedTabState: (tabKey: string) => void;
  removeModifiedTabState: (tabKey: string) => void;
  saveFile: () => void;
}

// Combina el estado y las acciones para el tipo completo del TabManagerStore
type TabManagerStore = TabManagerStoreState & TabManagerStoreActions;

// Define el StateCreator con los tipos correctos
const useTabManagerStore = create<TabManagerStore>()((set, get) => ({
  tabState: [],
  activeKey: '',
  areFilesModified: false,
  modifiedTabs: {},

  setActiveKey: (key) => set({ activeKey: key }),

  addTab: (tab: Tab) =>
    set((state) => ({
      tabState: [...state.tabState, tab],
      activeKey: tab.key,
    })),

  removeTab: (key: string, newKey: string | null) =>
    set((state) => ({
      tabState: state.tabState.filter((tab: Tab) => tab.key !== key),
      activeKey: newKey,
    })),

  setFilesModified: (modified: boolean) => set({ areFilesModified: modified }),

  setModifiedTabState: (tabKey: string) =>
    set((state) => ({
      modifiedTabs: {
        ...state.modifiedTabs,
        [tabKey]: { ...state.modifiedTabs[tabKey] },
      },
    })),

  removeModifiedTabState: (tabKey: string) =>
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
