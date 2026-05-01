const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bayaroDesktop", {
  printHtml: (html) => ipcRenderer.invoke("bayaro:print-html", html),
});
