const { app, BrowserWindow, ipcMain } = require('electron')
const { Manager, Project } = require('./tilemapper')

let win
let manager

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    // Instanciate projects manager
    manager = new Manager(win)
    global.hasProject = false

    win.loadFile('index.html')

    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if(process.platform !== "darwin") {
        app.quit()
    }
})

app.on('activate', () => {
    if(win === null) {
        createWindow()
    }
})

// Project events listener

ipcMain.on('create-project', (event, id, settings) => {
    let project = new Project(settings.name)
    manager.openProject(project)
    BrowserWindow.fromId(id).close()
})