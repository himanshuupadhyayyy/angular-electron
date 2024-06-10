const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  // Create a session object to share between windows
  const sharedSession = session.fromPartition('persist:shared-session');

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      session: sharedSession, // Use the shared session
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, 'src', 'index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow.loadURL(startUrl);

  ipcMain.on('open-presentation-by-id', (event, route) => {
    const presentationWindow = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
      }
    });
    
    const presentationPath = path.join(__dirname, 'src');
    const presentationUrl = process.env.ELECTRON_START_URL || `file://${presentationPath}/${route}`;

    console.log('open-presentation-by-id', presentationUrl);
    presentationWindow.loadURL(presentationUrl);
  });

  ipcMain.on('open-presentation-by-route', (event, route) => {
    const presentationWindow = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
      }
    });

    const presentationPath = path.join(__dirname, 'src', 'index.html');
    const presentationUrl = `file://${presentationPath}#/${route}`;

    console.log('open-presentation-by-route', presentationUrl);
    presentationWindow.loadURL(presentationUrl);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
