import {
  ApartmentOutlined,
  FundProjectionScreenOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Flex, Radio, Divider } from 'antd';
import useViewStore from '../store/viewStore';

const Tools = () => {
  const selectedView = useViewStore((state) => state.editorView);
  const setEditorView = useViewStore((state) => state.setEditorView);

  const handleViewChange = (e) => {
    setEditorView(e.target.value);
  };

  return (
    <>
      <Flex
        gap="small"
        align="flex-start"
        vertical
        style={{ paddingBlock: '4px' }}
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
            onClick={() => console.log('Buscar clicked')}
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
            onClick={() => console.log('Guardar clicked')}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default Tools;
