let lizmapAnotation
lizMap.events.on({
    layersadded: () => {
        lizmapAnotation = new Anotation()
        lizmapAnotation.addDock()
    }
})

class Anotation {
    constructor() {
        this.vectorLayer = new OpenLayers.Layer.Vector("anotationVectorLayer")
        lizMap.map.addLayer(this.vectorLayer)
    }
    addDock() {
        let template = `
        <div style="position:absolute; top:5px; left:5px;">
            <button type="button" class="btn btn-primary" id="genAnoatationPdf">generate PDF</button>
            <input type="month" id="AnotationFilterMonth" style="margin-bottom:0;">
        </div>
        <div id = "anotation-preview"> </div>
        <button type="button" class="btn btn-primary" id="getAnoatationPdf" style="position:absolute; bottom:5px; left:5px;">Get PDF</button>`
        lizMap.addDock("Anotation", "Anotation", "right-dock", template, "icon-list-alt")

        $('#genAnoatationPdf').click((e) => {
            e.preventDefault();
            this.genAnotation()
        });
        $('#getAnoatationPdf').click((e) => {
            e.preventDefault();
            this.getAnotation()
        });

    }
    genAnotation() {
        let data = this.getData()
        data.then((value) => {
            let filtered_data = this.applyFilter(value)
            this.genDoc(filtered_data)
        })
    }
    getAnotation() {
        let printDoc = document.createElement("div")
        printDoc.innerHTML = document.getElementById("anotation-preview").innerHTML
        let printWindow = window.open('', '', 'height=400,width=900')
        printWindow.document.write(printDoc.innerHTML)
        printWindow.document.close();
        printWindow.addEventListener("afterprint", (event) => {
            printWindow.close()
        });
        printWindow.print();
    }
    async getData() {
        let repository = lizUrls.params.repository
        let project = lizUrls.params.project
        let wms = lizUrls.wms
        let url = `${wms}?repository=${repository}&project=${project}`

        let res = await fetch(url, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": url,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=Anotation&OUTPUTFORMAT=GeoJSON&GEOMETRYNAME=extent",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        let data = await res.json()
        return data
    }
    genDoc(f) {
        this.features = f
        if (this.features.length > 0) {
            $("#anotation-preview").html('')
            this.addDoc(0)
        }
    }
    async addDoc(index) {
        await new Promise(async (resolve, reject) => {
            let element = this.features[index]
            let type_id = element.id.split(".")
            lizMap.zoomToFeature(type_id[0], type_id[1], "zoom")
            let pointGeometry = this.generatePointGeometry(element.geometry.coordinates[0])
            let geometry = new OpenLayers.Geometry.LinearRing(pointGeometry)
            let polyFeature = new OpenLayers.Feature.Vector(geometry)
            this.vectorLayer.addFeatures([polyFeature])
            let imageId = type_id.join("_img_")
            let doc = document.createElement('div')
            document.getElementById('anotation-preview').appendChild(doc);
            let desc = element.properties.desc
            doc.innerHTML = `
            <h1>${element.properties.title}</h1>
            <div id=${imageId}></div>
            <p>  <p>
            `
            let i = 0
            typeWriter()
            function typeWriter() {
                if (i < desc.length) {
                    doc.getElementsByTagName("p")[0].innerHTML += desc.charAt(i);
                    i++;
                    setTimeout(typeWriter, 10);
                }
            }

            await new Promise(r => setTimeout(r, 1000));
            html2canvas(document.getElementById("map"), {
                allowTaint: true
            }).then((canvas) => {
                var data = canvas.toDataURL('image/png');
                //display 64bit imag
                var image = new Image();
                image.src = data;
                document.getElementById(imageId).appendChild(image)
                resolve(index + 1)
            })

        }).then(value => {
            this.vectorLayer.removeAllFeatures()
            if (value < this.features.length) {
                this.addDoc(value)
            }
        })
    }
    generatePointGeometry(vertices) {
        let pointFeatures = []
        var projectProjection = lizMap.config.layers.Anotation.featureCrs || "EPSG:4326"
        for (let i = 0; i < vertices.length; i++) {
            let longitude = vertices[i][0]
            let latitude = vertices[i][1]
            var lonLatPoint = new OpenLayers.Geometry.Point(longitude, latitude).transform(
                new OpenLayers.Projection(projectProjection),
                lizMap.map.getProjectionObject()
            );
            pointFeatures.push(lonLatPoint)
        }
        return pointFeatures
    }

    applyFilter(data){  
        if (data.constructor !== ({}).constructor) {
            return
        }
        let query = $('#AnotationFilterMonth').val()
        if (!query){
            return  data.features
        }

        // let doc = ''
        query = new Date(query);
        let filtered_data = [] 
        data.features.forEach(element => {
            let eleCreatedOn = new Date(element.properties.created_on)
            console.log(eleCreatedOn);
            if (query.getFullYear() == eleCreatedOn.getFullYear()&& query.getMonth() == eleCreatedOn.getMonth()){
                filtered_data.push(element)
            }
        });
        return filtered_data
    }

}