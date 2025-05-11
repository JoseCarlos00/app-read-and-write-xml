import { Tabs } from 'antd';

import './TabsManager.css';
import useTabManager from '../hooks/useTabManager';

import { data } from '../mock/mock';
import ContentTab from './ContentTab';
import { useTabManagerStore } from '../store/viewStore';
import { useEffect } from 'react';

const initialItems = [
  {
    label: 'Tab 1',
    children: <ContentTab content={data} tabKey={'1'} />,
    key: '1',
  },
];

const TabsManager = () => {
  const { activeKey, items, onChange, onEdit } = useTabManager();

  const addTab = useTabManagerStore((state) => state.addTab);

  useEffect(() => {
    console.log({ initialItems });

    addTab(initialItems[0]);
  }, [addTab]);

  console.log('[TabsManager]:', { activeKey, items });

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
