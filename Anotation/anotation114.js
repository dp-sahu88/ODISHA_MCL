let lizmapAnotation
lizMap.events.on({
    layersadded: () => {
        lizmapAnotation = new Anotation()
        lizmapAnotation.addDock()
    }
})

class Anotation {
    constructor() {

    }
    addDock() {
        let template = `
        <button type="button" class="btn btn-primary" id="genAnoatationPdf" style="position:absolute; top:5px; left:5px;">generate PDF</button>
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
        console.log("fetching data")
        let data = this.getData()
        data.then((value) => {
            this.genDoc(value)
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
    genDoc(data) {
        if (data.constructor !== ({}).constructor) {
            return
        }
        // let doc = ''
        this.features = data.features
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
            let imageId = type_id.join("_img_")
            let doc = document.createElement('div')
            document.getElementById('anotation-preview').appendChild(doc);
            let desc = element.properties.desc
            doc.innerHTML  = `
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
                console.log("canvas ready...")
                var data = canvas.toDataURL('image/png');
                //display 64bit imag
                var image = new Image();
                image.src = data;
                document.getElementById(imageId).appendChild(image)
                resolve(index + 1)
            })

        }).then(value => {
            if (value < this.features.length) {
                this.addDoc(value)
            }
        })
    }

}