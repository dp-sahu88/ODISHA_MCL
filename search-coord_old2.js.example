lizMap.events.on({
    uicreated: () => {
        let searchForm = document.getElementById('nominatim-search')
        searchForm.addEventListener('submit', (e) => {
            let searchQuery = document.getElementById('search-query').value
            let coord = getCord(searchQuery)
            if (coord) {
                console.log(coord)
                lizMap.map.setCenter(coord, 18, true, true)
            }

        })
        console.log(searchForm);
    }
}
)

function isGeographicalCoordinate(str) {
    const coordinatePattern = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    return coordinatePattern.test(str);
}

function getCord(str) {
    // Use regular expression to extract latitude and longitude
    const regex = /^([-+]?\d{1,3}(?:\.\d*)?),\s*([-+]?\d{1,3}(?:\.\d*)?)$/;
    const match = str.match(regex);

    if (match) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);

        return [longitude, latitude]
    } else {
        return false
    }
}