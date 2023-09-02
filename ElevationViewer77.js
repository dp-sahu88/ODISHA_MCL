let layer;
let map;
var vectorLayer;
var fetchedLines;
var getFeatureInfoControl;
var LineEndPointsLonLat = [];
var elvData = [];
var chartReady = false
var lineBreakPoints = {
    lon: []
    , lat: []
}
var myChart;
var points = [];
var highlightLayer;
var loadingObj = {
    isLoading: false,
    message: "Loading:",
    min: 0,
    max: 100,
    value: 0
}
var loading = new Proxy(loadingObj, {
    set: function (target, prop, value) {
        target[prop] = value
        if (!target.isLoading) {
            $('#elvChartLoading').css({ display: "none" })
            $('#elvProfShpInput').css({ display: "inline" })
        } else {
            $('#elvChartLoading').css({ display: "inline" })
            $('#elvProfShpInput').css({ display: "none" })
            $('#elvChartLoadingMsg').text(target.message)
            $('#elvChartLoadingBar').text((target.value || 0) + "/" + (target.max || 100))
            $('#elvChartLoadingBar').attr({ min: target.min || 0, max: target.max || 100, value: target.value || 0 })
        }
        return true
    }
})

// lizMap event listner
lizMap.events.on({
    layersadded: () => {
        addBottomDock()
        addChartjs()
    },
    bottomdockopened: (e) => {
        if (e.id == 'ElevationProfile') {
            map = lizMap.map
            vectorLayer = new OpenLayers.Layer.Vector("ElvProfileLine");
            map.addLayer(vectorLayer);
            map.events.register("click", map, onMapClick);
        }
        if (highlightLayer == undefined) {
            var highlightStyle = new OpenLayers.Style({
                graphicName: "circle",
                fillColor: "#ff0000",
                fillOpacity: 0.8,
                strokeWidth: 2,
                strokeColor: "#ffffff",
                strokeOpacity: 1,
                pointRadius: 6
            });
            highlightLayer = new OpenLayers.Layer.Vector('HighlightLayer', {
                styleMap: new OpenLayers.StyleMap({
                    "default": highlightStyle
                })
            })
            map.addLayer(highlightLayer)
        }
    },
    bottomdockclosed: (e) => {
        if (e.id == 'ElevationProfile') {
            map.events.unregister("click", map, onMapClick);
            layer = undefined
            vectorLayer.removeAllFeatures()
            map.removeLayer(vectorLayer);
            vectorLayer = undefined
            elvData = []
            updateChart()
            $('#dsm-layer-selector').val('').change()
            lizMap.map.getControlsByClass('OpenLayers.Control.Navigation')[0].enableZoomWheel()
            clearGetFeatureInfoControl()
            LineEndPointsLonLat = []
            if (highlightLayer) {
                map.removeLayer(highlightLayer)
                highlightLayer = undefined
            }
        }
    }
}
)
// Add points when map clicked 
function onMapClick(evt) {
    evt.preventDefault()
    if (loading.isLoading) {
        return
    }
    var point = map.getLonLatFromPixel(evt.xy);
    LineEndPointsLonLat.push(point)
    var feature = new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point(point.lon, point.lat)
    );
    if (vectorLayer.features.length === 0) {
        vectorLayer.addFeatures([feature]);
        elvData = []
        updateChart()
        highlightLayer.removeAllFeatures();
    } else if (vectorLayer.features.length === 1) {
        vectorLayer.addFeatures([feature]);
        var start = vectorLayer.features[0].geometry.getVertices()[0];
        var end = feature.geometry.getVertices()[0];
        var line = new OpenLayers.Geometry.LineString([start, end]);
        vectorLayer.addFeatures([new OpenLayers.Feature.Vector(line)]);
        if (layer) {
            loadFeatureInfo()
        }
        LineEndPointsLonLat = []
    } else {
        // Clear previous features and start a new line
        elvData = []
        updateChart()
        vectorLayer.removeAllFeatures();
        vectorLayer.addFeatures([feature]);
        highlightLayer.removeAllFeatures();
    }
}
// remove getFeatureInfoController 
function clearGetFeatureInfoControl() {
    if (getFeatureInfoControl) {
        getFeatureInfoControl.deactivate();
        map.removeControl(getFeatureInfoControl);
        getFeatureInfoControl = null
    }
}
// add getFeatureInfoController 
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
// handel the server responce
function handelGetInfo(e) {
    let jsondata = parseTableToJSON(e.text)
    if (jsondata.length == 0) {
        return
    }
    let value = jsondata[0].Value || jsondata[0].value
    var point = map.getLonLatFromPixel(e.xy);
    if (value) {
        elvData.push({
            x: point.lon,
            y: point.lat,
            value: value
        })
    }

    loading.value = 1 + loading.value
    if (loading.max == elvData.length) {
        loading.value = 0
        loading.message = "Rendering"
        lizMap.map.getControlsByClass('OpenLayers.Control.Navigation')[0].enableZoomWheel()
        generateDistanceAndSlope()
        shortByDistance()
        updateChart()
    }
    var feature = new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point(point.lon, point.lat)
    );
    vectorLayer.addFeatures([feature]);
}
// load the feature info when point are drawn
function loadFeatureInfo() {
    if (!getFeatureInfoControl) {
        return;
    }
    points = getIntermediatePointsLonLat(LineEndPointsLonLat)
    console.log(points)
    requestPointsData()
}
// returns the layer by name
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
// get all layers from the lizmap config
function getAllLayersName() {
    let currentLayers = Object.values(lizMap.config.layers)
    let layersName = []
    currentLayers.forEach(l => {
        layersName.push(l.name)
    });
    return layersName
}
// convert the html table to json
function parseTableToJSON(tableString) {

    if (tableString == '') {
        return []
    }
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
// add the bottom dock template and setup
function addBottomDock() {
    let layers = getAllLayersName()
    let layerOption = ''
    layers.forEach(l => {
        layerOption += `<option value="${l}">${l}</option>`
    })
    const template = `
                <div class="form-group" style="margin:4px;">
                    <select class="form-control" id="dsm-layer-selector" style="height:1.5rem;  margin:0;">
                        <option value="">Select DSM Layer</option>
                        ${layerOption}
                    </select>
                    <label for="elvDataDetailsLevel" style="color:#ffffff; display:inline;">Details level:</label>
                    <input type="range" min="1" max="13" value="3" step="1" id="elvDataDetailsLevel">
                    <div style="display:inline; margin-left:10px"> 
                        <button type="button" id="exportElvChart" class="btn btn-primary" style="height:1.7rem; margin:0;" >Export </button>
                        <select id="ExportChartAs" style="height:1.5rem; margin:0;">
                            <option value="csv">As CSV</option>
                            <option value="jpg">As JPG</option>
                        </select>
                    </div>
                    <div id="elvChartLoading" style="display:none">
                        <label for="elvChartLoadingBar" style="color:#ffffff; display:inline; margin-left:20px" id="elvChartLoadingMsg">Loading:</label>
                        <meter min="0" max="100" value="50" id="elvChartLoadingBar" style="height:1rem; width:10rem">...</meter>
                    </div>
                    <div id="elvProfShpInput" style="display:inline; margin-left:20px;">
                        <label for="elvProfShpFileInput" class="btn btn-primary"><i class="icon-file"></i> Choose file</label>
                        <input type="file" id="elvProfShpFileInput" accept=".kml" hidden=true/>
                    </div>
                </div>
           `;
    lizMap.addDock("ElevationProfile", "Elevation", "bottomdock", template, "icon-signal");
    $('#dsm-layer-selector').on('change', (e) => {
        layer = getLayerByname(e.target.value)
        if (layer != '') {
            addGetFeatureInfoControl()
        }
        else {
            clearGetFeatureInfoControl()
        }
    })
    $('#elvProfShpFileInput').on('input', (e) => {
        e.preventDefault()
        handelImportFile(e)
    })
}
// add the chart js to the ui
function addChartjs() {
    let chartScript = document.createElement('script')
    chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
    chartScript.async = true
    document.body.append(chartScript)
    chartScript.onload = () => {
        let elvChartContainer = document.createElement('div')
        elvChartContainer.id = 'elvChartContainer'
        elvChartContainer.style = "position: relative; height:40vh; width:100%; margin:auto;"
        elvChartContainer.innerHTML = `<canvas id="elvChart"></canvas>`
        $('#ElevationProfile').append(elvChartContainer)
        chartReady = true
        drawChart()
        $('#exportElvChart').on('click', (e) => {
            let exportFormat = $('#ExportChartAs').val()
            if (exportFormat == 'jpg') {
                exportCanvasAsJPG()
            } else {
                exportToExcel()
            }
        })
        $('#exportElvJPGBtn').on('click', (e) => {
            exportCanvasAsJPG()
        })
    }
}
// draw the chart to the canvas
function drawChart() {
    if (!chartReady) {
        return
    }
    var ctx = document.getElementById('elvChart').getContext('2d');
    // var gradient = ctx.createLinearGradient(0, 0, 0, 300);
    // gradient.addColorStop(0, 'rgba(49, 182, 235, 1)');
    // gradient.addColorStop(1, 'rgba(100, 100, 0,0.1)');
    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#99ffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Elevation',
                data: elvData.map(data => data.value),
                // backgroundColor: gradient,
                // fill:true,
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 5,
                // pointBackgroundColor: 'rgba(49, 182, 235, 1)',
                // pointBorderColor: 'rgba(49, 182, 235, 1)',
                // pointHoverBackgroundColor: 'rgba(49, 182, 235, 1)',
                tension: 0.2
            }, {
                label: 'Slope',
                data: elvData.map(data => data.slope || 0),
                borderColor: 'rgba(0, 0, 240, 1)',
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 5,
                tension: 0.2
            }]
        }
        ,
        options: {
            scales: {
                y: {
                    ticks: {
                        beginAtZero: true,
                        color: 'grey'
                    },
                    title: {
                        display: true,
                        text: 'Elevation/Slope',
                        color: '#911',
                        font: {
                            family: 'Times',
                            size: 20,
                            weight: 'bold',
                            lineHeight: 1.2,
                        }
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20,
                        color: 'grey',
                    },
                    title: {
                        display: true,
                        text: 'Distance',
                        color: '#911',
                        font: {
                            family: 'Times',
                            size: 20,
                            weight: 'bold',
                            lineHeight: 1.2,
                        }
                    }
                },
            },
            resize: true,
            maintainAspectRatio: false,
            plugins: {
                customCanvasBackgroundColor: {
                    color: 'white',
                }
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            onHover: (event, chartElement) => {
                if (chartElement.length > 0) {
                    heighlightPoint(chartElement[0])
                }
            }
        },
        plugins: [plugin],
    });
}
// export the elvdata as CSV
function exportToExcel() {
    if (elvData.length == 0) {
        return
    }
    // Step 1: Convert array of objects to CSV format
    const csvContent = elvData.map(obj => Object.values(obj).join(',')).join('\n');

    // Step 2: Create data URI for CSV content
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);

    // Step 3: Simulate click event to download Excel file
    let fileName = 'edall_map_goto' + Date.now() + '.csv'
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Update chart 
function updateChart() {
    myChart.data.labels = elvData.map(d => {
        let value = d.distance_m;
        return Math.round(value) + " m"
    })
    myChart.data.datasets[0].data = elvData.map(d => d.value || 0)
    myChart.data.datasets[1].data = elvData.map(d => d.slope || 0)
    myChart.update()
    loading.isLoading = false
    myChart.resize()
}
// genetate distance and slope for the elvData
function generateDistanceAndSlope() {
    if (elvData.length == 0) {
        return
    }
    let initialPoint = points[0]
    let previous = elvData[0]
    elvData = elvData.map(value => {
        let result = getDistance(initialPoint, value)
        let slope = getSlope(previous, value)
        previous = value
        value.slope = slope
        value.distance = result.distance
        value.distance_m = result.distance_m
        return value
    })
}
// calculate distance between two points
function getDistance(point1, point2) {
    let lonlat1 = { lon: point1.lon , lat: point1.lat}
    let lonlat2 = { lon: point2.x, lat: point2.y }
    let point_1 = new OpenLayers.Geometry.Point(lonlat1.lon, lonlat1.lat)
    let point_2 = new OpenLayers.Geometry.Point(lonlat2.lon, lonlat2.lat)
    var distance = point_1.distanceTo(point_2);
    var formattedDistance = {
        distance: distance < 1000 ? distance.toFixed(2) + " m" : (distance / 1000).toFixed(2) + " km",
        distance_m: distance,
    };
    return formattedDistance
}
// calculate the slope between two points
function getSlope(point1, point2) {
    let lonlat1 = { lon: point1.x, lat: point1.y }
    let lonlat2 = { lon: point2.x, lat: point2.y }
    let point_1 = new OpenLayers.Geometry.Point(lonlat1.lon, lonlat1.lat)
    let point_2 = new OpenLayers.Geometry.Point(lonlat2.lon, lonlat2.lat)
    var distance = point_1.distanceTo(point_2);
    var elevationDif = Math.abs(point1.value - point2.value)
    var slope = elevationDif / distance
    return slope
}
// short elvData by distance
function shortByDistance() {
    elvData = elvData.sort((a, b) => a.distance_m - b.distance_m)
}
// highlight points when mouse hover on the chart
function heighlightPoint(point) {
    highlightLayer.removeAllFeatures();
    let index = point.index
    if (elvData[index]) {
        var feature = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(elvData[index].x, elvData[index].y)
        );
        highlightLayer.addFeatures([feature]);
    }
}
// export chart canvas as image
function exportCanvasAsJPG() {
    const canvas = document.getElementById("elvChart");

    // Convert canvas to image data URL
    const dataURL = canvas.toDataURL("image/jpeg");

    // Create an anchor element to trigger the download
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = 'edall_map_goto' + Date.now() + '.jpg';

    // Programmatically click the download link
    downloadLink.click();
}
// generate the intermediate points for  the line
function getIntermediatePointsLonLat(lonlats) {
    if (lonlats.length < 0) {
        return []
    }
    let points = []
    let detailsLevelInput = $('#elvDataDetailsLevel').val()
    let detailsLevel = parseInt(detailsLevelInput) * 100
    let pointratio = getIntermediatePointRatio(lonlats, detailsLevel)
    
    for (i = 0; i< lonlats.length-1; i++ )
    {
        let point1 = lonlats[i]
        let point2 = lonlats[i+1]
        let lon1 = point1.lon || point1.x
        let lat1 = point1.lat || point1.y
        let lon2 = point2.lon || point2.x
        let lat2 = point2.lat || point2.y
        let deltaLon = lon2 - lon1
        let deltaLat = lat2 - lat1
        let lonStep = deltaLon / pointratio[i]
        let latStep = deltaLat / pointratio[i]
        let linePoints = []
        for (let j = 0; j < pointratio[i]; j++) {
            let lon = lon1 + lonStep * j
            let lat = lat1 + latStep * j
            linePoints.push({ lon: lon, lat: lat })
        }
        points.push(linePoints)
    }
    return points
}
// handel the file imported by the user input
function handelImportFile(evt) {
    loading.isLoading = true
    loading.message = "Reading File"
    let file = evt.target.files[0]
    let reader = new FileReader()
    let fileName = file.name
    let fileExt = fileName.split('.').pop().toLowerCase()
    reader.onload = (e) => {
        let data = e.target.result
        if (fileExt == "kml" || fileExt == "xml") {
            handelKMLData(data)
        }
        loading.isLoading = false
    }
    reader.readAsText(file)
}
// if the user input is a kml file then call this function with the extracted file data
function handelKMLData(data) {
    let xmlFormat = new OpenLayers.Format.XML({})
    let xml = xmlFormat.read(data)
    let features = xml.getElementsByTagName("LineString")
    if (features.length > 0) {
        handelLineString(features[0])
    }
}
// if the user input is a kml lineString
function handelLineString(feature) {
    let coordinates = feature.getElementsByTagName("coordinates")
    let vertices = []

    vertices = coordinates[0].childNodes[0].nodeValue.split(' ')
    vertices = vertices.map(value => {
        let lonLat = value.split(",")
        return [parseFloat(lonLat[0]), parseFloat(lonLat[1])]
    })

    let linePoints = generatePointGeometry(vertices)
    let lines = genetateLineGeometry(linePoints.points)
    vectorLayer.removeAllFeatures();
    vectorLayer.addFeatures([...linePoints.points, ...lines])
    let lonBreakPoints = linePoints.lonlat.map(l=>l.x)
    let latBreakPoints = linePoints.lonlat.map(l=>l.y)
    lineBreakPoints = {
        lon: lonBreakPoints,
        lat: latBreakPoints
    }
    points = getIntermediatePointsLonLat(linePoints.lonlat)
    requestPointsData()
}
// generate point geometry for the coordinete 
function generatePointGeometry(vertices) {
    let result = {
        lonlat: [],
        points: []
    }
    var projectProjection = lizMap.config.options?.qgisProjectProjection?.ref || "EPSG:4326"
    for (let i = 0; i < vertices.length; i++) {
        longitude = vertices[i][0]
        latitude = vertices[i][1]
        var lonLatPoint = new OpenLayers.Geometry.Point(longitude, latitude).transform(
            new OpenLayers.Projection(projectProjection),
            lizMap.map.getProjectionObject()
        );
        var pointFeature = new OpenLayers.Feature.Vector(lonLatPoint);
        result.lonlat.push(lonLatPoint)
        result.points.push(pointFeature)
    }
    return result
}
// create line geometry from points
function genetateLineGeometry(points) {
    if (points.length == 0) {
        return []
    }
    let result = []
    for (let i = 1; i < points.length; i++) {
        let point1 = points[i - 1].geometry.getVertices()[0]
        let point2 = points[i].geometry.getVertices()[0]
        let line = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([point1, point2]))
        result.push(line)
    }
    return result
}
// get the number of points on each line by calculating the line length
function getIntermediatePointRatio(lonlats, detailsLevel){
    if (lonlats.length<2){
        return 0
    }
    let totalDistance = 0
    let lineLengths = []
    for (let i = 0; i < lonlats.length-1; i++) {
        let lon1 = lonlats[i].x || lonlats[i].lon
        let lat1 = lonlats[i].y || lonlats[i].lat
        let lon2 = lonlats[i + 1].x || lonlats[i+1].lon
        let lat2 = lonlats[i + 1].y || lonlats[i+1].lat
        let deltaLon = lon2 - lon1
        let deltaLat = lat2 - lat1
        let lineLength = Math.sqrt(deltaLon * deltaLon + deltaLat * deltaLat)
        lineLengths.push(lineLength)
        totalDistance += lineLength
    }
    return lineLengths.map(l => {
        let numberOfPoints = Math.round((l/totalDistance) * detailsLevel)
        return numberOfPoints
    })
}
// request the data on each point 
function requestPointsData(i = 0) {
    if(!getFeatureInfoControl){
        return
    }
    if (points.length< 0){
        return
    }
    lizMap.map.getControlsByClass('OpenLayers.Control.Navigation')[0].disableZoomWheel()
    loading.max = points.length
    loading.value = 0
    loading.message = "Fetching"
    loading.isLoading = true
    elvData = []
    updateChart()
    points[i].forEach(async (point) => {
        var xy = map.getPixelFromLonLat(point)
        await getFeatureInfoControl.getInfoForClick({ xy: xy })
    })
    loading.message = "Featckhing(" + (i+1) + "/" + points.length +")"
    loading.max = points[i].length
}