import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  globalShortcut,
} from 'electron/main';
import { shell } from 'electron/common';
import fs from 'fs/promises';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import log from 'electron-log/main';

import { openFile } from './utils';

// Inicializar el logger
// Configura el logger para guardar los logs en un archivo
log.transports.file.resolvePathFn = () =>
  join(app.getPath('userData'), 'logs', 'main.log');
log.transports.file.level = 'info';
log.info('Log from the main process');

let mainWindow: BrowserWindow | null = null;
let filesToOpenOnStartup: string[] = []; // Almacena las rutas de los archivos si la app se inicia con ellos

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: true, // Mantener esto para evitar el parpadeo inicial
    icon: join(__dirname, '../../resources/icon.ico'),
    backgroundColor: '#0d1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    // --- Inicio: Pruebas de diagnóstico ---
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    titleBarOverlay: {
      color: '#1f1f1f',
      symbolColor: '#74b1be',
      height: 32,
    },
    frame: false,
    // --- Fin: Pruebas de diagnóstico ---
  });
  Menu.setApplicationMenu(null);

  mainWindow.on('ready-to-show', () => {
    console.log(
      '[createWindow] Evento ready-to-show disparado. Mostrando ventana.',
      { filesToOpenOnStartup },
    );

    log.info('[createWindow] Evento ready-to-show disparado.');
    log.info('Mostrando ventana.');

    mainWindow?.show();
    // Si archivos fueron encolados para abrirse al inicio
    if (filesToOpenOnStartup.length > 0) {
      filesToOpenOnStartup.forEach((filePath) => openFileInApp(filePath));
      filesToOpenOnStartup = []; // Limpiar después de procesar
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Log para depuración de la carga de contenido
  console.log(`[createWindow] Modo desarrollo (is.dev): ${is.dev}`);
  console.log(
    `[createWindow] ELECTRON_RENDERER_URL: ${process.env['ELECTRON_RENDERER_URL']}`,
  );

  mainWindow.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `[webContents] Error al cargar URL: ${validatedURL}. Código: ${errorCode}. Descripción: ${errorDescription}`,
      );
      log.error(
        `[webContents] Error al cargar URL: ${validatedURL}. Código: ${errorCode}. Descripción: ${errorDescription}`,
      );
      dialog.showErrorBox(
        'Error de Carga',
        `No se pudo cargar la URL: ${validatedURL}\n${errorDescription}`,
      );
    },
  );

  let loadPromise;
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log(
      `[createWindow] Cargando URL: ${process.env['ELECTRON_RENDERER_URL']}`,
    );
    loadPromise = mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    const indexPath = join(__dirname, '../renderer/index.html');
    console.log(`[createWindow] Cargando archivo: ${indexPath}`);
    loadPromise = mainWindow.loadFile(indexPath);
  }

  loadPromise
    .then(() => {
      console.log('[createWindow] Contenido cargado exitosamente.');
    })
    .catch((err) => {
      console.error('[createWindow] Error al cargar contenido:', err);
      log.error('[createWindow] Error al cargar contenido:', err);
      dialog.showErrorBox(
        'Error Crítico de Carga',
        `No se pudo cargar el contenido de la ventana principal: ${err.message}`,
      );
      // Considera cerrar la app si la carga es crítica y falla
      // app.quit();
    });

  if (is.dev) {
    // Ayuda a depurar problemas del renderer
    mainWindow.webContents.openDevTools();
  }
}

// --- Manejo de instancia única ---
const gotTheLock = app.requestSingleInstanceLock();
console.log({ gotTheLock });

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_, argv) => {
    // Alguien intentó ejecutar una segunda instancia, debemos enfocar nuestra ventana.
    const filePaths = findFilePathsInArgs(argv);

    if (filePaths.length > 0) {
      filePaths.forEach((filePath) => openFileInApp(filePath));
    } else if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // --- Windows/Linux: Comprobar argumentos de línea de comandos temprano para múltiples archivos ---
  if (process.platform !== 'darwin' && filesToOpenOnStartup.length === 0) {
    const cliFilePaths = findFilePathsInArgs(process.argv);
    if (cliFilePaths.length > 0) {
      filesToOpenOnStartup = cliFilePaths;
    }
  }

  app.whenReady().then(() => {
    // Create the main window first
    createWindow();

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron.app');

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    globalShortcut.register('CommandOrControl+O', () => {
      console.log(
        'Atajo global Ctrl+O presionado. Implementar apertura de dialog here si se desea.',
      );
      // Podrías llamar a una función que active el diálogo de 'open-file'
      // o enviar un mensaje al renderer para que lo haga.
      mainWindow?.webContents.send('open-file-dialog');
    });

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    log.info(`Checking for updates. Current version ${app.getVersion()}`);
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// Maneja la apertura de archivos
ipcMain.handle('open-file', () => openFile(mainWindow));

//Global exception handler
process.on('uncaughtException', function (err) {
  console.log('Error no controlado:', err);
  log.error('Error no controlado:', err);
});

// Ayudante para encontrar una ruta de archivo adecuada en los argumentos de la línea de comandos
function findFilePathsInArgs(argv: string[]): string[] {
  console.log('findFilePathsInArgs procesando argv:', argv);

  const foundFiles: string[] = [];
  const supportedExtensions = [
    '.xml',
    '.shxmlp',
    '.shxml',
    '.rcxml',
    '.recxmlp',
  ];
  // Omitir argv[0] (ejecutable). En dev, argv[1] podría ser '.'
  for (const arg of argv.slice(1)) {
    // Omitir opciones (como --inspect) y la ruta del script principal en dev ('.')
    if (arg === '.' || arg.startsWith('--') || arg.startsWith('/-')) {
      continue;
    }
    if (supportedExtensions.some((ext) => arg.toLowerCase().endsWith(ext))) {
      foundFiles.push(arg);
    }
  }
  return foundFiles;
}

function openFileInApp(filePath: string) {
  console.log('openFileInApp', { filePath });

  if (mainWindow) {
    fs.readFile(filePath, 'utf-8')
      .then((content) => {
        mainWindow?.webContents.send('file-opened', {
          path: filePath,
          content,
        });
      })
      .catch((error) => {
        console.error(
          'Error al abrir el archivo desde la línea de comandos:',
          error,
        );
        mainWindow?.webContents.send('file-open-error', {
          path: filePath,
          error: 'No se pudo abrir el archivo.',
        });
      });
  } else {
    console.warn(
      'mainWindow no está disponible al intentar abrir el archivo:',
      filePath,
    );
    // Considera mostrar un diálogo de error si mainWindow no está listo
    dialog.showErrorBox(
      'Error al abrir archivo',
      'La ventana principal no está lista para abrir archivos.',
    );
  }
}
