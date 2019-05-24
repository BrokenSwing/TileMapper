const { remote, ipcRenderer } = require('electron')
const path = require('path')

const buttons = document.querySelectorAll('nav .nav-button')

ipcRenderer.on('project-open-post', (event, state) => { updateButtonsState(state) })
ipcRenderer.on('project-close-post', (event, state) => { updateButtonsState(state) })
ipcRenderer.on('get-manager-state-response', (event, state) => { updateButtonsState(state) })
ipcRenderer.send('get-manager-state')

function updateButtonsState(state) {
    Array.prototype.forEach.call(buttons, (button) => {
        button.disabled = false;
        if(button.dataset.needproject !== undefined) {
            button.disabled = state.project === null
        }
        if(button.dataset.needlevel !== undefined) {
            button.disabled = button.disabled || state.project.currentLevel === null
        }
    })
}

// Handlers for menu button

const func_mappings = {
    'create-project': createProjectButtonClick
}

document.querySelector('nav').addEventListener('click', (event) => {
    if(event.target.dataset.action) {
        func_mappings[event.target.dataset.action](event)
    }
})

function createProjectButtonClick(event) {
    const modalPath = path.join('file://', __dirname, '../modals/create_project.html')
    let win = new remote.BrowserWindow({ 
        width: 400, 
        height: 200,
        show: false,
        modal: true,
        parent: remote.getCurrentWindow(),
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.setMenu(null)
    win.on('close', () => { win = null })
    win.loadURL(modalPath)

    win.once('ready-to-show',() => {
        win.show()
    })
}