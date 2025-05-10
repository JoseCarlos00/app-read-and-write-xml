import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { parseString } from 'xml2js';

// Custom APIs for renderer
const customParseXmlAPI = {
  parseXML: (xml) => {
    let parser = null;

    parseString(xml, (err, result) => {
      if (!err) {
        parser = { status: 'success', data: result };
      } else {
        console.error('Error parsing XML:', err);
        parser = { error: true };
      }
    });

    return parser;
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('xml2jsAPI', customParseXmlAPI);

    contextBridge.exposeInMainWorld('electronAPI', {
      openFile: () => ipcRenderer.invoke('open-file'),
      saveFile: (filePath, content) => {
        ipcRenderer.send('save-file', { filePath, content });
      },
      onFileSaved: (callback) => ipcRenderer.on('file-saved', callback), // Escucha el evento 'file-saved'
    });

    contextBridge.exposeInMainWorld('ipcRenderer', {
      openFileEvent: (callback) => ipcRenderer.on('menu-open-file', callback),
      saveFileEvent: (callback) => ipcRenderer.on('menu-save-file', callback),
      saveFileAsEvent: (callback) =>
        ipcRenderer.on('menu-save-file-as', callback),
      openFileWindows: (callback) => ipcRenderer.on('file-opened', callback),
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.xml2jsAPI = customParseXmlAPI;
}
