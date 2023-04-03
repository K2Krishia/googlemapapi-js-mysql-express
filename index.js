let map;

function initMap() {
  // initialize map centered in PH
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 12.8797, lng: 121.7740 },
    zoom: 6,
    mapId: MAP_ID, // replace with your map ID
  });

  let locations = [];
  let flaggedLocations = [];

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
        locations.push({lat: lat, lng: lng});
        //addMarker({lat: lat, lng: lng});
        usersMarked += 1;
      });
      console.log(`Users marked on map: ${usersMarked}`);

      let locationBatches = groupBy25(locations);
      locationBatches.forEach(loc => processDistanceMatrix(loc));

      console.log(flaggedLocations);
    });

    function processDistanceMatrix(locations) {
      // ---Distance Matrix---
      const service = new google.maps.DistanceMatrixService(); // instantiate Distance Matrix service
      // tricky part
      locations.forEach(loc => {
        let otherLocations = locations.filter((x, index) => index !== locations.indexOf(loc));
        let matrixOptions = {
          origins: otherLocations, // all locations except the one being processed
          destinations: [loc], // the one being processed
          travelMode: 'DRIVING',
          unitSystem: google.maps.UnitSystem.METRIC // IMPERIAL if in miles
        };
        // Call Distance Matrix service
        service.getDistanceMatrix(matrixOptions, callback);

        // Callback function used to process Distance Matrix response
        function callback(response, status) {
          if (status !== "OK") {
            alert(status);
            return;
          }
          let nearestLocation = getNearestLocation(matrixOptions.origins, response);
          if (nearestLocation.distValue < 50) {
            flaggedLocations.push(nearestLocation.coor)
          }

          // Condition if within threshold
          let polyColor = nearestLocation.distValue < 50 ? 'red' : 'blue'; // 50 meters threshold
          let markerIcon = nearestLocation.distValue < 50 ? 'img/location-red-24.png' : 'img/location-blue-24.png';

          // display distance in map if within threshold
          let directionsService = new google.maps.DirectionsService();
          let directionsRenderer = new google.maps.DirectionsRenderer({ polylineOptions: { strokeColor: polyColor }, markerOptions: {icon: markerIcon} });
          directionsRenderer.setMap(map);

          // Create route from existing points used for markers
          const route = {
              origin: nearestLocation.coor,
              destination: loc,
              travelMode: 'DRIVING', // BICYCLING, TRANSIT, and WALKING
          }

          directionsService.route(route,
            function(response, status) { // anonymous function to capture directions
              if (status !== 'OK') {
                window.alert('Directions request failed due to ' + status);
                return;
              } else {
                directionsRenderer.setDirections(response); // Add route to the map
                // let directionsData = response.routes[0].legs[0]; // Get data about the mapped route
                // if (!directionsData) {
                //   window.alert('Directions request failed');
                //   return;
                // }
                // else {
                //   document.getElementById('msg').innerHTML += " Driving distance is " + directionsData.distance.text + " (" + directionsData.duration.text + ")." + "<br/>";
                // }
              }
            });
        }
      })
    }
}

function addMarker(coordinates) {
  let marker = new google.maps.Marker({
    position: coordinates,
    map: map,
    icon: 'img/your-location-24.png',
  })
}

function getNearestLocation(origins, response) {
  const distances = response.rows.map((row) => row.elements[0].distance.value);
  const distanceToDestinations = distances.map((distance) => distance / 1000);
  const nearestIndex = distanceToDestinations.indexOf(Math.min(...distanceToDestinations));

  return {coor: origins[nearestIndex], distValue: distances[nearestIndex]};
};

function groupBy25(arr) {
  const numGroups = Math.ceil(arr.length / 25);
  return Array.from({ length: numGroups }, (_, i) => arr.slice(i * 25, (i + 1) * 25));
}

window.initMap = initMap;