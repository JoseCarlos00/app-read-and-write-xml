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

app
  .whenReady()
  .then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron');

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    globalShortcut.register('CommandOrControl+O', () => {
      console.log('Electron loves global shortcuts!');
    });
  })
  .then(createWindow);

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
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

// Maneja el guardado de archivos
ipcMain.on('save-file', (event, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content);
    event.sender.send('file-saved', { filePath, success: true }); // Envia confirmación
  } catch (error) {
    console.error(`Error al guardar el archivo: ${filePath}`, error);
    event.sender.send('file-saved', {
      filePath,
      success: false,
      error: error.message,
    }); // Envia error
  }
});
