- Renderer (ej. tu componente Vue/React de la barra de título):

```html
<!-- Ejemplo en HTML -->
<div class="titlebar">
  <div class="title">Mi Aplicación</div>
  <div class="controls">
    <button id="minimize-btn">-</button>
    <button id="maximize-btn">[]</button>
    <button id="close-btn">X</button>
  </div>
</div>
```

```javascript
// En tu script del renderer (ej. asociado al preload o en tu app Vue/React)
document.getElementById('minimize-btn').addEventListener('click', () => {
  window.electronAPI.minimizeWindow(); // Suponiendo que expones esto vía preload
});
document.getElementById('maximize-btn').addEventListener('click', () => {
  window.electronAPI.maximizeWindow();
});
document.getElementById('close-btn').addEventListener('click', () => {
  window.electronAPI.closeWindow();
});
```

- Preload Script (`preload/index.js`)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  // ... y otros que necesites
});
```

- Main Process (`main/index.ts`)

```typescript
// ... en tu archivo main/index.ts
ipcMain.on('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow?.close();
});
```

**Recomendación:**
Si la ausencia del parpadeo es crítica, y `frame: false` (o `titleBarStyle: 'hidden'`) rompe `ready-to-show`:

1. Prueba la opción de `backgroundColor` junto con `show: true` (o `show: false` comentado). Esto suele ser el compromiso más aceptable.
2. Asegúrate de que tu `frame: false` es la configuración que deseas. Si solo quieres ocultar el título pero mantener los botones nativos (en macOS, por ejemplo), `titleBarStyle: 'hidden'` (sin `frame: false`) podría ser una opción, aunque también puede tener sus propias peculiaridades con `ready-to-show`.

Dado que tu objetivo principal son los controles personalizados, `frame: false` es la ruta más común. Si esto choca con `ready-to-show`, la mitigación del parpadeo con `backgroundColor` es el siguiente mejor paso.
