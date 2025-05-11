import { useCallback, useEffect, useRef, useState } from 'react';
import { EditFilled, CloseOutlined } from '@ant-design/icons';

import ContentTab from '../view/ContentTab';

import { data } from '../mock/mock';
import { useModifiedStore } from '../store/viewStore';

const contentFile = data;

const initialItems = [
  {
    label: 'Tab 1',
    children: <ContentTab content={contentFile} tabKey={'1'} />,
    key: '1',
  },
];

function useTabManager() {
  const [items, setItems] = useState(initialItems);
  const [activeKey, setActiveKey] = useState(initialItems[0].key);
  const newTabIndex = useRef(0);
  const modifiedTabs = useModifiedStore((state) => state.tabStates);

  console.log('[useTabManager]');

  const onChange = (key) => {
    setActiveKey(key);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      add();
    } else if (action === 'remove') {
      remove(targetKey);
    }
  };

  const add = useCallback(() => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    const newPanes = [...items]; // Create a new array instance
    newPanes.push({
      label: 'New Tab',
      children: (
        <ContentTab
          content={'<Hello>Content of new Tab</Hello>'}
          tabKey={newActiveKey}
        />
      ),
      key: newActiveKey,
    });
    setItems(newPanes);
    setActiveKey(newActiveKey);
  }, [items, setItems, setActiveKey]);

  const remove = useCallback(
    (targetKey) => {
      let newActiveKeyCandidate = activeKey;
      let lastIndex = -1;

      // Busque el índice de la pestaña *anterior* a la que se va a eliminar (en la lista de elementos originales)
      items.forEach((item, i) => {
        if (item.key === targetKey) {
          lastIndex = i - 1;
        }
      });

      const newPanes = items.filter((item) => item.key !== targetKey);

      if (newPanes.length && newActiveKeyCandidate === targetKey) {
        if (lastIndex >= 0) {
          newActiveKeyCandidate = newPanes[lastIndex].key;
        } else {
          newActiveKeyCandidate = newPanes[0].key;
        }
      } else if (newPanes.length === 0) {
        newActiveKeyCandidate = null;
      }

      setItems(newPanes);
      setActiveKey(newActiveKeyCandidate);
    },
    [activeKey, items, setItems, setActiveKey],
  );

  // Eventos de teclado para los Tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+W or Ctrl+w to close current tab
      if (e.ctrlKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault();

        if (activeKey && items.find((item) => item.key === activeKey)) {
          // Ensure there's an active tab to remove
          remove(activeKey);
        }
        return;
      }

      // Ctrl+Tab to cycle tabs (Shift for reverse)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (!items || items.length === 0) return; // No tabs to cycle

        const currentIndex = items.findIndex((item) => item.key === activeKey);
        if (currentIndex === -1 && items.length > 0) {
          // If activeKey is somehow invalid, select the first
          setActiveKey(items[0].key);
          return;
        }
        const newIndex = e.shiftKey
          ? (currentIndex - 1 + items.length) % items.length
          : (currentIndex + 1) % items.length;
        setActiveKey(items[newIndex].key);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeKey, items, remove, setActiveKey]);

  const itemsWithIcons = items.map((item) => ({
    ...item,
    closeIcon: modifiedTabs[item.key] ? (
      <EditFilled style={{ color: '#fff' }} />
    ) : (
      <CloseOutlined />
    ),
  }));

  return { activeKey, items: itemsWithIcons, onChange, onEdit };
}

export default useTabManager;
