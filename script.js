let id;
let latitude;
let longitude;

options = {
  enableHighAccuracy: false,
  timeout: 100,
  maximumAge: 0,
};

function savekey() {
  let keyToSave = document.getElementById('apikey').value
  if (keyToSave != null && keyToSave != undefined && keyToSave != '') {
    localStorage.setItem('apikey', keyToSave)
    console.log('key saved')
  } else {
    console.log('key not saved')
  }
}

function loadkey() {
  let keyToLoad = localStorage.getItem('apikey')
  if (keyToLoad != null && keyToLoad != undefined && keyToLoad != '') {
    document.getElementById('apikey').value = keyToLoad
    console.log('key loaded')
  } else {
    console.log('key not loaded')
  }
}

function start() {
  navigator.geolocation.watchPosition(success, error, options);
}

function stop() {
  navigator.geolocation.clearWatch(id);
}

function success(pos) {
  latitude = pos.coords.latitude;
  longitude = pos.coords.longitude;
  document.getElementById(
    "location"
  ).textContent = `${pos.coords.latitude}, ${pos.coords.longitude}`;
  document.getElementById("error").textContent = "";
}

function error(err) {
  console.error(err)
  document.getElementById("error").textContent = err.message;
}

function refresh() {
  if (latitude == null || latitude == undefined || longitude == null || longitude == undefined) {
    return
  }
  fetch(
    `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations/nearest?lat=${latitude}&lng=${longitude}&limit=1`,
    {
      method: "GET",
      // Request headers
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": document.getElementById('apikey').value,
      },
    }
  )
    .then((response) => response.json())
    .then(json => {
      const station = json.payload[0]
      console.log(station)
      const naam = station.namen.middel
      const afstand = station.distance
      document.getElementById(
        "station-name"
      ).textContent = `station ${naam} op ${afstand} meter afstand`;
      document.getElementById("error").textContent = "";
    })
    .catch((err) => {
      error(err)
    });
}
