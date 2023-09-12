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
        cesiumScript.src = 'http://49.205.217.250/preprod/Cesium109/Build/Cesium/Cesium.js'
        document.body.appendChild(cesiumScript)
        let cesiumCss = document.createElement("link")
        cesiumCss.href = "http://49.205.217.250/preprod/Cesium109/Build/Cesium/Widgets/widgets.css"
        cesiumCss.rel = "stylesheet"
        document.head.appendChild(cesiumCss)
        cesiumScript.addEventListener("load", () => {
            let cesiumContainer = document.getElementById('cesiumContainer')
            this.viewer = new Cesium.Viewer(cesiumContainer)
            this.viewer.animation.container.style.visibility = 'hidden';
            this.viewer.timeline.container.style.visibility = 'hidden';
            document.getElementsByClassName("cesium-credit-textContainer")[0].style.visibility = "hidden"
            this.viewer.forceResize();
            this.importWMSLayers()
            this.import3DTiles()
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
    flyTo(name) {
        let target = Object.values(lizMap.config.layers).filter(x => x.name == name)
        if (target.length > 0) {
            let destination
            if (target[0].crs == "EPSG:4326") {
                let extent = target[0].extent
                let x = (extent[0] + extent[2]) / 2
                let y = (extent[1] + extent[3]) / 2
                let z = 3000
                destination = new Cesium.Cartesian3.fromDegrees(x, y, z)
            } else {
                let extent = lizMap.config.layers[name].bbox["EPSG:4326"].bbox
                if (extent.length > 0) {
                    let x = (extent[0] + extent[2]) / 2
                    let y = (extent[1] + extent[3]) / 2
                    let z = 3000
                    destination = new Cesium.Cartesian3.fromDegrees(x, y, z)
                }
            }
            if (destination) {
                this.viewer.camera.flyTo({ destination: destination });
            }
        }
    }

    // url:"http://49.205.217.250/preprod/index.php/view/media/getMedia?repository=8746683&project=ToolDev&path=/media/Bridge_391_Final_Tiled_Model_F/tileset.json"
    async import3DTiles() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const project = urlParams.get('project')
        let resource = new Cesium.Resource({
            url: `http://49.205.217.250/preprod/3dData/${project}/tileset.json`,
            parseUrl: true,
            isDataUri: false,
            isBlobUri: false
        })
        try {
            let tileset = await Cesium.Cesium3DTileset.fromUrl(
                resource, {
                    // skipLevelOfDetail: false,
                    baseScreenSpaceError: 1024,
                    // skipScreenSpaceErrorFactor: .5,
                    // maximumScreenSpaceError :.5,
                    // skipLevels: 0,
                    // immediatelyLoadDesiredLevelOfDetail: true,
                    // loadSiblings: true,
                    // cullWithChildrenBounds: true,
                    // dynamicScreenSpaceError: true,
                    // dynamicScreenSpaceErrorDensity: 0.00278,
                    // dynamicScreenSpaceErrorFactor: 4.0,
                    // dynamicScreenSpaceErrorHeightFalloff: 0.25,
                    // enableDebugWireframe: true,
                    // debugShowBoundingVolume: true,
                    // debugShowContentBoundingVolume: true,
                    // debugColorizeTiles: true,
                    // debugShowGeometricError: true,
                    // debugShowMemoryUsage: true,
                    // debugShowRenderingStatistics: true,
                    // debugShowUrl: true,
                    // debugShowViewerRequestVolume: true,
                    // debugWireframe: true,
                });
            let added = this.viewer.scene.primitives.add(tileset);
            // added.style = new Cesium.Cesium3DTileStyle({
            //     color: "color('red')",
            //     show: "true"
            // });
            // this.viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
            added.show = true
            this.viewer.zoomTo(tileset)
        } catch (error) {
            // console.log(error)
        }
    }
}