
let lineControl;
let layer;
lizMap.events.on({
    uicreated:()=>{
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ol@v7.5.1/dist/ol.js';
        script.async = true;
        document.body.appendChild(script);
    },
    layersadded: () => {
        let layers = getAllLayersName()
        let layerOption = ''
        layers.forEach(l => {
            layerOption += `<option value="${l}">${l}</option>`
        })
        const template = `
                <div class="form-group">
                    <select class="form-control" id="dsm-layer-selector">
                    <option value="">Select DSM Layer</option>
                    ${layerOption}
                    </select>
                </div>
           `;
        lizMap.addDock("ElevationProfile", "Elevation", "minidock", template, "icon-signal");
        $('#dsm-layer-selector').on('change', (e) => {
            layer = getLayerByname(e.target.value)
            console.log(layer)
        })
    },
    minidockopened: (e) => {
        if (e.id == 'ElevationProfile') {
            let sketchSymbolizers = {
                "Point": {
                    pointRadius: 4,
                    graphicName: "square",
                    fillColor: "white",
                    fillOpacity: 1,
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "#333333"
                },
                "Line": {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    strokeColor: "#666666",
                    strokeDashstyle: "dash"
                }
            }
            var style = new OpenLayers.Style();
            style.addRules([
                new OpenLayers.Rule({ symbolizer: sketchSymbolizers })
            ]);
            var styleMap = new OpenLayers.StyleMap({ "default": style });
            lineControl = new OpenLayers.Control.Measure(
                OpenLayers.Handler.Path, {
                persist: true,
                geodesic: true,
                immediate: true,
                handlerOptions: {
                    maxVertices: 2,
                    layerOptions: {
                        styleMap: styleMap
                    }
                },
                type: OpenLayers.Control.TYPE_TOOL
            }
            )
            lineControl.events.on({
                activate: function () {
                    console.log('active');
                },
                deactivate: function () {
                    console.log('deactive');
                }
            });
            lineControl.events.on({
                "measure": handelLineDraw,
                "measurepartial": handelPartialLineDraw
            });
            lizMap.map.addControl(lineControl);
            lineControl.activate()
        }
    },
    minidockclosed: (e) => {
        if (e.id == 'ElevationProfile') {
            lineControl.deactivate();
            lizMap.map.removeControl(lineControl);
        }
    }

}
)
function getLayerByname(name) {
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
function getAllLayersName() {
    let currentLayers = Object.values(lizMap.map.layers)
    let layersName = []
    currentLayers.forEach(l => {
        layersName.push(l.name)
    });
    return layersName
}

function handelLineDraw(evt) {
    console.log('complete')
    console.log(evt.geometry)
    console.log(layer)
    var projectProjection = lizMap.config.options?.qgisProjectProjection?.ref || "EPSG:4326"
    if (layer) {
        let point1 = evt.geometry.components[0]
        let point2 = evt.geometry.components[1]
        let xy1 = [point1.x, point1.y]
        let xy2 = [point2.x, point2.y]
                
        var epsg4326 = new OpenLayers.Projection('EPSG:4326',{
        units: 'degrees',
        });
        console.log(epsg4326)
        console.log(xy1, xy2)
    }
}
function handelPartialLineDraw(evt) {
    console.log(evt)
}