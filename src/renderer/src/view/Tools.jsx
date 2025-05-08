import {
  ApartmentOutlined,
  FundProjectionScreenOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Flex, Radio, Divider } from 'antd';
import { useState } from 'react';

const Tools = () => {
  // Estado para controlar la vista seleccionada. 'xml' es la vista por defecto.
  const [selectedView, setSelectedView] = useState('xml');

  const handleViewChange = (e) => {
    setSelectedView(e.target.value);
    // Aquí puedes agregar lógica adicional cuando cambie la vista,
    // por ejemplo, llamar a una función para actualizar el contenido principal.
    console.log('Vista seleccionada:', e.target.value);
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
            <Radio.Button value="xml" title="Vista XML">
              <ApartmentOutlined />
            </Radio.Button>
          </Radio.Group>

          <Divider type="vertical" />

          <Button
            type="text"
            size="small"
            title="Buscar"
            icon={<SearchOutlined />}
            onClick={() => console.log('Buscar clicked')}
          />

          <Divider type="vertical" />

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

const style = {
  defaultView: {
    backgroundColor: '#0078d4',
  },
};

export default Tools;
