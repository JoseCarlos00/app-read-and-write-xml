import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import {
  Builder,
  ParserOptions,
  BuilderOptions,
  parseStringPromise,
} from 'xml2js';

// --- Definición de Tipos ---

/**
 * Representa el resultado de una operación de parseo o construcción de XML.
 */
interface XmlOperationResult {
  status: 'success' | 'error';
  data?: string | object;
  error?: string;
}

/**
 * API para parsear y construir XML.
 */
interface Xml2jsAPI {
  parseXMLPromise: (xml: string) => Promise<XmlOperationResult>;
  buildXML: (jsObject: object) => XmlOperationResult;
}

/**
 * API personalizada expuesta al renderer para operaciones de archivo.
 */
interface CustomElectronAPI {
  openFile: () => Promise<string | undefined>;
  saveFile: (filePath: string, content: string) => void;
  onFileSaved: (
    callback: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => void;
}

/**
 * API para manejar eventos IPC específicos.
 */
interface CustomIpcRendererAPI {
  openFileEvent: (
    callback: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => void;
  saveFileEvent: (
    callback: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => void;
  saveFileAsEvent: (
    callback: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => void;
  openFileWindows: (
    callback: (
      event: IpcRendererEvent,
      filePath?: string,
      content?: string,
    ) => void,
  ) => void; // Ejemplo si 'file-opened' envía filePath y content
}

// --- Implementación de la API ---

// Custom APIs for renderer
const customParseXmlAPI: Xml2jsAPI = {
  // Versión mejorada de parseXML que devuelve una Promise
  async parseXMLPromise(xml) {
    try {
      if (!xml) {
        throw new Error('No XML-String provided for parsing.');
      }

      const parserOptions: ParserOptions = {
        explicitArray: false,
      };

      const result = await parseStringPromise(xml, parserOptions);
      return { status: 'success', data: result };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error parsing XML:', err);
      return { status: 'error', error: err?.message };
    }
  },

  buildXML: (jsObject) => {
    try {
      if (!jsObject) {
        throw new Error('No JavaScript object provided for building XML.');
      }

      const builderOptions: BuilderOptions = {
        headless: true,
      };

      const builder = new Builder(builderOptions);
      const xmlString = builder.buildObject(jsObject);

      return { status: 'success', data: xmlString };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
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
      saveFile: (filePath: string, content: string) => {
        ipcRenderer.send('save-file', { filePath, content });
      },

      onFileSaved: (
        callback: (event: IpcRendererEvent, ...args: any[]) => void,
      ) => ipcRenderer.on('file-saved', callback), // Escucha el evento 'file-saved'

      onFileOpenedByOS: (callback) =>
        ipcRenderer.on('file-opened-by-os', (_event, value) => callback(value)),
    });

    const exposedIpcRendererAPI: CustomIpcRendererAPI = {
      openFileEvent: (callback) => ipcRenderer.on('open-file-dialog', callback),
      saveFileEvent: (callback) => ipcRenderer.on('menu-save-file', callback),
      saveFileAsEvent: (callback) =>
        ipcRenderer.on('menu-save-file-as', callback),
      openFileWindows: (callback) =>
        ipcRenderer.on('file-opened', (_event, value) => callback(value)),
    };

    contextBridge.exposeInMainWorld('ipcRenderer', exposedIpcRendererAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.xml2jsAPI = customParseXmlAPI;
}

declare global {
  interface Window {
    xml2jsAPI: Xml2jsAPI;
    electronAPI: CustomElectronAPI;
    ipcRenderer: CustomIpcRendererAPI;
    electron: typeof electronAPI; // El tipo de electronAPI de @electron-toolkit/preload
  }
}
