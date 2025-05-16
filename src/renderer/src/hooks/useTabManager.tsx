import { useCallback, useEffect, useRef } from 'react';
import { EditFilled, CloseOutlined } from '@ant-design/icons';

import ContentTab from '../view/ContentTab';

import { useTabManagerStore } from '../store/viewStore';

function useTabManager() {
  const tabState = useTabManagerStore((state) => state.tabState);
  const modifiedTabs = useTabManagerStore((state) => state.modifiedTabs);
  const addTab = useTabManagerStore((state) => state.addTab);
  const removeTabStore = useTabManagerStore((state) => state.removeTab);
  const activeKey = useTabManagerStore((state) => state.activeKey);
  const setActiveKey = useTabManagerStore((state) => state.setActiveKey);

  const newTabIndex = useRef(0);

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const onEdit = (
    targetKeyOrEvent: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove',
  ) => {
    if (action === 'add') {
      add();
    } else if (
      action === 'remove' &&
      typeof targetKeyOrEvent === 'string' &&
      targetKeyOrEvent
    ) {
      remove(targetKeyOrEvent);
    }
  };

  const add = useCallback(() => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    addTab({
      label: 'New Tab',
      children: (
        <ContentTab
          content={`<Hello>Content of new Tab ${newActiveKey}</Hello>`}
          tabKey={newActiveKey}
        />
      ),
      key: newActiveKey,
    });
  }, [addTab]);

  const remove = useCallback(
    (targetKey: string) => {
      let newActiveKeyCandidate = activeKey;
      let lastIndex = -1;

      tabState.forEach((item, i) => {
        if (item.key === targetKey) {
          lastIndex = i - 1;
        }
      });

      const newPanes = tabState.filter((item) => item.key !== targetKey);
      if (newPanes.length && newActiveKeyCandidate === targetKey) {
        newActiveKeyCandidate =
          lastIndex >= 0 ? newPanes[lastIndex].key : newPanes[0].key;
      } else if (newPanes.length === 0) {
        newActiveKeyCandidate = null;
      }

      removeTabStore(targetKey, newActiveKeyCandidate);
    },
    [activeKey, tabState, removeTabStore],
  );

  // Eventos de teclado para los Tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+W or Ctrl+w to close current tab
      if (e.ctrlKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault();

        if (activeKey && tabState.find((item) => item.key === activeKey)) {
          // Ensure there's an active tab to remove
          remove(activeKey);
        }
        return;
      }

      // Ctrl+Tab to cycle tabs (Shift for reverse)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (!tabState || tabState.length === 0) return; // No tabs to cycle

        const currentIndex = tabState.findIndex(
          (item) => item.key === activeKey,
        );
        if (currentIndex === -1 && tabState.length > 0) {
          // If activeKey is somehow invalid, select the first
          setActiveKey(tabState[0].key);
          return;
        }
        const newIndex = e.shiftKey
          ? (currentIndex - 1 + tabState.length) % tabState.length
          : (currentIndex + 1) % tabState.length;
        setActiveKey(tabState[newIndex].key);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeKey, tabState, remove, setActiveKey]);

  const itemsWithIcons = tabState.map((item) => ({
    ...item,
    closeIcon: modifiedTabs[item.key] ? (
      <EditFilled style={{ color: '#fff' }} />
    ) : (
      <CloseOutlined />
    ),
  }));

  console.log('[useTabManager]:', {
    tabState,
    modifiedTabs,
    activeKey,
    items: itemsWithIcons,
  });

  return { activeKey, items: itemsWithIcons, onChange, onEdit };
}

export default useTabManager;
