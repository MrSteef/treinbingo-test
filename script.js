// import * as d3 from "d3";

let id;
let latitude;
let longitude;
let autoRefreshStation = false;

const options = {
  enableHighAccuracy: true
};

function toggleautorefresh() {
  autoRefreshStation = !autoRefreshStation;
  document.getElementById("autorefresh").textContent = autoRefreshStation
    ? "disable auto refresh"
    : "enable auto refresh";
}

function savekey() {
  let keyToSave = document.getElementById("apikey").value;
  if (keyToSave != null && keyToSave != undefined && keyToSave != "") {
    localStorage.setItem("apikey", keyToSave);
    console.log("key saved");
  } else {
    console.log("key not saved");
  }
}

function loadkey() {
  let keyToLoad = localStorage.getItem("apikey");
  if (keyToLoad != null && keyToLoad != undefined && keyToLoad != "") {
    document.getElementById("apikey").value = keyToLoad;
    console.log("key loaded");
  } else {
    console.log("key not loaded");
  }
}

function start() {
  navigator.geolocation.watchPosition(success, error, options);
}

function stop() {
  navigator.geolocation.clearWatch(id);
}

function success(pos) {
  console.log('geolocation updated')
  latitude = pos.coords.latitude;
  longitude = pos.coords.longitude;
  document.getElementById(
    "location"
  ).textContent = `${pos.coords.latitude}, ${pos.coords.longitude}`;
  if (autoRefreshStation) {
    throttledrefresh()
  }
  document.getElementById("error").textContent = "";
}

function error(err) {
  console.error(err);
  document.getElementById("error").textContent = err.message;
}

const throttledrefresh = throttle(() => {
  refresh()
})

function refresh() {
  if (
    latitude == null ||
    latitude == undefined ||
    longitude == null ||
    longitude == undefined
  ) {
    return;
  }
  fetch(
    `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations/nearest?lat=${latitude}&lng=${longitude}&limit=1`,
    {
      method: "GET",
      // Request headers
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": document.getElementById("apikey").value,
      },
    }
  )
    .then((response) => response.json())
    .then((json) => {
      const station = json.payload[0];
      const message = generateMessage(station);
      document.getElementById("station-name").innerHTML = message;
      document.getElementById("error").textContent = "";
      console.log('station refreshed')
      document.getElementById("provincie-name").innerHTML = getProvincie();
      console.log('provincie refreshed')
    })
    .catch((err) => {
      error(err);
    });
}

function generateMessage(station) {
  if (station.distance < station.radius) {
    return `Je bevindt je op station ${station.namen.middel}<br>
station afstand: ${station.distance}<br>
station radius: ${station.radius}<br>
naderen radius: ${station.naderenRadius}`;
  }
  if (station.distance < station.naderenRadius) {
    return `Je nadert station ${station.namen.middel}<br>
station afstand: ${station.distance}<br>
station radius: ${station.radius}<br>
naderen radius: ${station.naderenRadius}`;
  }
  return `Het dichtstbijzijnde station is ${station.namen.middel}<br>
station afstand: ${station.distance}<br>
station radius: ${station.radius}<br>
naderen radius: ${station.naderenRadius}`;
}


function throttle(cb, delay = 1000) {
  let shouldWait = false
  let waitingArgs
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      cb(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    cb(...args)
    shouldWait = true

    setTimeout(timeoutFunc, delay)
  }
}


function getProvincie() {
  provincie = ""
  data.features.forEach((provincie) => {
    if (d3.geoContains(provincie, [longitude, latitude]) == true) {
        provincie = provincie.properties.PROVINCIENAAM;
    }
  return provincie
})
}