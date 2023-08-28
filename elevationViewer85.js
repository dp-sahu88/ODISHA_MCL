let layer;
let map;
var vectorLayer
var getFeatureInfoControl;
var line
var LineEndPoints = [];
lizMap.events.on({
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
            if (layer != '') {
                addGetFeatureInfoControl()
            }
        })
    },
    minidockopened: (e) => {
        if (e.id == 'ElevationProfile') {
            map = lizMap.map
            vectorLayer = new OpenLayers.Layer.Vector("ElvProfileLine");
            map.addLayer(vectorLayer);
            map.events.register("click", map, onMapClick);
        }
    },
    minidockclosed: (e) => {
        if (e.id == 'ElevationProfile') {
            map.events.un("click", onMapClick);
            vectorLayer.removeAllFeatures()
            map.removeLayer(vectorLayer);
            $('#dsm-layer-selector').value = ''
        }
    }
}
)

function onMapClick(evt) {
    evt.preventDefault()
    var point = map.getLonLatFromPixel(evt.xy);
    LineEndPoints.push(evt.xy);
    var feature = new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point(point.lon, point.lat)
    );
    if (vectorLayer.features.length === 0) {
        vectorLayer.addFeatures([feature]);
    } else if (vectorLayer.features.length === 1) {
        vectorLayer.addFeatures([feature]);
        var start = vectorLayer.features[0].geometry.getVertices()[0];
        var end = feature.geometry.getVertices()[0];
        line = new OpenLayers.Geometry.LineString([start, end]);
        vectorLayer.addFeatures([new OpenLayers.Feature.Vector(line)]);
        getFeatureInfo(LineEndPoints)
        LineEndPoints = []
    } else {
        // Clear previous features and start a new line
        vectorLayer.removeAllFeatures();
        vectorLayer.addFeatures([feature]);
    }
}

function clearGetFeatureInfoControl() {
        getFeatureInfoControl.deactivate();
        map.removeControl(getFeatureInfoControl);
        getFeatureInfoControl = null
}

function addGetFeatureInfoControl(){
    if (getFeatureInfoControl){
        clearGetFeatureInfoControl()
    }
    if (!layer){
        return
    }
    getFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
        hover: true,
        title: 'Identify features by clicking',
        layers: [layer],
        queryVisible: true,
        maxFeatures:100,
        infoFormat: 'text/html',
        output:"string",
        vendorParams:{
            radius:5
        },
        handlerOptions: {
            click: { delay: 0 },
            hover:{delay : 0}
        }
    });
    getFeatureInfoControl.events.register('getfeatureinfo', getFeatureInfoControl, e=>{handelGetInfo(e)})
    // getFeatureInfoControl.events.register('nogetfeatureinfo', getFeatureInfoControl, (e)=>{console.log(e);})
    getFeatureInfoControl.events.register('beforegetfeatureinfo', getFeatureInfoControl, e=>{handelBeforeGetInfo(e)})
    map.addControl(getFeatureInfoControl);
}

function handelGetInfo(e){
    console.log("After: ",e)
    var point = map.getLonLatFromPixel(e.xy);
    var feature = new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point(point.lon, point.lat)
    );
    vectorLayer.addFeatures([feature]);
}

function handelBeforeGetInfo(e){
    console.log("Before",e)
}

 function getFeatureInfo(lineEndPoints){
    if(!getFeatureInfoControl){
        return;
    }
    getFeatureInfoControl.activate()
    console.log(lineEndPoints);
    var pixel1 = lineEndPoints[0];
    var pixel2 = lineEndPoints[1];
    var pixels = getIntermediatePixels(pixel1, pixel2);
    pixels.forEach(({x,y})=>{
        document.elementFromPoint(x,y).hover()
        
    })
    console.log(pixels);
    //gate the steps and simulate click
    getFeatureInfoControl.deactivate()
 }

function getIntermediatePixels(pixel1, pixel2) {
  const intermediatePixels = [];

  // Calculate the difference in x and y values between the two pixels
  const deltaX = pixel2.x - pixel1.x;
  const deltaY = pixel2.y - pixel1.y;

  // Determine the distance between the two pixels
  const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));

  // Calculate the step size in x and y directions
  const stepX = deltaX / distance;
  const stepY = deltaY / distance;

  // Add the intermediate pixels
  for (let i = 0; i <= distance; i++) {
    const intermediatePixel = {
      x: Math.round(pixel1.x + (stepX * i)),
      y: Math.round(pixel1.y + (stepY * i))
    };
    intermediatePixels.push(intermediatePixel);
  }

  return intermediatePixels;
}






























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
