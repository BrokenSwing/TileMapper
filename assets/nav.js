const { remote, ipcRenderer } = require('electron')
const path = require('path')

const buttons = document.querySelectorAll('nav .nav-button')
const projectTitleNode = document.querySelector('.project-title')

ipcRenderer.on('project-open-post', (event, state) => { 
    updateButtonsState(state)
    updateProjectTitle(state)
})
ipcRenderer.on('project-close-post', (event, state) => { 
    updateButtonsState(state) 
    updateProjectTitle(state)
})
ipcRenderer.on('get-manager-state-response', (event, state) => { 
    updateButtonsState(state) 
    updateProjectTitle(state)
})
ipcRenderer.send('get-manager-state')

function updateButtonsState(state) {
    Array.prototype.forEach.call(buttons, (button) => {
        button.disabled = false;
        if(button.dataset.needproject !== undefined) {
            button.disabled = state.project === null
        }
    })
}

function updateProjectTitle(state) {
    if(state.project === null) {
        projectTitleNode.classList.remove('project-title-shown')
    } else {
        projectTitleNode.innerHTML =  `${state.project.name} <sub>${state.project.width}x${state.project.height}</sub>`
        projectTitleNode.classList.add('project-title-shown')
    }
}

// Handlers for menu button

const func_mappings = {
    'create-project': openCreateProjectModal,
    'close-project': () => ipcRenderer.send('close-project'),
    'open-project': () => ipcRenderer.send('open-project'),
    'save-project': () => ipcRenderer.send('save-project'),
    'add-tileset': triggerAddTileSet
}

document.querySelector('nav').addEventListener('click', (event) => {
    if(event.target.dataset.action) {
        func_mappings[event.target.dataset.action](event)
    }
})

function triggerAddTileSet() {
    const modalPath = path.join('file://', __dirname, '../modals/add_tile_set.html')
    let win = new remote.BrowserWindow({ 
        width: 400, 
        height: 300,
        show: false,
        modal: true,
        parent: remote.getCurrentWindow(),
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    })

    win.setMenu(null)
    win.on('close', () => { win = null })
    win.once('ready-to-show', () => {
        win.show()
    })

    win.loadURL(modalPath)
}

function openCreateProjectModal(event) {
    const modalPath = path.join('file://', __dirname, '../modals/create_project.html')
    let win = new remote.BrowserWindow({ 
        width: 400, 
        height: 300,
        show: false,
        modal: true,
        parent: remote.getCurrentWindow(),
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    })

    win.setMenu(null)
    win.on('close', () => { win = null })
    win.once('ready-to-show', () => {
        win.show()
    })

    win.loadURL(modalPath)
}