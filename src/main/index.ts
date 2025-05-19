import { electronApp, optimizer } from '@electron-toolkit/utils';
import log from 'electron-log/main';
import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron/main';

import { join } from 'path';
import { openFile, findFilePathsInArgs, openFileInApp } from './utils';
import { createAppWindow } from './createWindowsMain';

// Inicializar el logger
// Configura el logger para guardar los logs en un archivo
log.transports.file.resolvePathFn = () =>
  join(app.getPath('userData'), 'logs', 'main.log');
log.transports.file.level = 'info';
log.info('Logger inicializado en el proceso principal.');

let mainWindow: BrowserWindow | null = null;
let filesToOpenOnStartup: string[] = []; // Almacena las rutas de los archivos si la app se inicia con ellos

// --- Manejo de instancia única ---
const gotTheLock = app.requestSingleInstanceLock();
console.log({ gotTheLock });

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_, argv) => {
    // Alguien intentó ejecutar una segunda instancia, debemos enfocar nuestra ventana.
    const filePaths = findFilePathsInArgs(argv);
    // Asegúrate de que mainWindow se refiera a la instancia correcta aquí.
    // Si mainWindow aún no está creado, podrías encolar estos archivos.
    // Por ahora, asumimos que mainWindow ya existe o será creado pronto.
    // La lógica de `openFileInApp` ya maneja si mainWindow es null.

    if (filePaths.length > 0) {
      filePaths.forEach((filePath) => openFileInApp(filePath, mainWindow));
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
    mainWindow = createAppWindow(
      [...filesToOpenOnStartup], // Pasar una copia para que la función de creación la maneje
      (filePath, winInstance) => openFileInApp(filePath, winInstance),
      () => {
        filesToOpenOnStartup = []; // Limpiar la lista original después de que se procesen
      },
    );
    log.info('Ventana principal creada.');

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
      if (BrowserWindow.getAllWindows().length === 0 && !mainWindow)
        mainWindow = createAppWindow([], openFileInApp, () => {}); // Crear si no existe ninguna
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
