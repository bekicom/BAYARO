const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

function registerPrintHandler() {
  ipcMain.handle("bayaro:print-html", async (_event, html) => {
    if (!html || typeof html !== "string") {
      return { ok: false, message: "Print uchun ma'lumot topilmadi" };
    }

    const printWindow = new BrowserWindow({
      width: 900,
      height: 700,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    try {
      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      await new Promise((resolve) => setTimeout(resolve, 350));
      const result = await new Promise((resolve) => {
        printWindow.webContents.print(
          {
            silent: false,
            printBackground: true,
          },
          (success, failureReason) => {
            resolve({ ok: success, message: failureReason || "" });
          },
        );
      });
      return result;
    } finally {
      if (!printWindow.isDestroyed()) {
        printWindow.close();
      }
    }
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1366,
    height: 820,
    minWidth: 1100,
    minHeight: 720,
    fullscreen: true,
    title: "BAYARO",
    backgroundColor: "#071226",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    window.loadURL("http://127.0.0.1:5173");
  } else {
    window.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  registerPrintHandler();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
