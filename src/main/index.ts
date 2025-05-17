import { app, shell, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

import fs from 'node:fs/promises';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  Menu.setApplicationMenu(mainMenu);

  mainWindow.webContents.on('context-menu', () => {
    contextTemplate.popup(mainMenu.webContents);
  });

  mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  // Abrir herramientas de desarrollo en modo DEV
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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

// Crear el menú de la aplicación
const mainMenu = Menu.buildFromTemplate([
  {
    label: 'Archivo',
    submenu: [
      {
        label: 'Abrir archivo',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          mainWindow.webContents.send('menu-open-file');
        },
      },
      {
        label: 'Guardar archivo',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('menu-save-file');
        },
      },
      {
        label: 'Guardar Archivo Como',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: () => {
          mainWindow.webContents.send('menu-save-file-as');
        },
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  },
  // { role: 'viewMenu' }
  isDev
    ? {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      }
    : '',
]);

const contextTemplate = Menu.buildFromTemplate([
  {
    label: 'Abrir archivo',
    accelerator: 'CmdOrCtrl+O',
    click: () => {
      mainWindow.webContents.send('menu-open-file');
    },
  },
  {
    label: 'Guardar archivo',
    accelerator: 'CmdOrCtrl+S',
    click: () => {
      mainWindow.webContents.send('menu-save-file');
    },
  },
  {
    label: 'Guardar Archivo Como',
    accelerator: 'CmdOrCtrl+Shift+S',
    click: () => {
      mainWindow.webContents.send('menu-save-file-as');
    },
  },
  {
    type: 'separator',
  },
  {
    role: 'close',
  },
  {
    role: 'reload',
  },
]);
