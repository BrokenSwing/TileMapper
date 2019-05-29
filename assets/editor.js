class TilePicker {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false
        this.tileSet = null

        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e))
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e))
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e))

        this.hoveredTile = {row: -1, column: -1}
        this.ratio = {x: 1, y: 1}
        this.start = {row: -1, column: -1}
        this.end = {row: -1, column: -1}
        this.drag = false

        this.drawCanvas()
    }

    calculateMouseCoordinates(e) {
        const boundingRect = this.canvas.getBoundingClientRect()
        return {
            x: e.pageX - boundingRect.x,
            y: e.pageY - boundingRect.y
        }
    }

    onMouseMove(e) {
        if(!this.tileSet) return;

        let redraw = false
        
        const hovered = this.getHoveredTile(this.calculateMouseCoordinates(e))
        if(hovered.column !== this.hoveredTile.column || hovered.row !== this.hoveredTile.row) {
            this.hoveredTile = hovered
            redraw = true
        }
        
        if(this.drag) {
            if(hovered.row !== this.end.row || hovered.column !== this.end.column) {
                this.end = {
                    row: hovered.row,
                    column: hovered.column
                }
                redraw = true
            }
        }

        if(redraw) this.drawCanvas()
    }

    getHoveredTile(mousePos) {
        const column = Math.floor(mousePos.x / this.ratio.x / this.tileSet.tileWidth)
        const row = Math.floor(mousePos.y / this.ratio.y / this.tileSet.tileHeight)
        return {
            row: row,
            column: column
        }
    }
        
    onMouseDown(e) {
        if(!this.tileSet) return;

        this.drag = !this.drag
        if(this.drag) {
            this.start = this.end = {
                row: this.hoveredTile.row,
                column: this.hoveredTile.column
            }
        }
        this.drawCanvas()
    }

    onMouseUp(e) {
        if(!this.tileSet) return;

        this.drag = false
    }

    setTileSet(tileset) {
        let img = new Image()
        this.ctx.backgroundImage = document.createElement('canvas')
        this.ctx.backgroundImage.width = this.canvas.width
        this.ctx.backgroundImage.height = this.canvas.height
        img.onload = (e) => {
            this.ctx.backgroundImage.getContext('2d').drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            this.tileSet = tileset
            this.ratio.x = this.canvas.width / img.width
            this.ratio.y = this.canvas.height / img.height
            this.drawCanvas()
        }
        img.src = tileset.path
    }

    drawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        if(this.tileSet) {
            this.ctx.drawImage(this.ctx.backgroundImage, 0, 0)
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
            this.ctx.fillRect(
                this.hoveredTile.column * this.tileSet.tileWidth * this.ratio.x,
                this.hoveredTile.row * this.tileSet.tileHeight * this.ratio.y,
                this.tileSet.tileWidth * this.ratio.x,
                this.tileSet.tileHeight * this.ratio.y
            )
            this.ctx.fillStyle = "rgba(150, 150, 150, 0.6)"
            const start = {
                row: Math.min(this.start.row, this.end.row),
                column: Math.min(this.start.column, this.end.column)
            }
            const end = {
                row: Math.max(this.start.row, this.end.row),
                column: Math.max(this.start.column, this.end.column)
            }
            this.ctx.fillRect(
                start.column * this.tileSet.tileWidth * this.ratio.x,
                start.row * this.tileSet.tileHeight * this.ratio.y,
                (1 + end.column - start.column) * this.tileSet.tileWidth * this.ratio.x,
                (1 + end.row - start.row) * this.tileSet.tileHeight * this.ratio.y
            )
        } else {
            this.ctx.fillStyle = "black"
            this.ctx.font = "30px serif"
            this.ctx.fillText('Aucun tile-set ouvert', 10, 50)
        }
    }

}

const tileset = {
    path: "tilset.png",
    width: 768,
    height: 768,
    tileWidth: 48,
    tileHeight: 48
}

const tilePicker = new TilePicker('levelCanvas')

document.getElementById('tilePickerCanvas').getContext('2d').fillRect(0, 0, 500, 500, 0, 0, 0, 1)
