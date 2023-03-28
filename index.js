let map;

function initMap() {
  // initialize map centered in PH
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 12.8797, lng: 121.7740 },
    zoom: 6,
    mapId: '52c44134c7a98f62',
  });

  // get user locations from sql database that we integrated into express api
  fetch('http://localhost:3000/users')
    .then(response => response.json())
    .then(data => {
      // add markers to each user coordinates
      let usersMarked = 0;
      data.forEach(user => {
        let coor = user.GEO_LCTN.replace(' ', '').split(",")
        let lat = parseFloat(coor[0])
        let lng = parseFloat(coor[1])
        addMarker({lat: lat, lng: lng});
        usersMarked += 1;
      });
      console.log(`Users marked on map: ${usersMarked}`);
    });

  // two locations to get distance
  let sogod = {lat: 10.4329, lng: 124.9948};
  let libagon = {lat: 10.37, lng: 125.07}
  let loc1 = new google.maps.Marker({
    position: sogod,
    map: map,
    icon: 'img/your-location-24.png',
  })
  let loc2 = new google.maps.Marker({
    position: libagon,
    map: map,
    icon: 'img/your-location-24.png',
  })
  // Draw a line showing the straight distance between the markers
  let displacement = new google.maps.Polyline({path: [sogod, libagon], map: map});
  // Calculate and display the distance between markers
  let distance = displacementDistance(loc1, loc2);
  document.getElementById('msg').innerHTML = "Distance between markers: " + distance.toFixed(2) + " km,";

  // --- Route Distance ---
  let directionsService = new google.maps.DirectionsService();
  let directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map); // Existing map object displays directions
  // Create route from existing points used for markers
  const route = {
      origin: libagon,
      destination: sogod,
      travelMode: 'DRIVING' // BICYCLING, TRANSIT, and WALKING
  }

  directionsService.route(route,
    function(response, status) { // anonymous function to capture directions
      if (status !== 'OK') {
        window.alert('Directions request failed due to ' + status);
        return;
      } else {
        console.log(response);
        directionsRenderer.setDirections(response); // Add route to the map
        let directionsData = response.routes[0].legs[0]; // Get data about the mapped route
        if (!directionsData) {
          window.alert('Directions request failed');
          return;
        }
        else {
          document.getElementById('msg').innerHTML += " Driving distance is " + directionsData.distance.text + " (" + directionsData.duration.text + ").";
        }
      }
    });
}

function addMarker(coordinates) {
  let marker = new google.maps.Marker({
    position: coordinates,
    map: map,
    icon: 'img/your-location-24.png',
  })
}

function displacementDistance(loc1, loc2) {
  let R = 6371.0710; // Radius of the Earth in miles: 3958.8 ; in kilometers: 6371.0710
  let rlat1 = loc1.position.lat() * (Math.PI / 180); // Convert degrees to radians
  let rlat2 = loc2.position.lat() * (Math.PI / 180); // Convert degrees to radians
  let difflat = rlat2 - rlat1; // Radian difference (latitudes)
  let difflon = (loc2.position.lng() - loc1.position.lng()) * (Math.PI / 180); // Radian difference (longitudes)

  let distance = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
  return distance;
}

window.initMap = initMap;