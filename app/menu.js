// menu.js

const { app, Menu, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const constants = require('./constants');

const isMac = process.platform === 'darwin';

const template = [
  ...(isMac
    ? [{ role: 'appMenu' }]
    : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Change Assets Folder...',
        click: async () => {
          let assets_path = dialog.showOpenDialogSync({ title: 'Path To Assets', defaultPath: app.getPath('documents'), properties: ['openDirectory']});
          if (assets_path === undefined) return;
          else assets_path = assets_path[0];

          fs.promises.readFile(path.join(app.getPath('userData'), 'settings.json'), 'utf-8')
            .then((result) => { return JSON.parse(result) })
            .then((obj) => {
              obj['path.assets'] = assets_path;
              return obj;
            })
            .then((obj) => { return fs.promises.writeFile(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(obj), 'utf-8') })
            .then(() => {
              app.relaunch();
              app.exit();
            })
            .catch(() => {
              new Notification({ title: 'Path To Assets Folder Not Updated', body: 'Changes could not be saved', icon: path.join(constants.ICON_PATH, 'RCS.png') }).show();
            });
        },
      },
      {
        label: 'Change Output Folder...',
        click: async () => {
          let output_path = dialog.showOpenDialogSync({ title: 'Path To Output', defaultPath: app.getPath('documents'), properties: ['openDirectory']});
          if (output_path === undefined) return;
          else output_path = output_path[0];

          fs.promises.readFile(path.join(app.getPath('userData'), 'settings.json'), 'utf-8')
              .then((result) => { return JSON.parse(result) })
              .then((obj) => {
                obj['path.output'] = output_path;
                return obj;
              })
              .then((obj) => { return fs.promises.writeFile(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(obj), 'utf-8') })
              .then(() => {
                app.relaunch();
                app.exit();
              })
              .catch(() => {
                new Notification({ title: 'Path To Output Folder Not Updated', body: 'Changes could not be saved', icon: path.join(constants.ICON_PATH, 'RCS.png') }).show();
              });
        },
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { role: 'windowMenu' },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://electronjs.org');
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
