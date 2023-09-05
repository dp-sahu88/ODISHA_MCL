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

            } else {
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
        <div id="toggle-draw-volume-tool" class="icon-pencil" style="background-color:blue; width:20px;"></div>
        <div id="volume-calculator-dsplay" style="background-color:blue; width:20px; display:block;"></div>
        `
        lizMap.addDock("VolumeCalculator", "Volume", "minidock", template, " icon-stop");
        $('#volume-dsm-layer-selector').on('change', e=>(volumeClaculator.setDsmLayer()))
        $('#toggle-draw-volume-tool').on('click', e=>(volumeClaculator.toggleDrawPolygon()))
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
            if (this.dsmLayer){
                this.addGetFeatureInfoControl()
            }else{
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
    addDrawControl(){
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
    toggleDrawPolygon(){
        if (this.drawControl.active) {
            this.vectoLayer.removeAllFeatures()
            this.drawControl.deactivate();
        } else {
            this.vectoLayer.removeAllFeatures()
            this.drawControl.activate();
        }
    }
    handelQuery(e) {
        if (!this.dsmLayer){
            return
        }
        volumeClaculator.elvData = []
        this.drawControl.deactivate();
        let feature = e.feature;
        this.geometry = feature.geometry;
        this.points = this.getInnerPoints(this.geometry)
        volumeClaculator.loading.max = this.points.length
        this.requestData(this.points)

    }
    getInnerPoints(geometry){
        let bounds = geometry.bounds
        let hSample = 20
        let vSample = 20
        let hDelta = Math.abs(bounds.right - bounds.left)
        let vDelta = Math.abs(bounds.top - bounds.bottom)
        let hStep = hDelta/hSample
        let vStep = vDelta/vSample
        let points = []

        for(let i = 0; i<= vSample; i++){
            for(let j = 0; j<= hSample; j++){
                let x = bounds.left + j*hStep
                let y = bounds.bottom + i*vStep
                let pointGeometry = new OpenLayers.Geometry.Point(x, y)
                if (pointGeometry.intersects(geometry)){
                    let feature = new OpenLayers.Feature.Vector(
                        pointGeometry
                    );
                    this.vectoLayer.addFeatures([feature])
                    points.push({lon:x, lat:y})
                }
            }
        }
        console.log(bounds)
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
    handelGetInfo(e){
        console.log(e)
        let jsondata = volumeClaculator.parseTableToJSON(e.text)
        if (jsondata.length == 0) {
            return
        }
        let value = jsondata[0].Value || jsondata[0].value
        var point = volumeClaculator.map.getLonLatFromPixel(e.xy);
        if (value) {
            volumeClaculator.elvData.push({
                x: point.lon,
                y: point.lat,
                value: value
            })
            volumeClaculator.loading.value += 1 
        }
        if (volumeClaculator.loading.max == volumeClaculator.loading.value){
            volumeClaculator.calculateVolume()
        }
    }
    requestData(query) {
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
        let baseHeight = prompt("enter the base elevation")
        if (!baseHeight) {
            return
        }
        console.log(baseHeight, typeof(baseHeight))
        this.elvData.forEach(d => {
            d.value = d.value - parseFloat(baseHeight)
        })
        let averageElv = volumeClaculator.averageElv()
        let area = this.geometry.getArea()
        // console.log(area, averageElv)
        let volume = area * averageElv
        console.log(volume)
    }
    averageElv() {
        if (this.elvData.length == 0) {
            return 0
        }
        let sum = 0
        this.elvData.forEach(d => {
            sum += d.value
        })
        return sum/this.elvData.length
    }
}