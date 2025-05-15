import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import {
  parseString,
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
  parseXML: (xml: string) => XmlOperationResult | null; // Puede ser null debido a la lógica asíncrona mal manejada
  buildXML: (jsObject: object) => XmlOperationResult | null;
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
const customParseXmlAPI = {
  parseXML: (xml: string): XmlOperationResult | null => {
    let parserResult: XmlOperationResult | null = null;

    const parserOptions: ParserOptions = {
      explicitArray: false,
    };

    parseString(xml, parserOptions, (err: Error | null, result: string) => {
      if (!err) {
        parserResult = { status: 'success', data: result };
      } else {
        console.error('Error parsing XML:', err);
        parserResult = { status: 'error', error: err.message };
      }
    });

    return parserResult;
  },

  // Versión mejorada de parseXML que devuelve una Promise
  async parseXMLPromise(xml: string): Promise<XmlOperationResult> {
    try {
      const parserOptions: ParserOptions = {
        explicitArray: false,
      };

      const result = await parseStringPromise(xml, parserOptions);
      return { status: 'success', data: result };
    } catch (err: any) {
      console.error('Error parsing XML:', err);
      return { status: 'error', error: err.message };
    }
  },

  buildXML: (jsObject: object): XmlOperationResult => {
    try {
      const builderOptions: BuilderOptions = {
        headless: true,
      };

      const builder = new Builder(builderOptions);
      const xmlString = builder.buildObject(jsObject);

      return { status: 'success', data: xmlString };
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
    });

    const exposedIpcRendererAPI: CustomIpcRendererAPI = {
      openFileEvent: (callback) => ipcRenderer.on('menu-open-file', callback),
      saveFileEvent: (callback) => ipcRenderer.on('menu-save-file', callback),
      saveFileAsEvent: (callback) =>
        ipcRenderer.on('menu-save-file-as', callback),
      openFileWindows: (callback) => ipcRenderer.on('file-opened', callback), // Ajusta los params del callback según lo que envíes
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
