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
}

function addMarker(coordinates) {
  let marker = new google.maps.Marker({
    position: coordinates,
    map: map,
    icon: 'img/your-location-24.png',
  })
}

window.initMap = initMap;