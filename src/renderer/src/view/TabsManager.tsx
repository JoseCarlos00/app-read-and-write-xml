import { Tabs } from 'antd';

import './TabsManager.css';
import useTabManager from '../hooks/useTabManager';
import { useViewStore } from '../store/viewStore';

const TabsManager = () => {
  const { activeKey, items, onChange, onEdit } = useTabManager();
  const viewEditor = useViewStore((state) => state.editorView);

  console.log('[TabsManager]:', { activeKey, items });

  const classNameTabs =
    viewEditor === 'summary'
      ? 'custom-tabs-manager view-summary'
      : 'custom-tabs-manager view-tree';

  return (
    <Tabs
      className={classNameTabs}
      type="editable-card"
      onChange={onChange}
      activeKey={activeKey}
      onEdit={onEdit}
      items={items}
      size="middle"
      tabPosition="top"
      // hideAdd={true}
    />
  );
};

export default TabsManager;
