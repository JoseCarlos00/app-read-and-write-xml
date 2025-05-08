import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);

    contextBridge.exposeInMainWorld('electronAPI', {
      openFile: () => ipcRenderer.invoke('open-file'),
      saveFile: (filePath, content) => {
        ipcRenderer.send('save-file', { filePath, content });
      },
      onFileSaved: (callback) => ipcRenderer.on('file-saved', callback), // Escucha el evento 'file-saved'
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
