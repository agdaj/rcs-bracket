// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const constants = require('./constants');
require('./menu');

// White pixel
const BLANK_IMG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

const CHARACTERS_NOT_FOUND_TITLE = 'Characters Not Found';
const CHARACTERS_NOT_FOUND_BODY = `Assets could not be loaded`;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 540,
    icon: path.join(constants.ICON_PATH, 'RCS.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // then load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  let settings;

  // Load settings if app has been previously run
  // Else, let user set settings and save into settings.json
  try {
    settings = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'settings.json'), 'utf-8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      dialog.showMessageBoxSync({ message: 'Hello!\nBefore using this app, please start by initializing your settings', type: 'info', icon: path.join(constants.ICON_PATH, 'RCS.png'), detail: 'SETTINGS_NOT_FOUND' });

      dialog.showMessageBoxSync({ message: 'First, please select the directory where assets can be retrieved from', type: 'info', icon: path.join(constants.ICON_PATH, 'RCS.png'), detail: 'SET_ASSETS_PATH' });
      let assets_path = dialog.showOpenDialogSync({ title: 'Path To Assets', defaultPath: app.getPath('documents'), properties: ['openDirectory']});
      if (assets_path === undefined) throw 'Assets path not set';
      else assets_path = assets_path[0];

      dialog.showMessageBoxSync({ message: 'Next, please select the directory where output will be saved to', type: 'info', icon: path.join(constants.ICON_PATH, 'RCS.png'), detail: 'SET_OUTPUT_PATH' });
      let output_path = dialog.showOpenDialogSync({ title: 'Path To Output', defaultPath: app.getPath('documents'), properties: ['openDirectory']});
      if (output_path === undefined) throw 'Output path not set';
      else output_path = output_path[0];

      settings = {
        'path.assets': assets_path,
        'path.output': output_path,
        'api.token': '',
        'save.format': 'json'
      }

      fs.writeFileSync(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(settings), 'utf-8');
      dialog.showMessageBoxSync({ message: 'Settings have been saved successfully', type: 'info', icon: path.join(constants.ICON_PATH, 'RCS.png'), detail: 'SETTINGS_SAVED' });
    } else {
      throw err;
    }
  }

  // Set IPC handlers.
  ipcMain.handle('fetch:character-list', () => {
    return fs.promises.readFile(path.join(settings['path.assets'], 'character-list.json'), 'utf-8')
            .then((result) => { return JSON.parse(result) })
            .catch(() => {
              new Notification({ title: `${CHARACTERS_NOT_FOUND_TITLE} (fetch:character-list)`, body: CHARACTERS_NOT_FOUND_BODY, icon: path.join(constants.ICON_PATH, 'RCS.png') }).show();
              return [];
            });
  });
  ipcMain.handle('fetch:character-select-screen', (_, character) => {
    return fs.promises.readFile(path.join(settings['path.assets'], 'character-select-screen', character + '.png'))
            .then((result) => { return result.toString('base64') })
            .catch(() => {
              new Notification({ title: `${CHARACTERS_NOT_FOUND_TITLE} (fetch:character-select-screen)`, body: CHARACTERS_NOT_FOUND_BODY, icon: path.join(constants.ICON_PATH, 'RCS.png') }).show();
              return BLANK_IMG;
            });
  });
  ipcMain.handle('fetch:character-icons', (_, character) => {
    return fs.promises.readdir(path.join(settings['path.assets'], 'stock-icons', character), { withFileTypes: true })
            .then((result) => {
              return result
                      .filter(dirent => dirent.isFile())
                      .map(dirent => {
                        return {
                          name: dirent.name,
                          base64: fs.readFileSync(path.join(settings['path.assets'], 'stock-icons', character, dirent.name)).toString('base64')
                        }
                      });
            })
            .catch(() => {
              new Notification({ title: `${CHARACTERS_NOT_FOUND_TITLE} (fetch:character-icons)`, body: CHARACTERS_NOT_FOUND_BODY, icon: path.join(constants.ICON_PATH, 'RCS.png') }).show();
              return [];
            });
  });
  ipcMain.handle('fetch:character-render', (_, character, skin) => {
    return fs.promises.readFile(path.join(settings['path.assets'], 'renders', character, skin))
            .then((result) => { return result.toString('base64') })
            .catch(() => {
              new Notification({ title: `${CHARACTERS_NOT_FOUND_TITLE} (fetch:character-render)`, body: CHARACTERS_NOT_FOUND_BODY, icon: path.join(constants.ICON_PATH, 'RCS.png') }).show();
              return BLANK_IMG;
            });
  });
  ipcMain.handle('fetch:settings-obj', () => {
    return settings;
  });
  ipcMain.handle('fetch:player-obj', () => {
    return fs.promises.readFile(path.join(app.getPath('userData'), 'players.json'), 'utf-8')
            .then((result) => { return JSON.parse(result) })
            .catch(() => { return {} });
  });
  ipcMain.handle('fetch:custom-fields-obj', () => {
    return fs.promises.readFile(path.join(app.getPath('userData'), 'custom_fields.json'), 'utf-8')
            .then((result) => { return JSON.parse(result) })
            .catch(() => { return {} });
  });
  ipcMain.handle('save:settings-obj', (_, obj) => {
    return fs.promises.writeFile(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(obj), 'utf-8')
            .then(() => {
              settings = obj;
              return true;
            })
            .catch(() => { return false });
  });
  ipcMain.handle('save:player-obj', (_, obj) => {
    return fs.promises.writeFile(path.join(app.getPath('userData'), 'players.json'), JSON.stringify(obj), 'utf-8')
            .then(() => { return true })
            .catch(() => { return false });
  });
  ipcMain.handle('save:custom-fields-obj', (_, obj) => {
    return fs.promises.writeFile(path.join(app.getPath('userData'), 'custom_fields.json'), JSON.stringify(obj), 'utf-8')
            .then(() => { return true })
            .catch(() => { return false });
  });
  ipcMain.handle('save:info-obj', (_, obj, fname) => {
    return fs.promises.writeFile(path.join(settings['path.output'], path.basename(fname)), JSON.stringify(obj), 'utf-8')
            .then(() => { return true })
            .catch(() => { return false });
  });
  ipcMain.handle('save:info-text', (_, text, fname) => {
    return fs.promises.writeFile(path.join(settings['path.output'], path.basename(fname)), text, 'utf-8')
            .then(() => { return true })
            .catch(() => { return false });
  });
  ipcMain.handle('save:info-char', (_, character, skin, fname) => {
    return fs.promises.copyFile(path.join(settings['path.assets'], 'stock-icons', character, skin), path.join(settings['path.output'], path.basename(fname)))
            .then(() => { return true })
            .catch(() => { return false });
  });

  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(() => { app.exit() });

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
