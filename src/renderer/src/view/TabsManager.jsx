import { Tabs } from 'antd';

import './TabsManager.css';
import useTabManager from '../hooks/useTabManager';

const TabsManager = () => {
  const { activeKey, items, onChange, onEdit } = useTabManager();

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
