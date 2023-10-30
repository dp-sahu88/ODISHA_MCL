let lizmapSwipe;
lizMap.events.on({
    uicreated: () => {
        lizmapSwipe = new LayerSwipe()
    },
    minidockopened: (e) => {
        if (e.id == 'Swipe') {
            document.getElementById('swipe-layer-break-point-container').style.display = "block"
            let bar = document.createElement('div')
            bar.id = "swipe-layer-indicator-bar"
            bar.style.cssText = `
                position:absolute;
                height :${lizmapSwipe.direction == 'v' ? '4px' : '100%'};
                width:${lizmapSwipe.direction == 'v' ? '100%' : '4px'};
                background-color:#ff0000;
                z-index:1001;
                top:0;
                ${lizmapSwipe.direction == 'v' ? 'top' : 'left'}:${lizmapSwipe.breakPoint}%;
            `
            document.getElementById('map').appendChild(bar)
            document.getElementById('swipe-layer-clip-box').style.display = "block"
        }
    },
    minidockclosed: (e) => {
        if (e.id == 'Swipe') {
            document.getElementById('swipe-layer-break-point-container').style.display = "none"
            document.getElementById('swipe-layer-clip-box').style.display = "none"
            document.getElementById('swipe-layer-indicator-bar').remove()
            lizmapSwipe.reset()
        }
    }
})
class LayerSwipe {
    constructor() {
        this.addMiniDock()
        this.breakPoint = 0
        this.direction = 'h'
        let box = document.createElement('div')
        box.id = "swipe-layer-clip-box"
        box.style.cssText = `
            position:absolute;
            height :${this.direction == 'v' ? `${this.breakPoint}%` : '100%'};
            width:${this.direction == 'v' ? '100%' : `${this.breakPoint}%`};
            background-color:#01ff0000;
            z-index:1001;
            top:0;
            left:0
            display:none;
        `
        document.getElementById('map').appendChild(box)
    }
    addMiniDock() {
        let layers = this.getAllLayersName()
        let layerOption = ''
        layers.forEach(l => {
            layerOption += `<option value="${l}">${l}</option>`
        })
        let template = `
        <select class="form-control" id="swipe-layer-layer" style="height:1.5rem;  margin:0;">
            <option value="">Select Layer</option>
            ${layerOption}
        </select>
        <select class="form-control" id="swipe-layer-direction" style="height:1.5rem;  margin:0;">
            <option value="h">Horizontal</option>
            <option value="v">Vertical</option>
        </select>
        `
        let slider = document.createElement('div')
        slider.innerHTML = `<input type="range" min="0" max="100" value="0" step="1" id="swipe-layer-break-point" style="width:100%">`
        slider.id = "swipe-layer-break-point-container"
        slider.style.cssText = `
            display:none;
            position:absolute;
            bottom: 10px;
            right:10px;
            left:10px;
            z-index:1005;
        `
        document.getElementById('map').appendChild(slider)
        lizMap.addDock('Swipe', 'Swipe', 'minidock', template, "icon-resize-horizontal")
        $('#swipe-layer-layer').on('input', (e) => {
            let layerName = e.target.value
            if (layerName != "") {
                this.reset()
            }
            this.layer = this.getLayerByname(layerName)
            if (this.layer) {
                this.registerLayerEvent(this.layer)
            }
            this.clip()
        })
        $('#swipe-layer-break-point').on('input', (e) => {
            this.breakPoint = e.target.value
            document.getElementById('swipe-layer-indicator-bar').style[this.direction == 'v' ? 'top' : 'left'] = `${this.breakPoint}%`
            document.getElementById('swipe-layer-clip-box').style.height = this.direction == 'v' ? `${this.breakPoint}%` : '100%';
            document.getElementById('swipe-layer-clip-box').style.width = this.direction == 'v' ? '100%' : `${this.breakPoint}%`;
            this.clip()
        })
        $('#swipe-layer-direction').on('input', (e) => {
            this.direction = e.target.value
            document.getElementById('swipe-layer-indicator-bar').style.cssText = `
            position:absolute;
            height:${this.direction == 'v' ? '4px' : '100%'};
            width:${this.direction == 'v' ? '100%' : '4px'};
            background-color:#ff0000;
            z-index:1001;
            top:0;
            ${this.direction == 'v' ? 'top' : 'left'}:${this.breakPoint}%;`
            document.getElementById('swipe-layer-clip-box').style.height = this.direction == 'v' ? `${this.breakPoint}%` : '100%';
            document.getElementById('swipe-layer-clip-box').style.width = this.direction == 'v' ? '100%' : `${this.breakPoint}%`;
            this.clip()
        })
    }
    getAllLayersName() {
        let currentLayers = Object.values(lizMap.config.layers)
        let layersName = []
        currentLayers.forEach(l => {
            // if (l.singleTile == "True" || l.singleTile == "true" || l.singleTile === true) {
            layersName.push(l.name)
            // }
        });
        return layersName
    }
    getLayerByname(name) {
        let currentLayers = Object.values(lizMap.map.layers)
        let layer;
        currentLayers.forEach(l => {
            if (l.name == name) {
                layer = l
            }
        });
        if (layer) {
            return layer
        }
        return false
    }
    reset() {
        let targets = this.getClipTarget()
        if (targets) {
            targets.forEach(target => {
                target.style['clip-path'] = "none"
            });
        }
        this.resetLayer(this.layer)
    }
    resetLayer(layer) {
        if (!layer) {
            return
        }
        layer.events.unregister("moveend", layer, this.clip)
        layer.events.unregister("move", layer, this.clip)
        layer.events.unregister("visibilitychanged", layer, this.clip)
        layer.events.unregister("added", layer, this.clip)
        layer.events.unregister("loadend", layer, this.clip)
    }
    registerLayerEvent(layer) {
        // register event listners in layer
        layer.events.register("moveend", layer, this.clip)
        layer.events.register("move", layer, this.clip)
        layer.events.register("visibilitychanged", layer, this.clip)
        layer.events.register("added", layer, this.clip)
        layer.events.register("loadend", layer, this.clip)
    }
    clip() {
        let direction = lizmapSwipe.direction || 'h'
        // let breakPoint = lizmapSwipe.breakPoint || 0
        let targets = lizmapSwipe.getClipTarget()
        targets.forEach(target => {
            let clipString;
            let breakPoint = lizmapSwipe.getOverlap(target)
            if (direction == 'v') {
                clipString = `inset(${breakPoint}% 0 0 0)`
            } else if (direction == 'h') {
                clipString = `inset(0 0 0 ${breakPoint}%)`
            }
            if (target) {
                target.style['clip-path'] = clipString
            }
        });

    }
    getClipTarget() {
        if (!this.layer) {
            return []
        }
        let layerDiv = this.layer.div
        let img = layerDiv.getElementsByTagName('img')
        let canvas = layerDiv.getElementsByTagName('canvas')
        let allresult = [...img, ...canvas]
        return allresult
    }

    getOverlap(target) {

        let slideBox = document.getElementById("swipe-layer-clip-box")
        let targetBound = target?.getBoundingClientRect()
        if (!targetBound) {
            return 0
        }
        let slideBoxBound = slideBox.getBoundingClientRect()
        if (this.direction == "v") {
            // compare top and bottom
            if (targetBound.bottom < slideBoxBound.bottom) {
                return 100
            } else if (targetBound.top > slideBoxBound.bottom) {
                return 0
            } else {
                let targetH = targetBound.bottom - targetBound.top
                let overlap = slideBoxBound.bottom - targetBound.top
                return (overlap / targetH) * 100
            }
        } else {
            if (targetBound.right < slideBoxBound.right) {
                return 100
            } else if (targetBound.left > slideBoxBound.right) {
                return 0
            } else {
                let targetW = targetBound.right - targetBound.left
                let overlap = slideBoxBound.right - targetBound.left
                return (overlap / targetW) * 100
            }
        }
    }
}