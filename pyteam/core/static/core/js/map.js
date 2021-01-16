//GET ACTUAL POSITION
var x = document.getElementById('bloque');
var map, lat, lng, infoWindow;

// Centrar mapa de ser posible al inicio
document.addEventListener('DOMContentLoaded', () => {
  if (navigator.geolocation) {
    try {
      centrarMapa();
    } catch (error) {
      console.error(error);
    }
  }
});

// Coordenadas genericas de Santiago si el usuario no quiere dar geolocalizacion
lat = -33.44950792242694;
lng = -70.66775128317754;
showPosition(undefined, lat, lng);
farmaciasCercanas(lat, lng);

//creacion e inicio del mapa
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: 'roadmap',
  });
  console.log('Latitud= ' + lat + ', Longitud= ' + lng);

  infoWindow = new google.maps.InfoWindow();
  const locationButton = document.createElement('button');
  locationButton.textContent = 'Centrar en tu ubicación';
  locationButton.classList.add('custom-map-control-button');
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener('click', () => {
    centrarMapa();
  });
}

// hace el fetch del listado de farmacias cercanas del backend
function farmaciasCercanas(latitud, longitud) {
  fetch(`../farmacias/${latitud}/${longitud}`)
    .then((response) => response.json())
    .then((farmacias) => {
      farmacias.forEach((farmacia) => agregarMarker(farmacia));
    });
}

// agrega marker en el mapa con parámetro elemento farmacia.json
function agregarMarker(farmacia) {
  console.log(farmacia);

  const lat = farmacia['local_lat'];
  const lng = farmacia['local_lng'];
  const title = farmacia['local_nombre'];
  const contentString = `<div><h1 class="nombre">${farmacia['local_nombre']}</h1></div><div>    <p>Dirección: ${farmacia['local_direccion']}, ${farmacia['comuna_nombre']}</p></div><div>    <p>Fono: ${farmacia['local_telefono']}</p></div><div>    <p>Horario Turno: ${farmacia['funcionamiento_dia']} ${farmacia['fecha']} de ${farmacia['funcionamiento_hora_apertura']} a ${farmacia['funcionamiento_hora_cierre']}</p></div>`;

  const infowindow = new google.maps.InfoWindow({
    content: contentString,
  });
  const latLng = new google.maps.LatLng(lat, lng);
  const marker = new google.maps.Marker({
    position: latLng,
    map: map,
    title: title,
  });

  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
}

// Centra mapa si el usuario lo permite
function centrarMapa() {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(pos);
        showPosition(position);
        infoWindow.setPosition(pos);
        infoWindow.setContent('Tu ubicación');
        infoWindow.open(map);
        map.setCenter(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

// Manejo de error de acuerdo a la documentacion de Google
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? 'Error: El servicio de Geolocalización falló.'
      : 'Error: Tu navegador no soporta el servicio de Geolocalización.'
  );
  infoWindow.open(map);
}

// Indica posicion en el front
function showPosition(position = false, lat = false, long = false) {
  if (position) {
    x.innerHTML =
      "<h3 class='latitude'>Latitude: " +
      position.coords.latitude +
      "</h3><h3 class='longitude'>Longitude: " +
      position.coords.longitude +
      '</h3>';
  } else {
    x.innerHTML =
      "<h3 class='latitude'>Latitude: " +
      lat +
      "</h3><h3 class='longitude'>Longitude: " +
      long +
      '</h3>';
  }
}
