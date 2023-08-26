let formTemp = {
    degree: `<label for="longitude">Longitude:</label>
    <input inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*" id="longitude" name="longitude" placeholder="Enter longitude required">
    
    <label for="latitude">Latitude:</label>
    <input inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*" id="latitude" name="latitude" placeholder="Enter latitude required">

    <input type="submit" value="Add">`,
    dm: `  
    <label for="longitude">Longitude:</label>
    <input type="text" id="longitude" name="longitude" placeholder="e.g. 85°16.4'E" pattern="[0-9]{1,3}°[0-9]{1,2}\.?([0-9]{1,3})?'[EW]" required>
    <br>
    <label for="latitude">Latitude:</label>
    <input type="text" id="latitude" name="latitude" placeholder="e.g. 20°44.12'N" pattern="[0-9]{1,2}°[0-9]{1,2}\.?([0-9]{1,3})?'[NS]" required> 
    <br>
    <input type="submit" value="Submit">`,
    dms: `  
    <label for="longitude">Longitude:</label>
    <input type="text" id="longitude" name="longitude" placeholder='e.g. 85°16&apos;44.21"E' pattern="[0-9]{1,3}°[0-9]{1,2}'[0-9]{1,2}\.?([0-9]{0,4})?&quot;[EW]" required>
    <br>
    <label for="latitude">Latitude:</label>
    <input type="text" id="latitude" name="latitude" placeholder='e.g. 20°44&apos;12.74"N' pattern="[0-9]{1,3}°[0-9]{1,2}'[0-9]{1,2}\.?([0-9]{0,4})?&quot;[NS]" required>
    <br>
    <input type="submit" value="Submit">`,
    coordUnitSelector: `<select id="coordinateUnitSelector">
        <option value="degree">Degree</option>
        <option value="dm">Deg. min.</option>
        <option value="dms">D.M.S.</option>
    </select>
    `
}

lizMap.events.on({
    uicreated: () => {
        const template = `
            <div id='goto-section'>
            ${formTemp.coordUnitSelector}
            <form id='goto-loc'>
                ${formTemp.degree}
            </form>
            <button id="Export_goto_layer" style="background-color: grey; color: white; font-size: 16px;">Export</button>
            </div>`;

        lizMap.addDock("Goto", "Goto", "minidock", template, "icon-map-marker");
        $('#goto-loc').on('submit', (e) => {
            e.preventDefault();
            const coordUnit = $('#coordinateUnitSelector').val();
            let longitude;
            let latitude;
            if (coordUnit == 'degree') {
                longitude = parseFloat($('#longitude').val());
                latitude = parseFloat($('#latitude').val());
            } else if (coordUnit == 'dm') {
                let parsed = getLonlatDM()
                longitude = parseFloat(parsed.lon)
                latitude = parseFloat(parsed.lat)
            } else if (coordUnit == 'dms') {
                let parsed = getLonlatDMS()
                longitude = parseFloat(parsed.lon)
                latitude = parseFloat(parsed.lat)
            }

            var layer = getLayerByname('GoTo_layer')
            if (!layer) {
                layer = new OpenLayers.Layer.Vector("GoTo_layer");
            }
            var projectProjection = lizMap.config.options?.qgisProjectProjection?.ref || "EPSG:4326"
            var lonLatPoint = new OpenLayers.Geometry.Point(longitude, latitude).transform(
                new OpenLayers.Projection(projectProjection),
                lizMap.map.getProjectionObject()
            );
            var pointFeature = new OpenLayers.Feature.Vector(lonLatPoint);
            var pointStyle = {
                pointRadius: 10,
                fillColor: "#ff0000",
                fillOpacity: 0.8,
                strokeColor: "#000000",
                strokeWidth: 2,
                strokeOpacity: 1
            };

            pointFeature.style = pointStyle;
            pointFeature.data = {
                lon: longitude,
                lat: latitude
            }
            layer.addFeatures([pointFeature]);
            lizMap.map.addLayers([layer]);
            lizMap.map.zoomToExtent(pointFeature.geometry.getBounds());
        })

        $('#coordinateUnitSelector').on('change', (e) => {
            const coordUnit = e.target.value
            $('#goto-loc').html(formTemp[coordUnit])
        })

        $('#Export_goto_layer').on('click', exportLayer)
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

function getLonlatDM() {
    const longitudeInput = document.getElementById('longitude').value;
    const latitudeInput = document.getElementById('latitude').value;
    const lonRegex = /(\d+)°(\d+\.?\d+?)'([EW])/;
    const latRegex = /(\d+)°(\d+\.?\d+?)'([NS])/;
    const lonMatches = longitudeInput.match(lonRegex);
    const latMatches = latitudeInput.match(latRegex);
    console.log(latMatches,lonMatches)
    const lonDegrees = parseInt(lonMatches[1]) + parseFloat(lonMatches[2]) / 60;
    const latDegrees = parseInt(latMatches[1]) + parseFloat(latMatches[2]) / 60;
    const lonSign = lonMatches[4] === 'W' ? -1 : 1;
    const latSign = latMatches[4] === 'S' ? -1 : 1;
    const lonDegreesSigned = lonDegrees * lonSign;
    const latDegreesSigned = latDegrees * latSign;
    return {
        lon: lonDegreesSigned,
        lat: latDegreesSigned
    }
}

function getLonlatDMS() {
    // Get the latitude and longitude input elements
    const latitudeInput = document.getElementById('latitude').value;
    const longitudeInput = document.getElementById('longitude').value;


    // Extract the latitude and longitude values using regular expressions
    const latitudeRegex = /^(\d+)°(\d+)'(\d+\.?\d+?)"([NS])$/;
    const longitudeRegex = /^(\d+)°(\d+)'(\d+\.?\d+?)"([EW])$/;

    const latitudeMatch = latitudeInput.match(latitudeRegex);
    const longitudeMatch = longitudeInput.match(longitudeRegex);
    console.log(latitudeMatch, longitudeMatch)
    const latitude = latitudeMatch ? parseInt(latitudeMatch[1]) + (parseInt(latitudeMatch[2]) / 60) + (parseFloat(latitudeMatch[3]) / 3600) : null;
    const longitude = longitudeMatch ? parseInt(longitudeMatch[1]) + (parseInt(longitudeMatch[2]) / 60) + (parseFloat(longitudeMatch[3]) / 3600) : null;

    // Ensure latitude is negative for "S" and longitude is negative for "W"
    if (latitudeMatch && latitudeMatch[4] === "S") {
        latitude *= -1;
    }

    if (longitudeMatch && longitudeMatch[4] === "W") {
        longitude *= -1;
    }
    return {
        lat: latitude,
        lon: longitude
    }
}

let KMLpointStyle = `    
<Style id="pointStyle">
      <IconStyle>
        <scale>1</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
        <hotSpot x="0.5" y="0" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ff000000</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>ccff0000</color>
      </PolyStyle>
</Style>
`

function exportLayer(e) {
    var layer = getLayerByname('GoTo_layer')
    console.log(layer)
    if (!layer) {
        return
    }
    var features = layer.features
    // console.log(features)
    let kmlString = genXML(features)
    let filename = 'edall_map_goto'+Date.now()+'.kml'
    saveStringAsFile(kmlString,filename );    

}

function genXML(features) {

    internalProjection = lizMap.map.baseLayer.projection

    var placemarks = getPlaceMarks(features)
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
       <Document>
        ${KMLpointStyle}
        ${placemarks}
       </Document>
     </kml>
     `
    return kml
}

function getPlaceMarks(features) {
    console.log(features);
    let placemarks = ``;
    features.forEach(
        (feature, index) => {
            placemarks += `
            <Placemark>
                <name>point_${index}</name>
                <description>point at ${feature.data.lon},${feature.data.lat}</description>
                <styleUrl>#pointStyle</styleUrl>
                <Point>
                    <coordinates>${feature.data.lon},${feature.data.lat}</coordinates>
                </Point>
            </Placemark>`
        }
    )
    return placemarks
}

function saveStringAsFile(stringContent, filename) {
  const blob = new Blob([stringContent], { type: 'text/plain' });
  const blobURL = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobURL;
  link.download = filename;

  link.click();

  URL.revokeObjectURL(blobURL);
}
