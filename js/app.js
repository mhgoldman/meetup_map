var markersArray = [];

function initMap() {
  var map = new google.maps.Map($('.map').get()[0], {
    zoom: 12,
    center: {lat: 40.730610, lng: -73.935242}
  });
  var geocoder = new google.maps.Geocoder();

  $('.main_form').submit(function(e) {
    startSpinning();
    clearMarkers();
    e.preventDefault();
    geocodeAddress(geocoder, map);
  });
}

function geocodeAddress(geocoder, map) {
  var address = $('.address').val();
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      loc = results[0].geometry.location;
      map.setCenter(loc);
      addMarker(map, loc, "http://maps.google.com/mapfiles/ms/icons/green-dot.png", address)
      findMeetups(map, loc);
    } else {
      alert('Location not found: ' + status);
      stopSpinning();
    }
  });
}

function findMeetups(map, loc) {
  lat = loc.lat();
  lng = loc.lng();

  $.getJSON('https://api.meetup.com/2/groups?&key=165f2e85d23027f478a535b3436&photo-host=public&lon=' + lng + '&lat=' + lat + '&callback=?', function(data) {
    num_results = Math.min(data.results.length, 25);

    for (i=0; i<num_results; i++) {
      res = data.results[i];
      addMarker(map, {lat: res.lat, lng: res.lon}, null, res.name);
    }

    stopSpinning();
  });

}

function startSpinning() {
  $('.submit').hide();
  $('.spinner').css('display', 'inline');
}

function stopSpinning() {
  $('.spinner').hide();
  $('.submit').show();
}

function clearMarkers() {
  for (i=0; i<markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
}

function addMarker(map, pos, icon, title) {
  var marker = new google.maps.Marker({
    map: map,
    position: pos,
    icon: icon,
    title: title
  });

  markersArray.push(marker);
}