import { useState } from 'react';
import { Tabs } from 'antd';

import './TabsManager.css';
import ContentTab from './ContentTab';
import { data } from '../mock/mock';
import useTabManager from '../hooks/useTabManager';

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

  const { add, remove } = useTabManager({
    items,
    activeKey,
    setActiveKey,
    setItems,
  });

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

  return (
    <Tabs
      className="custom-tabs-manager"
      type="editable-card"
      onChange={onChange}
      activeKey={activeKey}
      onEdit={onEdit}
      items={items}
      size="middle"
      // hideAdd={true}
    />
  );
};

export default TabsManager;
