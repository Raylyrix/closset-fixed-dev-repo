const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({ width: 1280, height: 800 });
  const localDist = path.join(__dirname, 'web-dist', 'index.html');
  if (process.env.WEB_URL) {
    win.loadURL(process.env.WEB_URL);
  } else {
    win.loadFile(localDist);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


