let lizmapCesium; 
lizMap.events.on({
    uicreated: function (e) {
        let view = document.createElement('div')
        view.innerHTML= `<div id="cesiumContainer" style="height:95vh"></div>`
        document.getElementById('map').appendChild(view)
        lizmapCesium = new LizmapCesium("cesiumContainer")
        lizmapCesium.setUpCesium()
        lizmapCesium.addDock()
    },
    dockopened: (e)=>{
        if (e.id!='3D'){
            return
        }
        $('#map .olMapViewport').css({display:"none"})
        $('#navbar').css({display:"none"})
        $('#overview-box').css({display:"none"})
        $('#cesiumContainer').css({display:"block"})
    },
    dockclosed: (e)=>{
        if (e.id!='3D'){
            return
        }
        $('#map .olMapViewport').css({display:"block"})
        $('#navbar').css({display:"block"})
        $('#overview-box').css({display:"block"})
        $('#cesiumContainer').css({display:"none"}) 
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
    addDock(){
        let layers= this.getAllLayersName()
        let layerOptions = ''
        layers.forEach(layer=>{
            layerOptions = layerOptions+`<input type="checkbox" id="view_3d${layer}_checkbox" name="${layer}" value="${layer}">
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
    }

}