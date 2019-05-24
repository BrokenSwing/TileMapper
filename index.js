const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { Manager, Project } = require('./tilemapper')

let win
let manager

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    })
    // Instanciate projects manager
    manager = new Manager(win)
    global.hasProject = false

    win.loadFile('index.html')

    win.webContents.openDevTools()

    win.on('ready-to-show', () => {
        win.show()
    })

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
    BrowserWindow.fromId(id).close()

    let save = false;
    if(manager.currentProject !== null) {
        let clickedButton = askForProjectSave()
        switch(clickedButton){
            case 0:
                save = true
                break
            case 1:
                save = false
                break
            case 2:
                return
        }
    }

    let project = new Project(settings.name)
    manager.openProject(project, save)
})

ipcMain.on('close-project', (event) => {
    let clickedButton = askForProjectSave()
    if(clickedButton < 2) {
        manager.closeProject(clickedButton === 0)
    }
})

function askForProjectSave() {
    return dialog.showMessageBox(win, {
        type: "question",
        buttons: ['&Sauvegarder', '&Ne pas sauvegarder', '&Annuler'],
        defaultId: 0,
        title: "Sauvegarder le projet en cours",
        detail: "Voulez-vous sauvegarder le projet actuellement ouvert ?",
        cancelId: 2,
        normalizeAccessKeys: true
    })
}