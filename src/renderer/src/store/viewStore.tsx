import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import ContentTab from '../view/ContentTab';
import { VIEWS_SUPPORTED } from '../consts';
import { type ViewsSupported } from '../types/types';

// Define la interfaz para el estado del ViewStore
interface ViewStoreState {
  editorView: ViewsSupported;
}

// Define la interfaz para las acciones del ViewStore
interface ViewStoreActions {
  setEditorView: (view: ViewsSupported) => void;
}

// Combina el estado y las acciones para el tipo completo del ViewStore
type ViewStore = ViewStoreState & ViewStoreActions;

const defaultView = VIEWS_SUPPORTED.TREE;

// Define el StateCreator con los tipos correctos

const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      editorView: defaultView,
      setEditorView: (view: ViewsSupported) => set({ editorView: view }),
    }),
    {
      name: 'view-storage',
    },
  ),
);

interface Tab {
  key: string;
  label: string;
  content: string;
}

// Define la interfaz para el estado del TabManagerStore
interface TabManagerStoreState {
  tabState: Tab[];
  activeKey: ActiveKeyType;
  areFilesModified: boolean;
  modifiedTabs: {
    [key: string]: {
      isModified: boolean;
    };
  };
}

type ActiveKeyType = string | undefined;

// Define la interfaz para las acciones del TabManagerStore
interface TabManagerStoreActions {
  setActiveKey: (key: string) => void;
  addTab: (tab: Tab) => void;
  removeTab: (key: string, newKey: string) => void;
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
  activeKey: undefined,
  areFilesModified: false,
  modifiedTabs: {},

  setActiveKey: (key) => {
    if (key) {
      set({ activeKey: key });
    }
  },

  addTab: (tab: Tab) => {
    const newTab = {
      ...tab,
      children: <ContentTab content={tab.content} tabKey={tab.key} />,
    };

    set((state) => ({
      tabState: [...state.tabState, newTab],
      activeKey: tab.key,
    }));
  },

  removeTab: (key, newKey) =>
    set((state) => ({
      tabState: state.tabState.filter((tab: Tab) => tab.key !== key),
      activeKey: newKey,
    })),

  setFilesModified: (modified: boolean) => set({ areFilesModified: modified }),

  setModifiedTabState: (tabKey) => {
    if (!tabKey) {
      return;
    }
    set((state) => ({
      modifiedTabs: {
        ...state.modifiedTabs,
        [tabKey]: { isModified: true },
      },
    }));
  },
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
