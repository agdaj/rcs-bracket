// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fsAPI', {
  fetch: {
    characterList: () => ipcRenderer.invoke('fetch:character-list'),
    characterSelectScreen: (character) => ipcRenderer.invoke('fetch:character-select-screen', character),
    characterIcons: (character) => ipcRenderer.invoke('fetch:character-icons', character),
    characterRender: (character, skin) => ipcRenderer.invoke('fetch:character-render', character, skin),
    settingsObj: () => ipcRenderer.invoke('fetch:settings-obj'),
    playerObj: () => ipcRenderer.invoke('fetch:player-obj'),
  },
  save: {
    settingsObj: (obj) => ipcRenderer.invoke('save:settings-obj', obj),
    playerObj: (obj) => ipcRenderer.invoke('save:player-obj', obj),
    infoObj: (obj, fname) => ipcRenderer.invoke('save:info-obj', obj, fname),
    infoText: (text, fname) => ipcRenderer.invoke('save:info-text', text, fname),
    infoChar: (character, skin, fname) => ipcRenderer.invoke('save:info-char', character, skin, fname),
  }
});
