import { useEffect, useCallback } from 'react';

import { useTabManagerStore } from '../store/viewStore';

function OpenFile() {
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

  useEffect(() => {
    // Escuchar el evento desde el menú para abrir el archivo
    window.ipcRenderer.openFileEvent(handleOpenFile);
  }, [handleOpenFile]);

  return <></>;
}

export default OpenFile;
