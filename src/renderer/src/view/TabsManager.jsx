import { useCallback, useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';

import './TabsManager.css';
import ContentTab from './ContentTab';
import { data } from '../mock/mock';

const contentFile = data;

const initialItems = [
  {
    label: 'Tab 1',
    children: <ContentTab content={contentFile} tabKey={'1'} />,
    key: '1',
  },
];

const TabsManager = () => {
  const [activeKey, setActiveKey] = useState(initialItems[0].key);
  const [items, setItems] = useState(initialItems);
  const newTabIndex = useRef(0);

  const onChange = (key) => {
    setActiveKey(key);
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
  }, [items, setItems, setActiveKey]); // newTabIndex is a ref, its .current mutation doesn't need to be a dep for useCallback identity

  const remove = useCallback(
    (targetKey) => {
      let newActiveKeyCandidate = activeKey;
      let lastIndex = -1;

      // Find the index of the tab *before* the one being removed (in the original items list)
      items.forEach((item, i) => {
        if (item.key === targetKey) {
          lastIndex = i - 1;
        }
      });

      const newPanes = items.filter((item) => item.key !== targetKey);

      if (newPanes.length && newActiveKeyCandidate === targetKey) {
        // If the active tab is being removed
        if (lastIndex >= 0) {
          // The tab at lastIndex in the original list is now at that same index in newPanes,
          // assuming only one item (targetKey) was removed.
          newActiveKeyCandidate = newPanes[lastIndex].key;
        } else {
          // If the first tab was removed (lastIndex is -1), activate the new first tab
          newActiveKeyCandidate = newPanes[0].key;
        }
      } else if (newPanes.length === 0) {
        // If all tabs are removed
        newActiveKeyCandidate = null; // Or some other indicator for no active tab
      }
      // If a non-active tab is removed, activeKeyCandidate remains the current activeKey,
      // which is fine as long as that tab still exists.

      setItems(newPanes);
      setActiveKey(newActiveKeyCandidate);
    },
    [activeKey, items, setItems, setActiveKey],
  );

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      add();
    } else if (action === 'remove') {
      remove(targetKey);
    }
  };

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
  }, [activeKey, items, remove, setActiveKey]); // Dependencies for the effect

  return (
    <Tabs
      className="custom-tabs-manager"
      type="editable-card"
      onChange={onChange}
      activeKey={activeKey}
      onEdit={onEdit}
      items={items}
      size="middle"
    />
  );
};

export default TabsManager;
