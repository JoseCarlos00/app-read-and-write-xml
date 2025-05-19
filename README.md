# app-read-and-write-xml

An Electron application with React

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### // Send a message to the main process with no response

```javascript
window.electron.ipcRenderer.send('electron:say', 'hello');

// Send a message to the main process with the response asynchronously
window.electron.ipcRenderer.invoke('electron:doAThing', '').then((re) => {
  console.log(re);
});

// Receive messages from the main process
window.electron.ipcRenderer.on('electron:reply', (_, args) => {
  console.log(args);
});

// Remove a listener
const removeListener = window.electron.ipcRenderer.on(
  'electron:reply',
  (_, args) => {},
);
removeListener();
```

**Note**: If you're building your Electron app with TypeScript, you may want to get TypeScript intelliSense for the renderer process. So that you can create a `*.d.ts` declaration file and globally augment the `Window` interface:

```javascript
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
```

### API

### IpcRenderer

- `send`
- `sendTo`
- `sendSync`
- `sendToHost`
- `invoke`
- `postMessage`
- `on`
- `once`
- `removeAllListeners`
- `removeListener`

### WebFrame

- `insertCSS`
- `setZoomFactor`
- `setZoomLevel`

### WebUtils

- `getPathForFile`

### NodeProcess

- `platform` property
- `versions` property
- `env` property
