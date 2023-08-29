let layer;
let map;
var vectorLayer
var getFeatureInfoControl;
var LineEndPoints = [];
var elvData = [];
var chartReady = false
var myChart;
var points = [];
lizMap.events.on({
    layersadded: () => {
        addMiniDoc()
        addChartjs()
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
        var line = new OpenLayers.Geometry.LineString([start, end]);
        vectorLayer.addFeatures([new OpenLayers.Feature.Vector(line)]);
        loadFeatureInfo(LineEndPoints)
        LineEndPoints = []
    } else {
        // Clear previous features and start a new line
        elvData = []

        vectorLayer.removeAllFeatures();
        vectorLayer.addFeatures([feature]);
    }
}

function clearGetFeatureInfoControl() {
    getFeatureInfoControl.deactivate();
    map.removeControl(getFeatureInfoControl);
    getFeatureInfoControl = null
}

function addGetFeatureInfoControl() {
    if (getFeatureInfoControl) {
        clearGetFeatureInfoControl()
    }
    if (!layer) {
        return
    }
    getFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
        hover: true,
        title: 'Identify features by clicking',
        layers: [layer],
        queryVisible: true,
        maxFeatures: 100,
        infoFormat: 'text/html',
        output: "string",
        vendorParams: {
            radius: 5
        },
        handlerOptions: {
            click: { delay: 0 },
            hover: { delay: 0 }
        }
    });
    getFeatureInfoControl.events.register('getfeatureinfo', getFeatureInfoControl, e => { handelGetInfo(e) })
    map.addControl(getFeatureInfoControl);
}

function handelGetInfo(e) {
    let jsondata = parseTableToJSON(e.text)
    let value = jsondata[0].Value || jsondata[0].value

    var point = map.getLonLatFromPixel(e.xy);
    if (value) {
        elvData.push({
            x: point.lon,
            y: point.lat,
            value: value
        })
    }
    if (point.lon == points[points.length - 1].lon && point.lat == points[points.length - 1].lat) {
        console.log(elvData)
        myChart.data.labels = elvData.map(d => d.x)
        myChart.data.datasets[0].data = elvData.map(d => d.value)
        console.log('going to update', elvData)
        myChart.update()
    }
    var feature = new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point(point.lon, point.lat)
    );
    vectorLayer.addFeatures([feature]);
}

function loadFeatureInfo(lineEndPoints) {
    if (!getFeatureInfoControl) {
        return;
    }
    // getFeatureInfoControl.activate()
    console.log(lineEndPoints);
    var pixel1 = lineEndPoints[0];
    var pixel2 = lineEndPoints[1];
    points = getIntermediatePoints(pixel1, pixel2);
    points.forEach((point) => {
        var xy = map.getPixelFromLonLat(point)
        getFeatureInfoControl.getInfoForClick({ xy: xy })
    })

}

function getIntermediatePoints(pixel1, pixel2) {
    const intermediatePoints = [];

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
        let point = map.getLonLatFromPixel(intermediatePixel)
        intermediatePoints.push(point);
    }
    return intermediatePoints;
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

function parseTableToJSON(tableString) {
    var tempContainer = document.createElement('div');

    // Set the innerHTML to your table string
    tempContainer.innerHTML = tableString;

    // Access the table element(s) within tempContainer
    var tableElement = tempContainer.querySelector('table');
    // Access the rows of the table
    var rows = tableElement.rows;

    // Create an array to store the JSON objects
    var jsonData = [];

    // Loop through each row
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];

        // Create an object to store the cell data
        var rowData = {};

        // Loop through each cell in the row
        for (var j = 0; j < row.cells.length; j++) {
            var cell = row.cells[j];

            // Use the cell's header as the key and cell's value as the value in rowData
            rowData[tableElement.rows[0].cells[j].textContent.trim()] = cell.textContent.trim();
        }

        // Add the rowData object to the jsonData array
        jsonData.push(rowData);
    }

    // Return the JSON data
    return jsonData;
}


function addMiniDoc() {
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
        else {
            clearGetFeatureInfoControl()
        }
    })
}

function addChartjs() {
    let chartScript = document.createElement('script')
    chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
    chartScript.async = true
    document.body.append(chartScript)
    chartScript.onload = () => {
        let elvChartContainer = document.createElement('div')
        elvChartContainer.id = 'elvChartContainer'
        elvChartContainer.innerHTML = `<canvas id="elvChart"></canvas>`
        document.body.append(elvChartContainer)
        chartReady = true
        drawChart()
    }
}

function drawChart() {
    if (!chartReady) {
        return
    }
    var ctx = document.getElementById('elvChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Elevation',
                data: elvData.map(data => data.value),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        }
        ,
        options: {
            scales: {
                y: {
                    ticks: {
                        beginAtZero: true
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20
                    }
                }
            }
        }
    });
    console.log(myChart)
}