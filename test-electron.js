const { app, BrowserWindow } = require('electron');

console.log('App:', !!app);
console.log('BrowserWindow:', !!BrowserWindow);

app.whenReady().then(() => {
  console.log('App is ready!');
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL('https://www.google.com');
});
