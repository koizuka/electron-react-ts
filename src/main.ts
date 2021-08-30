import fs from 'fs';
import path from 'path';
import { BrowserWindow, app, session, dialog } from 'electron';
import { searchDevtools } from 'electron-search-devtools';
import { MyAPI } from './@types/MyAPI';
import { registerIpcMainHandler } from './IpcProxy';

const isDev = process.env.NODE_ENV === 'development';

/// #if DEBUG
const execPath =
  process.platform === 'win32'
    ? '../node_modules/electron/dist/electron.exe'
    : '../node_modules/.bin/electron';

if (isDev) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reload')(__dirname, {
    electron: path.resolve(__dirname, execPath),
    forceHardReset: true,
    hardResetMethod: 'exit',
  });
}
/// #endif

class MyApiServer implements MyAPI {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  async openDialog() {
    const dirPath = await dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
      })
      .then((result) => {
        if (result.canceled) return;
        return result.filePaths[0];
      })
      .catch((err) => console.log(err));

    if (!dirPath) return;

    return fs.promises
      .readdir(dirPath, { withFileTypes: true })
      .then((dirents) =>
        dirents
          .filter((dirent) => dirent.isFile())
          .map(({ name }) => path.join(dirPath, name)),
      );
  }
};

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    title: 'Electron',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.menuBarVisible = false;

  const myApi = new MyApiServer(mainWindow);

  registerIpcMainHandler<MyAPI>('my-api', myApi);

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

app.whenReady().then(async () => {
  if (isDev) {
    const devtools = await searchDevtools('REACT');
    if (devtools) {
      await session.defaultSession.loadExtension(devtools, {
        allowFileAccess: true,
      });
    }
  }

  createWindow();
});

app.once('window-all-closed', () => app.quit());
