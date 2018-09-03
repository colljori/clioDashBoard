var map, watchId, userPin;
var geoData;
var trackLayer;
var isTrackingActive = false;


/////////////////////////////// MAP CREATION ///////////////////////////////////
function GetMap()
{
  map = new Microsoft.Maps.Map('#myMap', {
    center: new Microsoft.Maps.Location(45.181344, 5.725737),
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    zoom: 10,
    showMapTypeSelector: false,
    showDashboard: false,
    showLocateMeButton: false
  });
  trackLayer = new Microsoft.Maps.Layer('#myTrackLayer');
  map.layers.insert(trackLayer);
}


///////////////////////////// BUTTON TOGGLE FUNCTION  //////////////////////////
function StartTracking() {
  //Add a pushpin to show the user's location.
  userPin = new Microsoft.Maps.Pushpin(map.getCenter(), {
    visible: true,
    color: "#4CAF50" });
  map.entities.push(userPin);
}

function StopTracking() {
  //Remove the user pushpin.
  map.entities.remove(userPin);
}


function ToggleTracking() {
  if (!isTrackingActive) {
    //Add a pushpin to show the user's location.
    StartTracking();
    isTrackingActive = true;
  }else {
    StopTracking();
    isTrackingActive = false;
  }
}


///////////////////////////// DATA ON THE MAP FUNCITON /////////////////////////
function GetGeoData() {
  //Load the GeoJson Module.
  Microsoft.Maps.loadModule('Microsoft.Maps.GeoJson', function () {
    //Parse the GeoJson object into a Bing Maps shape.
    geoData = Microsoft.Maps.GeoJson.read(clioGeoData);
  });
}


function PrintGeoData(start,stop) {
  GetGeoData();
  var dataLen = geoData.length;
  var startIndex  = Math.trunc(start * dataLen);
  var stopIndex   = stop  * dataLen;

  trackLayer.clear();

  for (var i = startIndex + 1 ; i < stopIndex; i++) {
    var coords = [geoData[i-1].getLocation(),geoData[i].getLocation()];
    var meanFuelCons = (geoData[i-1].metadata.consumption + geoData[i].metadata.consumption) /2;
    var color = getColorForPercentage(meanFuelCons/100,percentColorsForConsumtion);
    var line = new Microsoft.Maps.Polyline(coords, {
      strokeColor: color,
      strokeThickness: 3,
    });
  trackLayer.add(line);
  }
}


////////////////////////// JQUERY FONCTION /////////////////////////////////////
//JQuery to toggle a button
$("#swap").on("click", function() {
  var el = $(this);
  el.text() == el.data("text-swap")
    ? el.text(el.data("text-original"))
    : el.text(el.data("text-swap"));
});


$( function() {
  $( "#intervalRangeSelector" ).slider({
    range: true,
    min: 0,
    max: 100,
    values: [ 0, 0 ],
    start: function( event, ui ) {
      $( "#intervalRangeSelector" ).fadeTo(50, 1, function() {
        // Animation complete.
      });
    },
    stop: function( event, ui ) {
      $( "#intervalRangeSelector" ).fadeTo(2000, 0.4, function() {
        // Animation complete.
      });
    },
    slide: function( event, ui ) {
      var start = $( "#intervalRangeSelector" ).slider( "values", 0 );
      var stop  = $( "#intervalRangeSelector" ).slider( "values", 1 );
      PrintGeoData(start/100,stop/100);
    }
  });
});





//////////////// COLOR GRADIENT IN FONCITON OF PARAM ///////////////////////////
var percentColorsForConsumtion = [
      { pct: 0.0, color: { r: 0xFF, g: 0xFF, b: 0xFF } },
      { pct: 0.5, color: { r: 0x55, g: 0xFF, b: 0xEE } },
      { pct: 1.0, color: { r: 0x3B, g: 0x12, b: 0x61 } } ];

var getColorForPercentage = function(pct,percentColors) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
}


///////////////////////// SIDE BAR /////////////////////////////////////////////
function openNav() {
    document.getElementById("frontPageSidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("frontPageSidenav").style.width = "0";
}
