let lizmapCesium;
lizMap.events.on({
    uicreated: function (e) {
        let view = document.createElement('div')
        view.innerHTML = `<div id="cesiumContainer" style="height:95vh"></div>`
        document.getElementById('map').appendChild(view)
        lizmapCesium = new LizmapCesium("cesiumContainer")
        lizmapCesium.setUpCesium()
        lizmapCesium.addDock()
    },
    dockopened: (e) => {
        if (e.id != '3D') {
            return
        }
        $('#map .olMapViewport').css({ display: "none" })
        $('#navbar').css({ display: "none" })
        $('#overview-box').css({ display: "none" })
        $('#cesiumContainer').css({ display: "block" })
    },
    dockclosed: (e) => {
        if (e.id != '3D') {
            return
        }
        $('#map .olMapViewport').css({ display: "block" })
        $('#navbar').css({ display: "block" })
        $('#overview-box').css({ display: "block" })
        $('#cesiumContainer').css({ display: "none" })
    }
});

class LizmapCesium {
    constructor(canvasId) {
        this.canvasId = canvasId
    }
    setUpCesium() {
        let cesiumScript = document.createElement('script')
        cesiumScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/cesium/1.108.0/Cesium.js'
        document.body.appendChild(cesiumScript)
        let cesiumCss = document.createElement("link")
        cesiumCss.href = "https://cesium.com/downloads/cesiumjs/releases/1.109/Build/Cesium/Widgets/widgets.css"
        cesiumCss.rel = "stylesheet"
        document.head.appendChild(cesiumCss)
        cesiumScript.addEventListener("load", () => {
            let cesiumContainer = document.getElementById('cesiumContainer')
            this.viewer = new Cesium.Viewer(cesiumContainer, {})
            this.viewer.animation.container.style.visibility = 'hidden';
            this.viewer.timeline.container.style.visibility = 'hidden';
            document.getElementsByClassName("cesium-credit-textContainer")[0].style.visibility = "hidden"
            this.viewer.forceResize();
            this.importWMSLayers()
        });
    }
    importWMSLayers() {
        let layersName = this.getAllLayersName().reverse()
        this.layers = {}
        this.activeLayers = {}
        layersName.forEach(value => {
            let layer = getLayerByname(value)
            if (layer.params?.SERVICE == 'WMS') {
                let url = layer.url
                let name = layer.name
                let wmsLayer = new Cesium.WebMapServiceImageryProvider({
                    url: url,
                    layers: name,// Here just give layer name
                    parameters: {
                        format: 'image/png',
                        transparent: 'true'
                    },
                })
                this.layers[name] = wmsLayer
            }
        })
    }
    getAllLayersName() {
        let currentLayers = Object.values(lizMap.config.layers)
        let layersName = []
        currentLayers.forEach(l => {
            if (l.type == "layer") {
                layersName.push(l.name)
            }
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
    addDock() {
        let layers = this.getAllLayersName()
        let layerOptions = ''
        layers.forEach(layer => {
            layerOptions = layerOptions + `<input type="checkbox" id="view_3d${layer}_checkbox" name="${layer}" value="${layer}" class="3dlayerswitcher">
            <label for="view_3d${layer}_checkbox" style="display:inline;">${layer}</label><br>`
        })
        let template = `<div>${layerOptions}<div>`
        lizMap.addDock(
            '3D',
            '3D',
            'dock',
            template,
            'icon-globe'
        );
        $(".3dlayerswitcher").change((e) => {
            if (e.target.checked) {
                this.addLayer(e.target.name)
            } else {
                this.removeLayer(e.target.name)
            }
        })
    }
    async addLayer(name) {
        let layer = this.layers[name]
        if (layer) {
            let addedLayer = await this.viewer.imageryLayers.addImageryProvider(layer)
            this.activeLayers[name] = addedLayer
            this.flyTo(name)
        }
    }
    removeLayer(name) {
        let layer = this.activeLayers[name]
        if (layer) {
            this.viewer.imageryLayers.remove(layer)
        }
    }
    flyTo(name){
        let target = Object.values(lizMap.config.layers).filter(x => x.name == name)
        if (target.length > 0) {
            let destination
            if (target[0].crs == "EPSG:4326"){
                let extent = target[0].extent
                let x = (extent[0] + extent[2]) / 2
                let y = (extent[1] + extent[3]) / 2
                let z = 3000
                destination = new Cesium.Cartesian3.fromDegrees(x,y,z)
            }else{
                let extent = lizMap.config.layers[name].bbox["EPSG:4326"].bbox
                if(extent.length>0){
                    let x = (extent[0] + extent[2]) / 2
                    let y = (extent[1] + extent[3]) / 2
                    let z = 3000
                    destination = new Cesium.Cartesian3.fromDegrees(x, y,z)
                }
            }
            if (destination){
                this.viewer.camera.flyTo({ destination: destination });
            }
        }
    }
}