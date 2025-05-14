import { Tabs } from 'antd';

import './TabsManager.css';
import useTabManager from '../hooks/useTabManager';

const TabsManager = () => {
  const { activeKey, items, onChange, onEdit } = useTabManager();

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
