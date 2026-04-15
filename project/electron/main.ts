import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import databaseService from '../src/services/database'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 处理窗口控制事件
  ipcMain.on('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
  })

  ipcMain.on('window:close', () => {
    if (mainWindow) {
      // 最小化到托盘而不是关闭
      mainWindow.hide()
    }
  })

  // 创建托盘
  createTray()
}

function createTray() {
  // 创建托盘图标
  const iconPath = path.join(__dirname, '../src/assets/icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        }
      }
    },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  // 设置托盘菜单
  tray.setContextMenu(contextMenu)

  // 设置托盘提示
  tray.setToolTip('电子女友')

  // 点击托盘图标切换窗口显示/隐藏
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})