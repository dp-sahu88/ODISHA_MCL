const lengthOption = `
  <option value="mi">miles</option>
  <option value="km">kilometers</option>
  <option value="m">meters</option>
  <option value="ft">feet</option>
  <option value="in">inch</option>
`

const areaOption = `
  <option value="mi²">miles (mi²)</option>
  <option value="km²">kilometers (km²)</option>
  <option value="m²">meters (m²)</option>
  <option value="ft²">feet (ft²)</option>
  <option value="yd²">yards (yd²)</option>
  <option value="acres">Acres</option>
`
function setOption(measureType, unitSelect) {
  if (measureType == 'length' || measureType == 'perimeter') {
    unitSelect.innerHTML = lengthOption
  } else if (measureType == 'area') {
    unitSelect.innerHTML = areaOption
  } else {
    unitSelect.innerHTML = ``
  }
}

lizMap.events.on({
  uicreated: function () {
    var measurementSelector = document.getElementById('measure-type')
    $('#measure-type').find("option[value='angle']").remove()
    var unitSelect = document.createElement('select');
    unitSelect.setAttribute('id', 'customUnit');
    var displayArea = document.createElement('p')
    displayArea.setAttribute('id', 'converted-measurment')
    let measureType = measurementSelector.value
    setOption(measureType, unitSelect)
    measurementSelector.addEventListener('change', (e) => {
      measureType = e.target.value
      displayArea.innerText = ''
      setOption(measureType, unitSelect)
    })
    unitSelect.addEventListener('change', (e) => {
      setCustomUnit(e.target.value)
    });
    $('#measure .menu-content').append(unitSelect)
    $('#measure .menu-content').append(displayArea)
  },
  minidockopened: function (e) {
    if (e.id == 'measure') {
      let message = document.getElementById('message')
      const observer = new MutationObserver(function (mutations) {
        let measureMessage = message.querySelector('#lizmap-measure-message')
        if (measureMessage != null) {
          measureMessage.style.display = 'none'
          let unitSelect = document.getElementById('customUnit')
          setCustomUnit(unitSelect.value)
        }
      });
      // Configure the observer to monitor changes in the inner text of the div element
      const config = { subtree: true, characterData: true, childList: true };
      observer.observe(message, config);
    }
  }
})

const setCustomUnit = (customUnit) => {
  // document.getElementById('lizmap-measure-message').setAttribute('height',0)
  target = $('#lizmap-measure-message')[0]
  let measureType = $('#measure-type')[0].value
  let displayArea = document.getElementById('converted-measurment')
  const observer = new MutationObserver(function (mutations) {
    // Callback function to be executed on changes
    // console.log("Inner text has changed", mutations[0].addedNodes[0].innerText);
    let p = mutations[0].addedNodes[0]
    let text = mutations[0].addedNodes[0].innerText
    let converted;
    if (measureType == 'length' || measureType == 'perimeter') {
      converted = convertLength(text, customUnit)
    }
    else if (measureType == 'area') {
      converted = convertArea(text, customUnit)
    } else if (measureType == '') {

    }
    displayArea.innerText = converted
    // console.log(converted)
    // Call your function here or perform any other actions
  });

  // Configure the observer to monitor changes in the inner text of the div element
  const config = { subtree: true, characterData: true, childList: true };
  observer.observe(target, config);
}



function convertLength(text, customUnit) {
  // Extracting the number and unit from the input text
  const parts = text.trim().split(" ");
  const number = parseFloat(parts[1]);
  const unit = parts[2];

  // Converting the number based on the customUnit
  let convertedValue;

  switch (customUnit) {
    case "m":
      if (unit === "in") {
        convertedValue = number * 0.0254; // Convert inches to meters
      } else if (unit === "km") {
        convertedValue = number * 1000; // Convert kilometers to meters
      } else if (unit === "mi") {
        convertedValue = number * 1609.34; // Convert miles to meters
      } else if (unit === "ft") {
        convertedValue = number * 0.3048; // Convert feet to meters
      } else {
        convertedValue = number; // Handle invalid units
      }
      break;

    case "in":
      if (unit === "m") {
        convertedValue = number * 39.3701; // Convert meters to inches
      } else if (unit === "km") {
        convertedValue = number * 39370.1; // Convert kilometers to inches
      } else if (unit === "mi") {
        convertedValue = number * 63360; // Convert miles to inches
      } else if (unit === "ft") {
        convertedValue = number * 12; // Convert feet to inches
      } else {
        convertedValue = number; // Handle invalid units
      }
      break;

    case "km":
      if (unit === "m") {
        convertedValue = number / 1000; // Convert meters to kilometers
      } else if (unit === "in") {
        convertedValue = number / 39370.1; // Convert inches to kilometers
      } else if (unit === "mi") {
        convertedValue = number * 1.60934; // Convert miles to kilometers
      } else if (unit === "ft") {
        convertedValue = number / 3280.84; // Convert feet to kilometers
      } else {
        convertedValue = number; // Handle invalid units
      }
      break;

    case "mi":
      if (unit === "m") {
        convertedValue = number / 1609.34; // Convert meters to miles
      } else if (unit === "in") {
        convertedValue = number / 63360; // Convert inches to miles
      } else if (unit === "km") {
        convertedValue = number / 1.60934; // Convert kilometers to miles
      } else if (unit === "ft") {
        convertedValue = number / 5280; // Convert feet to miles
      } else {
        convertedValue = number; // Handle invalid units
      }
      break;

    case "ft":
      if (unit === "m") {
        convertedValue = number / 0.3048; // Convert meters to feet
      } else if (unit === "in") {
        convertedValue = number / 12; // Convert inches to feet
      } else if (unit === "km") {
        convertedValue = number * 3280.84; // Convert kilometers to feet
      } else if (unit === "mi") {
        convertedValue = number * 5280; // Convert miles to feet
      } else {
        convertedValue = number; // Handle invalid units
      }
      break;

    default:
      convertedValue = number; // Handle invalid customUnit
      break;
  }
  convertedValue = convertedValue.toFixed(4)
  return `Measure: ${convertedValue} ${customUnit}`;
}


function convertArea(text, customUnit) {
  const conversions = {
    'mi2': {
      'km²': 2.58999,
      'm²': 2589988.11,
      'ft²': 27878400,
      'yd²': 3097600,
      'mi²': 1,
      'acres': 640
    },
    'km2': {
      'mi²': 0.386102,
      'm²': 1000000,
      'ft²': 10763910.4,
      'yd²': 1195990.05,
      'km²': 1,
      'acres': 247.105
    },
    'm2': {
      'mi²': 3.86102e-7,
      'km²': 1e-6,
      'ft²': 10.7639,
      'yd²': 1.19599,
      'm²': 1,
      'acres': 0.000247105
    },
    'ft2': {
      'mi²': 3.58701e-8,
      'km²': 9.2903e-8,
      'm²': 0.092903,
      'yd²': 0.111111,
      'ft²': 1,
      'acres': 0.0000229568
    },
    'yd2': {
      'mi²': 3.22831e-7,
      'km²': 8.36127e-7,
      'm²': 0.836127,
      'ft²': 9,
      'yd²': 1,
      'acres': 0.000206612
    },
    'acres': {
      'mi²': 1 / 640,
      'km²': 1 / 247.105,
      'm²': 4046.86,
      'ft²': 43560,
      'yd²': 4840,
      'acres': 1
    }
  };

  let number = text.split(' ')[1];
  let unit = text.split(' ')[2];
  if (!conversions[unit] || !conversions[unit][customUnit]) {
    return 'Invalid conversion';
  }

  let result = Number(number) * conversions[unit][customUnit];
  result = result.toFixed(4);
  return `Measure: ${result} ${customUnit}`;
}
