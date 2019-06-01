const { ipcMain } = require('electron')
const fs = require('fs')
const sizeOf = require('image-size')
const path = require('path')

class Project {
    
    constructor(name, width, height) {
        this.name = name
        this.width = width
        this.height = height
        this.path = null
        this.grid = []
        this.tileSets = {}
    }

    static fromFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                if(err) {
                    reject("Impossible d'accéder au fichier.")
                } else {
                    try {
                        let obj = JSON.parse(data)
                        if(obj && obj.name && obj.width && obj.height && obj.textures) {
                            let project = new Project(obj.name, obj.width, obj.height)
                            project.path = path

                            const texturesNames = Object.keys(obj.textures)
                            let promises = []
                            texturesNames.forEach((texName) => {
                                promises.push(TileSet.fromJson(project, obj.textures[texName]))
                            })
                            Promise.all(promises).then((tilesets) => {
                                for(let i = 0; i < tilesets.length; i++) {
                                    project.tileSets[texturesNames[i]] = tilesets[i]
                                }
                                resolve(project)
                            }).catch((error) => {
                                reject(error)
                            })
                        } else {
                            reject("Erreur lors de la lecture du fichier")
                        }
                    } catch (e) {
                        reject("Format du fichier invalide.")
                    }
                }
            })
        })
    }

    addTileSet(tileSet) {
        const name = `#${Object.keys(this.tileSets).length}`
        this.tileSets[name] = tileSet
    }

    toJson() {
        return JSON.stringify({
            name: this.name,
            width: this.width,
            height: this.height,
            textures: (() => {
                let ret = {}
                Object.keys(this.tileSets).forEach((el) => {
                    ret[el] = this.tileSets[el].serialize(this)
                })
                return ret
            })(),
        })
    }

    save() {
        fs.writeFileSync(this.path, this.toJson())
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
        if(this.currentProject) {
            this.mainWindow.webContents.send('project-close-pre', this.getCurrentState())
            if(save && this.currentProject.path) {
                this.currentProject.save()
            }
            this.currentProject = null
            this.mainWindow.webContents.send('project-close-post', this.getCurrentState())
        }
    }

}

class TileSet {

    constructor(path, columnsCount, rowsCount) {
        this.path = path
        this.columns = columnsCount
        this.rows = rowsCount
        this.width = null
        this.height = null
        this.tileHeight = null
        this.tileWidth = null
    }

    static fromJson(project, obj) {
        return new Promise((resolve, reject) => {
            if(obj.path && obj.rows && obj.columns && obj.rows > 0 && obj.columns > 0) {
                const tileset = new TileSet(path.resolve(project.path, '..', obj.path), obj.columns, obj.rows)
                tileset.validate().then(() => {
                    resolve(tileset)
                }).catch((err) => {
                    reject(err)
                })
            } else {
                reject('Le fichier a certainement été corrumpu.')
            }
        })
    }

    validate() {
        return new Promise((resolve, reject) => {
            sizeOf(this.path, (err, dimensions) => {
                if(err) {
                    reject("Impossible de récupérer la taille de l'image.")
                } else if(dimensions.width / this.columns % 1 === 0 && dimensions.height / this.rows % 1 === 0) {
                    this.width = dimensions.width
                    this.height = dimensions.height
                    this.tileHeight = dimensions.width / this.columns
                    this.tileWidth = dimensions.height / this.rows
                    resolve()
                } else {
                    reject("Le nombre de lignes/colonnes n'est pas un multiple de la hauteur/largeur de l'image.")
                }
            })
        })
    }

    serialize(project) {
        return {
            path: path.relative(path.resolve(project.path, '..'), this.path),
            rows: this.rows,
            columns: this.columns
        }
    }

}

exports.Manager = Manager
exports.Project = Project
exports.TileSet = TileSet