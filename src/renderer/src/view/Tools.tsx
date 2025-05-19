import { Button, Flex, Radio, Divider, RadioChangeEvent } from 'antd';
import {
  ApartmentOutlined,
  FolderOpenOutlined,
  FundProjectionScreenOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import { useViewStore, useTabManagerStore } from '../store/viewStore';
import { useCallback } from 'react';

const Tools = () => {
  const selectedView = useViewStore((state) => state.editorView);
  const setEditorView = useViewStore((state) => state.setEditorView);
  const saveFile = useTabManagerStore((state) => state.saveFile);

  const addTab = useTabManagerStore((state) => state.addTab);

  const createTab = useCallback(
    (filePath, content) => {
      const nameFile = filePath.split('\\').pop(); // Muestra solo el nombre del archivo

      console.log({ filePath, nameFile });

      addTab({
        label: nameFile,
        content,
        key: filePath,
      });
    },
    [addTab],
  );

  const handleOpenFile = useCallback(async () => {
    const newFiles = await window.electronAPI.openFile(); // Usa la API expuesta
    // console.log('newFiles:', newFiles);

    if (newFiles && newFiles.length > 0) {
      newFiles.forEach((file) => {
        createTab(file.path, file.content);
      });
    }
  }, [createTab]);

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
        style={{ padding: 8, backgroundColor: '#1f1f1f', height: 38 }}
      >
        <Flex gap="small" wrap>
          <Radio.Group
            className="button-titlebar"
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
            className="button-titlebar"
            type="text"
            size="small"
            title="Abrir Archivo"
            icon={<FolderOpenOutlined />}
            onClick={handleOpenFile}
          />

          <Divider
            type="vertical"
            style={{ height: '20px', marginTop: '2px' }}
          />

          <Button
            className="button-titlebar"
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
            className="button-titlebar"
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
