import { useEffect, useCallback } from 'react';

function OpenFile() {
  const createTab = useCallback((filePath) => {
    const nameFile = filePath.split('\\').pop(); // Muestra solo el nombre del archivo

    console.log({ filePath, nameFile });
  }, []);

  const handleOpenFile = useCallback(async () => {
    const newFiles = await window.electronAPI.openFile(); // Usa la API expuesta
    // console.log('newFiles:', newFiles);

    if (newFiles && newFiles.length > 0) {
      newFiles.forEach((file) => {
        createTab(file.path);
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
