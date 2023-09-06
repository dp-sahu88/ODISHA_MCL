// lizMap event listner
let volumeClaculator
lizMap.events.on({
    layersadded: () => {
        let vectorLayer = new OpenLayers.Layer.Vector("volumeCalculator");
        volumeClaculator = new VolumeClaculator(lizMap.map, vectorLayer)
        volumeClaculator.addMiniDock()
        volumeClaculator.addDrawControl()
        volumeClaculator.addGetFeatureInfoControl()
    },
    bottomdockopened: (e) => { },
    bottomdockclosed: (e) => { }
}
)
class VolumeClaculator {
    loadingObj = {  // loading data 
        isLoading: false,
        message: "Loading:",
        min: 0,
        max: 100,
        value: 0
    }
    loading = new Proxy(loadingObj, { // handel loading
        set: function (target, prop, value) {
            target[prop] = value
            if (!target.isLoading) {
                $('#volumeCalcLoading').css({ display: "none" })
                $('#volume-claculator-display').css({ display: "block" })
                $('#toggle-draw-volume-tool').css({ display: "inline" })
                $('#VolumeCalculator .menu-content').attr('style', 'max-height:fit-content;')
            } else {
                $('#volumeCalcLoading').css({ display: "inline" })
                $('#volume-claculator-display').css({ display: "none" })
                $('#toggle-draw-volume-tool').css({ display: "none" })
                $('#volumeCalcLoadingMsg').text(target.message)
                $('#volumeCalcLoadingBar').text((target.value || 0) + "/" + (target.max || 100))
                $('#volumeCalcLoadingBar').attr({ min: target.min || 0, max: target.max || 100, value: target.value || 0 })
                $('#VolumeCalculator .menu-content').attr('style', 'max-height:fit-content;')
            }
            return true
        }
    })

    constructor(map, vectorLayer) {
        this.map = map
        this.vectoLayer = vectorLayer
        map.addLayer(this.vectoLayer)
    }
    addMiniDock() {
        let layers = this.getAllLayersName()
        let layerOption = ''
        layers.forEach(l => {
            layerOption += `<option value="${l}">${l}</option>`
        })
        let template = `
        <select class="form-control" id="volume-dsm-layer-selector" style="height:1.5rem;  margin:0;">
            <option value="">Select DSM Layer</option>
            ${layerOption}
        </select>
        <div id="toggle-draw-volume-tool" style="background-color:Aqua; border-radius:5px; padding:5px; display:inline;"><i class="icon-pencil"></i></div>
        <label for="volumeBaseElv">Base Elevation:</label>
        <input type="number" step="0.01" id="volumeBaseElv">
        <div id="volume-claculator-display">
            <div id="volume-calculator-dsplay-volume" style="background-color:white; text-color:black; border-radius:5px; display:block; margin-top:3px;"></div>
            <div id="volume-calculator-dsplay-cutvolume" style="background-color:white; text-color:black; border-radius:5px; display:block; margin-top:3px;"></div>
            <div id="volume-calculator-dsplay-fillvolume" style="background-color:white; text-color:black; border-radius:5px; display:block; margin-top:3px;"></div>
            <div id="volume-calculator-dsplay-area" style="background-color:white; text-color:black; border-radius:5px; display:block; margin-top:3px;"></div>
        </div>
        <div id="volumeCalcLoading" style="display:none">
            <label for="volumeCalcLoadingBar" style="color:#000000; display:inline; margin-left:5px" id="volumeCalcLoadingMsg">Loading:</label>
            <meter min="0" max="100" value="50" id="volumeCalcLoadingBar" style="height:1rem; width:10rem">...</meter>
        </div>
        `
        lizMap.addDock("VolumeCalculator", "Volume", "minidock", template, " icon-stop");
        $('#volume-dsm-layer-selector').on('change', e => (volumeClaculator.setDsmLayer()))
        $('#toggle-draw-volume-tool').on('click', e => (volumeClaculator.toggleDrawPolygon()))
    }
    getAllLayersName() {
        let layerNames = []
        let layersArr = Object.values(lizMap.config.layers)
        layersArr.forEach(l => {
            layerNames.push(l.name)
        })
        return layerNames
    }
    setDsmLayer() {
        let layerName = $('#volume-dsm-layer-selector').val()

        this.dsmLayer = this.layerByName(layerName)
        if (this.dsmLayer) {
            this.addGetFeatureInfoControl()
        } else {
            this.clearGetFeatureInfoControl()
        }
    }
    layerByName(name) {
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
    addDrawControl() {
        this.drawControl = new OpenLayers.Control.DrawFeature(this.vectoLayer, OpenLayers.Handler.Polygon, {
            drawCircle: false,
            drawPolygon: true,
            drawLineString: false,
            drawBox: false,
            drawRegularPolygon: false,
            drawEllipse: false,
            drawCircleMarker: false,
            drawMarker: false
        });
        this.map.addControl(this.drawControl);
        this.drawControl.events.on({
            "featureadded": (e) => {
                this.handelQuery(e)
            }
        })
    }
    toggleDrawPolygon() {
        if (this.drawControl.active) {
            this.vectoLayer.removeAllFeatures()
            this.drawControl.deactivate();
        } else {
            this.vectoLayer.removeAllFeatures()
            this.drawControl.activate();
        }
    }
    handelQuery(e) {
        if (!this.dsmLayer) {
            return
        }
        volumeClaculator.elvData = []
        this.drawControl.deactivate();
        let feature = e.feature;
        this.geometry = feature.geometry;
        this.points = this.getInnerPoints(this.geometry)
        this.requestData(this.points)
    }
    getInnerPoints(geometry) {
        let bounds = geometry.bounds
        let hSample = 20
        let vSample = 20
        let hDelta = Math.abs(bounds.right - bounds.left)
        let vDelta = Math.abs(bounds.top - bounds.bottom)
        let hStep = hDelta / hSample
        let vStep = vDelta / vSample
        let points = []

        for (let i = 0; i <= vSample; i++) {
            for (let j = 0; j <= hSample; j++) {
                let x = bounds.left + j * hStep
                let y = bounds.bottom + i * vStep
                let pointGeometry = new OpenLayers.Geometry.Point(x, y)
                if (pointGeometry.intersects(geometry)) {
                    let feature = new OpenLayers.Feature.Vector(
                        pointGeometry
                    );
                    this.vectoLayer.addFeatures([feature])
                    points.push({ lon: x, lat: y })
                }
            }
        }
        return points
    }
    addGetFeatureInfoControl() {
        if (this.getFeatureInfoControl) {
            this.clearGetFeatureInfoControl()
        }
        if (!this.dsmLayer) {
            return
        }
        this.getFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
            hover: true,
            title: 'Identify features by clicking for volume',
            layers: [this.dsmLayer],
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
        this.getFeatureInfoControl.events.register('getfeatureinfo', this.getFeatureInfoControl, this.handelGetInfo)
    }
    clearGetFeatureInfoControl() {
        if (this.getFeatureInfoControl) {
            this.getFeatureInfoControl.deactivate();
            this.map.removeControl(getFeatureInfoControl);
            this.getFeatureInfoControl = null
        }
    }
    handelGetInfo(e) {
        let jsondata = volumeClaculator.parseTableToJSON(e.text)
        if (jsondata.length == 0) {
            return
        }
        let value = jsondata[0].Value || jsondata[0].value
        var point = volumeClaculator.map.getLonLatFromPixel(e.xy);
        if (value && volumeClaculator.status == "pending") {
            volumeClaculator.perimElvData.push({
                x: point.lon,
                y: point.lat,
                value: value
            })
            volumeClaculator.loading.value += 1
        } else if (value) {
            volumeClaculator.elvData.push({
                x: point.lon,
                y: point.lat,
                value: value
            })
            volumeClaculator.loading.value += 1
        }
        if (volumeClaculator.loading.max == volumeClaculator.loading.value) {
            volumeClaculator.loading.isLoading = false
            volumeClaculator.calculateVolume()
        }
    }
    requestData(query) {
        volumeClaculator.loading.max = query.length
        volumeClaculator.loading.value = 0
        volumeClaculator.loading.isLoading = true
        if (volumeClaculator.status == "pending") {
            volumeClaculator.loading.message = "Retriving Base"
        } else {
            volumeClaculator.loading.message = "Loading"
        }
        this.map.addControl(this.getFeatureInfoControl)
        this.getFeatureInfoControl.activate();
        query.forEach(async (point) => {
            var xy = this.map.getPixelFromLonLat(point)
            await this.getFeatureInfoControl.getInfoForClick({ xy: xy })
        })
        this.getFeatureInfoControl.deactivate();
        this.map.removeControl(this.getFeatureInfoControl)
    }
    parseTableToJSON(tableString) {

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
    calculateVolume() {
        let baseHeight = $("#volumeBaseElv").val()
        baseHeight = parseFloat(baseHeight)
        if (!baseHeight && volumeClaculator.status != "pending") {
            volumeClaculator.status = "pending"
            volumeClaculator.calculeteBaseHeight()
            return
        } else if (!baseHeight && volumeClaculator.status == "pending") {
            baseHeight = volumeClaculator.averageElv(volumeClaculator.perimElvData)
            volumeClaculator.status = "complete"
        }
        let cut = []
        let fill = []
        let total = []
        volumeClaculator.elvData.forEach(d => {
            let dif = parseFloat(d.value ) - parseFloat(baseHeight)
            console.log(dif)
            if (dif > 0) {
                cut.push(dif)
            }
            if (dif < 0) {
                fill.push(dif)
            }
            total.push(dif)
        })
        console.log(cut, fill , total)
        let totalAvgElv = total.reduce(function (x,y){return x + y;}, 0)/ total.length
        let cutAvgElv = cut.reduce(function(x,y){return x + y;}, 0)/ total.length
        let fillAvgElv = fill.reduce(function(x,y){return x + y}, 0)/ total.length
        console.log(cutAvgElv, fillAvgElv,totalAvgElv)
        let area = this.geometry.getArea()
        let cutVolume = area * cutAvgElv
        let fillVolume = area * fillAvgElv
        let totalVolume = area * totalAvgElv
        console.log(cutVolume, fillVolume, totalVolume)
        $('#volume-calculator-dsplay-area').html(`Area: ${area} m<sup>2</sup>`)
        $('#volume-calculator-dsplay-volume').html(`Volume: ${totalVolume} m<sup>3</sup>`)
        $('#volume-calculator-dsplay-cutvolume').html(`Cut Volume: ${cutVolume} m<sup>3</sup>`)
        $('#volume-calculator-dsplay-fillvolume').html(`Fill Volume: ${fillVolume} m<sup>3</sup>`)
        $('#VolumeCalculator .menu-content').attr('style', 'max-height:fit-content;')
    }
    averageElv(elvInfo) {
        if (elvInfo.length == 0) {
            return 0
        }
        let sum = 0
        elvInfo.forEach(d => {
            sum += parseFloat(d.value)
        })
        return sum / elvInfo.length
    }
    calculeteBaseHeight() {
        let vertices = volumeClaculator.geometry.getVertices()
        volumeClaculator.points = volumeClaculator.getIntermediatePointsLonLat(vertices)
        volumeClaculator.perimElvData = []
        volumeClaculator.requestData(volumeClaculator.points)
    }
    getIntermediatePointsLonLat(lonlats) {
        if (lonlats.length < 0) {
            return []
        }
        let points = []
        let detailsLevel = 100
        let pointratio = volumeClaculator.getIntermediatePointRatio(lonlats, detailsLevel)
        for (let i = 0; i < lonlats.length - 1; i++) {
            let point1 = lonlats[i]
            let point2 = lonlats[i + 1]
            let lon1 = point1.lon || point1.x
            let lat1 = point1.lat || point1.y
            let lon2 = point2.lon || point2.x
            let lat2 = point2.lat || point2.y
            let deltaLon = lon2 - lon1
            let deltaLat = lat2 - lat1
            let lonStep = deltaLon / pointratio[i]
            let latStep = deltaLat / pointratio[i]
            for (let j = 0; j < pointratio[i]; j++) {
                let lon = lon1 + lonStep * j
                let lat = lat1 + latStep * j
                points.push({ lon: lon, lat: lat })
            }
        }
        return points
    }
    getIntermediatePointRatio(lonlats, detailsLevel) {
        if (lonlats.length < 2) {
            return 0
        }
        let totalDistance = 0
        let lineLengths = []
        for (let i = 0; i < lonlats.length - 1; i++) {
            let lon1 = lonlats[i].x || lonlats[i].lon
            let lat1 = lonlats[i].y || lonlats[i].lat
            let lon2 = lonlats[i + 1].x || lonlats[i + 1].lon
            let lat2 = lonlats[i + 1].y || lonlats[i + 1].lat
            let deltaLon = lon2 - lon1
            let deltaLat = lat2 - lat1
            let lineLength = Math.sqrt(deltaLon * deltaLon + deltaLat * deltaLat)
            lineLengths.push(lineLength)
            totalDistance += lineLength
        }
        return lineLengths.map(l => {
            let numberOfPoints = Math.round((l / totalDistance) * detailsLevel)
            return numberOfPoints
        })
    }
}