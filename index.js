const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { Manager, Project, TileSet } = require('./tilemapper')
const fs = require('fs')
const path = require('path')

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
    if(settings.rows >= 1 && settings.columns >= 1 && settings.name.length > 0) {
        requestForProjectSaveIfNeeded().then((doSave) => {
            let project = new Project(settings.name, settings.columns, settings.rows)
            manager.openProject(project, doSave)
        }).catch((e) => {})   
    }

})

ipcMain.on('save-project', (event) => {
    requestForSavePathIfNeeded().then(() => {
        if(manager.currentProject) {
            manager.currentProject.save()
        }
    }).catch((e) => {})
})

ipcMain.on('close-project', (event) => {
    requestForProjectSaveIfNeeded().then((doSave) => {
        manager.closeProject(doSave)
    }).catch((e) => {})
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
                    requestForProjectSaveIfNeeded().then((doSave) => {
                        manager.openProject(project, doSave)
                    }).catch((e) => {})
                }
            })
        }
    })
})

ipcMain.on('open-tileset', (event, id, settings) => {
    BrowserWindow.fromId(id).close()
    if(settings.path.length > 0 && settings.rows > 1 && settings.columns > 1) {
        const tileset = new TileSet(settings.path, settings.columns, settings.rows)
        tileset.validate().then(() => {
            manager.currentProject.addTileSet(tileset)
        }).catch((err) => {
            dialog.showMessageBox(win, {
                type: 'error',
                title: 'Erreur',
                message: `Erreur lors de l'ouverture de l'image. ${err}`
            })
        })
    }
})

// TODO Verify project changed before asking for save needs
function requestForProjectSaveIfNeeded() {
    return new Promise((resolve, reject) => {
        if(manager.currentProject)
        {
            // We ask the user if we have to save the project
            const buttonOnSaveModal = dialog.showMessageBox(win, {
                type: "question",
                buttons: ['&Sauvegarder', '&Ne pas sauvegarder', '&Annuler'],
                defaultId: 0,
                title: "Sauvegarder le projet en cours",
                detail: "Voulez-vous sauvegarder le projet actuellement ouvert ?",
                cancelId: 2,
                normalizeAccessKeys: true
            })

            // The user canceled the dialog
            if(buttonOnSaveModal > 1)
            {
                reject('Canceled save choice')
            }
            else
            {
                // User wants to save the project
                // We check if the current project does have a path to save it
                if(buttonOnSaveModal === 0)
                {
                    requestForSavePathIfNeeded().then(() => {
                        resolve(true)
                    }).catch((e) => {
                        reject(e)
                    })
                }
                else
                {
                    resolve(false)
                }
            }
        }
        else
        {
            // There's no project, so we don't need to save
            resolve(false)
        }
    })
}

function requestForSavePathIfNeeded() {
    return new Promise((resolve, reject) => {
        if(manager.currentProject && !manager.currentProject.path) {
            dialog.showSaveDialog(win, {
                title: "Fichier de sauvegarde du project",
                filters: [
                    { name: "TileMapper project", extensions: ['tmproj'] }
                ],
                properties: [ "openFile", "promptToCreate" ],
                message: "Selection du fichier de sauvegarde du projet TileMapper"
            }, (path) => {
                if(path)
                {
                    manager.currentProject.path = path
                    resolve()
                }
                else
                {
                    reject('Canceled save path choice')
                }
            });
        }
        else {
            resolve()
        }
    })
}