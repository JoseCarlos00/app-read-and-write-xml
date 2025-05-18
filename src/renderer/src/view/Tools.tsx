import { Button, Flex, Radio, Divider, RadioChangeEvent } from 'antd';
import {
  ApartmentOutlined,
  FundProjectionScreenOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import { useViewStore, useTabManagerStore } from '../store/viewStore';

const Tools = () => {
  const selectedView = useViewStore((state) => state.editorView);
  const setEditorView = useViewStore((state) => state.setEditorView);
  const saveFile = useTabManagerStore((state) => state.saveFile);

  console.log('Tools', { selectedView });

  const handleViewChange = (e: RadioChangeEvent) => {
    setEditorView(e.target.value);
  };

  const handleSaveFile = () => {
    saveFile();
  };

  return (
    <>
      <Flex
        gap="small"
        align="flex-start"
        vertical
        style={{ paddingBlock: '4px', backgroundColor: '#0d1117' }}
      >
        <Flex gap="small" wrap>
          <Radio.Group
            value={selectedView}
            onChange={handleViewChange}
            size="small"
          >
            <Radio.Button value="summary" title="Vista Resumen">
              <FundProjectionScreenOutlined />
            </Radio.Button>

            <Radio.Button value="tree" title="Vista XML">
              <ApartmentOutlined />
            </Radio.Button>
          </Radio.Group>

          <Divider
            type="vertical"
            style={{ height: '20px', marginTop: '2px' }}
          />

          <Button
            type="text"
            size="small"
            title="Buscar"
            icon={<SearchOutlined />}
            onClick={() => console.log('Buscar')}
          />

          <Divider
            type="vertical"
            style={{ height: '20px', marginTop: '2px' }}
          />

          <Button
            type="text"
            size="small"
            title="Guardar"
            icon={<SaveOutlined />}
            onClick={handleSaveFile}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default Tools;
