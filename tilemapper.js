const { ipcMain } = require('electron')
const fs = require('fs')

class Project {
    
    constructor(name) {
        this.name = name
        this.path = null
        this.currentLevel = null
    }

    static fromFile(path, cb) {
        fs.readFile(path, 'utf8', (err, data) => {
            if(err) {
                cb("Impossible d'accéder au fichier.", null)
            }
            try {
                let obj = JSON.parse(data)
                if(obj && obj.name) {
                    let project = new Project(obj.name)
                    project.path = path
                    cb(null, project)
                } else {
                    cb("Erreur lors de la lecture du fichier")
                }
            } catch (e) {
                cb("Format du fichier invalide.", null)
            }
        })
    }

    to_json() {
        JSON.stringify({
            name: this.name
        })
    }

}

class Manager {

    constructor(mainWindow) {
        this.mainWindow = mainWindow
        this.currentProject = null
        ipcMain.on('get-manager-state', (event) => {
            event.reply('get-manager-state-response', this.getCurrentState())
        })
    }

    getCurrentState() {
        return {
            project: this.currentProject
        }
    }

    openProject(project, save) {
        this.closeProject(save)
        this.mainWindow.webContents.send('project-open-pre', this.getCurrentState())
        this.currentProject = project
        // TODO More processing if needed
        this.mainWindow.webContents.send('project-open-post', this.getCurrentState())
    }

    closeProject(save) {
        if(this.currentProject !== null) {
            this.mainWindow.webContents.send('project-close-pre', this.getCurrentState())
            if(save) {
                // TODO Save project
            }
            this.currentProject = null
            this.mainWindow.webContents.send('project-close-post', this.getCurrentState())
        }
    }

    get hasCurrentProject() {
        return this.currentProject !== null
    }

    subscribeEvent(eventName, cb) {
        listeners = this.eventsListeners[eventName]
        listeners[listeners.length] = cb
    }

}

exports.Manager = Manager
exports.Project = Project