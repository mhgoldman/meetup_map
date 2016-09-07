var markersArray = [];
var map = null;

function initMap() {
  map = new google.maps.Map($('.map').get()[0], {
    zoom: 8,
    center: {lat: 40.7127837, lng: -74.00594130000002}
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
      var loc = results[0].geometry.location;

      map.setCenter(loc);
      addMarker(loc, "http://maps.google.com/mapfiles/ms/icons/green-dot.png", address, google.maps.Marker.MAX_ZINDEX + 1, null)
      findMeetups(loc);
    } else {
      alert('Could not find the specified location');
      stopSpinning();
    }
  });
}

function findMeetups(loc) {
  var topicSearchStr = $('.topic-search-str').val().trim();
  var topicURLKey = null;

  if (topicSearchStr != '') {
    var encodedTopicSearchStr = encodeURIComponent(topicSearchStr);

    $.getJSON('https://api.meetup.com/find/topics?key=165f2e85d23027f478a535b3436&photo-host=public&query=' + encodedTopicSearchStr + '&callback=?', function(data) {
      if (data.data.length > 0) {
        topicURLKey = data.data[0].urlkey;
        executeFindMeetups(loc, topicURLKey);
      }
      else {
        alert("Could not find a topic matching " + topicSearchStr);
        stopSpinning();
      }

    });
  } else {
    executeFindMeetups(loc, '');    
  }
}

function executeFindMeetups(loc, topic) {
  var lat = loc.lat();
  var lng = loc.lng();
  
  $.getJSON('https://api.meetup.com/2/groups?key=165f2e85d23027f478a535b3436&photo-host=public&topic=' + topic + '&lon=' + lng + '&lat=' + lat + '&callback=?', 
    function(data) {
      var numResults = data.results.length;

      for (i=0; i<numResults; i++) {
        var res = data.results[i];
        console.log(res);

        var infoWindowHTML = "<h3><a target='_blank' href='" + res.link + "'>" + res.name + "</a></h3><p>" + res.description + "</p>";

        addMarker({lat: res.lat, lng: res.lon}, null, res.name, null, infoWindowHTML);
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

function addMarker(pos, icon, title, zindex, infoWindowHTML) {
  var marker = new google.maps.Marker({
    map: map,
    position: pos,
    icon: icon,
    title: title,
    zIndex: zindex
  });

  if (infoWindowHTML != null) {
    marker.infoWindow = new google.maps.InfoWindow({ content: infoWindowHTML });

    marker.addListener('click', function() {
      closeAllInfoWindows();
      marker.infoWindow.open(map, marker);
    });
  }

  markersArray.push(marker);
}

function updateBounds() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markersArray.length; i++) {
   bounds.extend(markersArray[i].getPosition());
  }

  map.fitBounds(bounds);
}

function closeAllInfoWindows() {
  for (i=0; i<markersArray.length; i++) {
    if (markersArray[i].infoWindow != null) {
      markersArray[i].infoWindow.close();
    }
  }
}

function resizeMap() {
  $('.map').height($(window).height() - $('header').height());
}

$(function() {
  resizeMap();
});

$(window).resize(resizeMap);