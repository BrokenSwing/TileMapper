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
        if(button.dataset.needlevel !== undefined) {
            button.disabled = button.disabled || state.project.currentLevel === null
        }
    })
}

function updateProjectTitle(state) {
    if(state.project === null) {
        projectTitleNode.classList.remove('project-title-shown')
    } else {
        projectTitleNode.innerHTML = state.project.name
        projectTitleNode.classList.add('project-title-shown')
    }
}

// Handlers for menu button

const func_mappings = {
    'create-project': createProjectButtonClick,
    'close-project': triggerProjectClosing,
    'open-project': triggerProjectOpening
}

document.querySelector('nav').addEventListener('click', (event) => {
    if(event.target.dataset.action) {
        func_mappings[event.target.dataset.action](event)
    }
})

function triggerProjectClosing() {
    ipcRenderer.send('close-project')
}

function triggerProjectOpening() {
    ipcRenderer.send('open-project')
}

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
        },
        resizable: false
    })

    win.setMenu(null)
    win.on('close', () => { win = null })
    win.loadURL(modalPath)

    win.once('ready-to-show',() => {
        win.show()
    })
}