const { remote } = require('electron')
const path = require('path')

const func_mappings = {
    'create-project': createProject
}

document.querySelector('nav').addEventListener('click', (event) => {
    if(event.target.dataset.action) {
        func_mappings[event.target.dataset.action](event)
    }
})

function createProject(event) {
    const modalPath = path.join('file://', __dirname, '../modals/create_project.html')
    let win = new remote.BrowserWindow({ 
        width: 400, 
        height: 200,
        show: false,
        modal: true,
        parent: remote.getCurrentWindow()
    })

    win.setMenu(null)
    win.on('close', () => { win = null })
    win.loadURL(modalPath)
    win.once('ready-to-show',() => {
        win.show()
    })
}
