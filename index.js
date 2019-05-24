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
    if(manager.currentProject) {
        let clickedButton = askForProjectSave()
        if(clicked > 1)
            return
        save = clickedButton == 0
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

ipcMain.on('open-project', (event) => {
    dialog.showOpenDialog(win, {
        title: "Ouvrir un projet",
        filters: [
            { name: "TileMapper project", extensions: ['tmproj'] }
        ],
        properties: [ "openFile" ],
        message: "Selection du fichier du projet TileMapper"
    }, (paths) => {
        if(paths) {
            let path = paths[0]

            Project.fromFile(path, (err, project) => {
                if(err) {
                    dialog.showMessageBox(win, {
                        type: 'error',
                        title: 'Erreur',
                        message: `Erreur lors du chargement du projet. ${err}`
                    })
                } else {
                    let save = false
                    if(manager.currentProject) {
                        let buttonClicked = askForProjectSave()
                        if(buttonClicked > 1) 
                            return
                        save = buttonClicked === 0
                    }
                    manager.openProject(project, save)
                }
            })
        }
    })
})

// TODO Verify if project changed before calling this function.
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