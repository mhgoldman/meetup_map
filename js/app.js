var markersArray = [];
var map = null;

function initMap() {
  map = new google.maps.Map($('.map').get()[0], {
    zoom: 12,
    center: {lat: 40.730610, lng: -73.935242}
  });
  var geocoder = new google.maps.Geocoder();

  $('.main-form').submit(function(e) {
    startSpinning();
    clearMarkers();
    e.preventDefault();
    geocodeAddress(geocoder);
    $('.address').blur();
  });
}

function geocodeAddress(geocoder) {
  var address = $('.address').val();
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      loc = results[0].geometry.location;
      map.setCenter(loc);
      addMarker(loc, "http://maps.google.com/mapfiles/ms/icons/green-dot.png", address, google.maps.Marker.MAX_ZINDEX + 1)
      findMeetups(loc);
    } else {
      alert('Location not found: ' + status);
      stopSpinning();
    }
  });
}

function findMeetups(loc) {
  lat = loc.lat();
  lng = loc.lng();

  $.getJSON('https://api.meetup.com/2/groups?&key=165f2e85d23027f478a535b3436&photo-host=public&lon=' + lng + '&lat=' + lat + '&callback=?', function(data) {
    numResults = data.results.length;

    for (i=0; i<numResults; i++) {
      res = data.results[i];
      addMarker({lat: res.lat, lng: res.lon}, null, res.name);
    }

    updateBounds();
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

  markersArray = [];
}

function addMarker(pos, icon, title, zindex) {
  var marker = new google.maps.Marker({
    map: map,
    position: pos,
    icon: icon,
    title: title,
    zIndex: zindex
  });

  markersArray.push(marker);
}

function updateBounds() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markersArray.length; i++) {
   bounds.extend(markersArray[i].getPosition());
  }

  map.fitBounds(bounds);
}

function resizeMap() {
  $('.map').height($(window).height() - $('header').height());
}

$(function() {
  resizeMap();
});

$(window).resize(resizeMap);