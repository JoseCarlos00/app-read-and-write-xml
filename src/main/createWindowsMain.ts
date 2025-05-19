import { BrowserWindow, Menu, dialog } from 'electron/main';
import { shell } from 'electron/common';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import log from 'electron-log/main';

type OpenFileHandler = (
  filePath: string,
  windowInstance: BrowserWindow | null,
) => Promise<void> | void;
type OnFilesOpenedCallback = () => void;

export function createAppWindow(
  initialFilesToOpen: string[],
  openFileHandler: OpenFileHandler,
  onFilesOpened: OnFilesOpenedCallback,
): BrowserWindow {
  log.info('createAppWindow: Creando la ventana principal...');

  const newMainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: true,
    icon: join(__dirname, '../../resources/icon.ico'), // __dirname aquí es src/main
    backgroundColor: '#0d1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'), // ../preload es src/preload
      sandbox: false,
    },
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    titleBarOverlay: {
      color: '#1f1f1f',
      symbolColor: '#74b1be',
      height: 32,
    },
    frame: false,
  });

  Menu.setApplicationMenu(null);

  newMainWindow.on('ready-to-show', () => {
    log.info('[createAppWindow] Evento ready-to-show.');
    newMainWindow.show();
    log.info('[createAppWindow] Ventana mostrada.');

    if (initialFilesToOpen.length > 0) {
      log.info(
        `[createAppWindow] Procesando ${initialFilesToOpen.length} archivos para abrir al inicio.`,
      );
      initialFilesToOpen.forEach((filePath) =>
        openFileHandler(filePath, newMainWindow),
      );
      onFilesOpened(); // Llama al callback para limpiar la lista en index.ts
      log.info('[createAppWindow] Archivos iniciales procesados.');
    }
  });

  newMainWindow.webContents.setWindowOpenHandler((details) => {
    log.info(
      `[createAppWindow] Bloqueando nueva ventana para URL: ${details.url} y abriendo en shell.`,
    );
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  newMainWindow.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL) => {
      log.error(
        `[createAppWindow] Error al cargar URL: ${validatedURL}. Código: ${errorCode}. Descripción: ${errorDescription}`,
      );
      dialog.showErrorBox(
        'Error de Carga',
        `No se pudo cargar la URL: ${validatedURL}\n${errorDescription}`,
      );
    },
  );

  let loadPromise;
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    log.info(
      `[createAppWindow] Cargando URL de desarrollo: ${process.env['ELECTRON_RENDERER_URL']}`,
    );
    loadPromise = newMainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    const indexPath = join(__dirname, '../renderer/index.html'); // ../renderer es src/renderer
    log.info(`[createAppWindow] Cargando archivo de producción: ${indexPath}`);
    loadPromise = newMainWindow.loadFile(indexPath);
  }

  loadPromise
    .then(() => {
      log.info('[createAppWindow] Contenido cargado exitosamente.');
    })
    .catch((err) => {
      log.error('[createAppWindow] Error crítico al cargar contenido:', err);
      dialog.showErrorBox(
        'Error Crítico de Carga',
        `No se pudo cargar el contenido de la ventana principal: ${err.message}`,
      );
    });

  if (is.dev) newMainWindow.webContents.openDevTools();

  return newMainWindow;
}
