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
        <button type="button" class="btn btn-primary" id="genAnoatationPdf" style="margin-bottom:1rem;">generate PDF</button>
        <div id = "anotation preview"> </div>`
        // <button type="button" class="btn btn-primary" id="getAnoatationPdf" style="margin-top:1rem;">Get PDF</button>
        lizMap.addDock("Anotation", "Anotation", "minidock", template, "icon-list-alt")

        $('#genAnoatationPdf').click((e) => {
            e.preventDefault();
            this.genAnotation()
        });
        // $('#getAnoatationPdf').click((e) => {
        //     e.preventDefault();
        //     this.getAnotation()
        // });

    }
    genAnotation() {
        console.log("fetching data")
        let data = this.getData()
        data.then((value)=>{
            this.genDoc(value)
        })
    }
    // getAnotation() {
    //     if (this.printWindow){
    //         this.printWindow.print();
    //         // this.printWindow.close();
    //     }
    // }
    async getData() {
        let repository = lizUrls.params.repository
        let project = lizUrls.params.project
        let wms = lizUrls.wms
        let url =`${wms}?repository=${repository}&project=${project}`

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
    genDoc(data){
        if (data.constructor !== ({}).constructor){
            return
        }
        let doc= ''
        console.log(data);
        data.features.forEach(element => {
            doc += `
                <h1>${element.properties.title}</h1>
                <p> ${element.properties.desc} <p>
            `
        });
        let printDoc = document.createElement("div")
        printDoc.innerHTML = doc
        let printWindow = window.open('','','height=400,width=900')
        printWindow.document.write(printDoc.innerHTML)
        printWindow.document.close();
        printWindow.addEventListener("afterprint", (event) => {
            console.log(event)
            printWindow.close()
        });
        printWindow.print();
    }
}