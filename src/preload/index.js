import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { parseString, Builder } from 'xml2js'; // Importa Builder

// Custom APIs for renderer
const customParseXmlAPI = {
  parseXML: (xml) => {
    let parserResult = null; // Renombrado para evitar confusión

    parseString(xml, (err, result) => {
      if (!err) {
        parserResult = { status: 'success', data: result };
      } else {
        console.error('Error parsing XML:', err);
        parserResult = { status: 'error', error: err.message };
      }
    });

    return parserResult;
  },

  buildXML: (jsObject) => {
    try {
      const builder = new Builder();
      const xmlString = builder.buildObject(jsObject);
      return { status: 'success', data: xmlString };
    } catch (err) {
      console.error('Error building XML:', err);
      return { status: 'error', error: err.message };
    }
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
