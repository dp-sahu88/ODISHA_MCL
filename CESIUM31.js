let lizmapCesium; 
lizMap.events.on({
    uicreated: function (e) {
        let template = `<div id="cesiumContainer" style="height:86vh;" ></div>`
        lizMap.addDock(
            '3D',
            '3D',
            'right-dock',
            template,
            'icon-globe'
        );
        lizmapCesium = new LizmapCesium("cesiumContainer")
        lizmapCesium.setUpCesium()
    }
});

class LizmapCesium{
    constructor (canvasId){
        this.canvasId = canvasId
    }
    setUpCesium(){
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
                document.getElementsByClassName("cesium-credit-textContainer")[0].style.visibility= "hidden"
                this.viewer.forceResize();
                this.importWMSLayers()
        });
    }
    importWMSLayers(){
        let layersName = this.getAllLayersName().reverse()
        layersName.forEach(value => {
            let layer = getLayerByname(value)
            if (layer.params?.SERVICE == 'WMS'){
                let url = layer.url
                let name = layer.name
                this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                    url : url,        
                    layers: name,// Here just give layer name
                    parameters: {
                        format:'image/png',
                        transparent:'true'
                    },
                    name:name
                }))
            }
        })
    }
    getAllLayersName() {
        let currentLayers = Object.values(lizMap.config.layers)
        let layersName = []
        currentLayers.forEach(l => {
            if (l.type == "layer"){
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
}