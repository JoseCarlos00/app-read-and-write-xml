import {
  app,
  shell,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  globalShortcut,
} from 'electron';

import { join } from 'path';
import fs from 'node:fs/promises';

import { electronApp, optimizer, is } from '@electron-toolkit/utils';

const isDev = process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow | null = null;
let fileToOpenOnStartup: string | null = null; // Almacena la ruta del archivo si la app se inicia con uno

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../resources/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
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

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    // Si un archivo fue encolado para abrirse al inicio
    if (fileToOpenOnStartup) {
      openFileInApp(fileToOpenOnStartup);
      fileToOpenOnStartup = null; // Limpiar después de procesar
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  Menu.setApplicationMenu(null);

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  if (isDev) {
    // mainWindow.webContents.openDevTools();
  }
}

// --- Manejo de instancia única ---
const gotTheLock = app.requestSingleInstanceLock();
console.log({ gotTheLock });

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Alguien intentó ejecutar una segunda instancia, debemos enfocar nuestra ventana.
    const filePath = findFilePathInArgs(commandLine);
    if (filePath) {
      openFileInApp(filePath);
    } else if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // --- Windows/Linux: Comprobar argumentos de línea de comandos temprano ---
  if (process.platform !== 'darwin' && !fileToOpenOnStartup) {
    const cliFilePath = findFilePathInArgs(process.argv);
    if (cliFilePath) {
      fileToOpenOnStartup = cliFilePath;
    }
  }

  app.whenReady().then(() => {
    // Establecer el AppUserModelId para Windows (debe coincidir con appId en electron-builder.yml)
    electronApp.setAppUserModelId('com.electron.app');

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    globalShortcut.register('CommandOrControl+O', () => {
      console.log(
        'Atajo global Ctrl+O presionado. Implementar apertura de diálogo aquí si se desea.',
      );
      // Podrías llamar a una función que active el diálogo de 'open-file'
      // o enviar un mensaje al renderer para que lo haga.
      mainWindow?.webContents.send('open-file-dialog');
    });
    createWindow();
  });
}

app.on('activate', function () {
  // En macOS es común recrear una ventana en la aplicación cuando el
  // icono del dock es presionado y no hay otras ventanas abiertas.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// In this file you can include the rest of your app"s specific main process
// Maneja la apertura de archivos
ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [
      {
        name: 'XML Files',
        extensions: ['xml', 'shxmlp', 'shxml', 'rcxml', 'recxmlp'],
      },
    ],
    properties: ['openFile', 'multiSelections'], // Permite abrir múltiples archivos
  });

  if (canceled) return []; // Devuelve un array vacío si se cancela

  const files = [];
  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      files.push({ path: filePath, content });
    } catch (error) {
      console.error(`Error al leer el archivo: ${filePath}`, error);
      // Aquí podrías mostrar un mensaje de error al usuario
      files.push({ path: filePath, error: `No se pudo leer el archivo.` }); // Indica el error
    }
  }
  return files; // Devuelve un array de objetos con la ruta y el contenido (o error)
});

// Función para manejar la apertura de un archivo (llamada por varios disparadores)
async function openFileInApp(filePath: string): Promise<void> {
  console.log('openFileInApp', filePath);
  if (!mainWindow) {
    console.warn(
      'Ventana principal no disponible para abrir archivo, encolando:',
      filePath,
    );
    fileToOpenOnStartup = filePath; // Encolar si la ventana principal aún no está lista
    return;
  }
  // Asegurar que la ventana esté visible y enfocada
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();

  try {
    console.log(`Intentando abrir archivo desde el SO: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf-8');
    // Enviar al renderer. Define un nuevo canal IPC, ej: 'file-opened-by-os'
    mainWindow.webContents.send('file-opened-by-os', {
      path: filePath,
      content,
    });
  } catch (error: any) {
    console.error(
      `Error al leer el archivo especificado por el SO: ${filePath}`,
      error,
    );
    dialog.showErrorBox(
      'Error al abrir archivo',
      `No se pudo leer el archivo: ${filePath}\n${error.message}`,
    );
  }
}

// Ayudante para encontrar una ruta de archivo adecuada en los argumentos de la línea de comandos
function findFilePathInArgs(argv: string[]): string | null {
  console.log({ fileToOpenOnStartup });

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
      return arg;
    }
  }
  return null;
}
