// US map options
var options = {
  zoomSnap: .5,
  zoomDelta: .2,
  center: [39, -97],
  zoom: 5,
  minZoom: 2,
  zoomControl: false,
  // attributionControl: false
}

const spinner = document.getElementById('spin');
spinner.classList = '';

// create map
var map = L.map('mapid', options);

// request tiles and add to map
// var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// 	maxZoom: 19,
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);

// change zoom control position
L.control.zoom({
  position: 'bottomleft'
}).addTo(map);

let overlayControl = {};

let basemapControl = {
  "Streets": CartoDB_Positron
};

var layerControl = L.control.layers(
  basemapControl,
  overlayControl,
  {
    // hideSingleBase: true,
    collapsed: false
  }).addTo(map);

// GET DATA
processData();

// PROCESS DATA FUNCTION
function processData() {

  drawMap();

  // example breaks for legend
  var breaks = [1, 4, 7, 10];
  var colorize = chroma.scale(chroma.brewer.BuGn).classes(breaks).mode('lab');

  drawLegend(breaks, colorize);

}   //end processData()

// DRAW MAP FUNCTION
function drawMap() {

  // var statesLayer = L.geoJson(states, {
  //   style: function (feature) {
  //     return {
  //       color: 'black',
  //       weight: 2,
  //       fill: false
  //     }
  //   }
  // }).addTo(map);
  var cdLayer = L.geoJson(cd2020, {
    style: function (feature) {
      return {
        color: '#838383',
        weight: 1.5,
        fill: false
      }
    }
  }).addTo(map);

  cdfi = L.layerGroup().addTo(map);
  layerControl.addOverlay(cdfi,'CDFI');
  nmtc = L.layerGroup().addTo(map);
  layerControl.addOverlay(nmtc,'NMTC');
  deserts = L.layerGroup().addTo(map);
  layerControl.addOverlay(deserts,'Bank Deserts');

  const url = 'https://gis.data.census.gov/arcgis/rest/services/Hosted/VT_2010_140_00_PY_D1/VectorTileServer/tile/{z}/{y}/{x}.pbf';
  const tiles = L.vectorGrid.protobuf(url, {
    vectorTileLayerStyles: {
      CensusTract: {
        color: 'red',
        weight: 1,
        fill: true
      }
    },
    minZoom: 3,
    minNativeZoom: 6,
    // interactive: true,
    getFeatureId: function(f) {
      return f.properties['GEOID'];
    }
  }).addTo(map);

  Papa.parse("data/cdfi2015.csv", {
    download: true,
    header: true,
    complete: function(results) {
      spinner.classList = '';
      // console.log(results.data);
      results.data.forEach((row) => {
        tiles.setFeatureStyle(row.ct2010, {
          stroke: false,
          fillColor: 'rgb(13,40,75)',
          opacity: 0.5
        });
      });
      console.log(tiles);
    }
  });
  //
  // var censusTractsLayer = L.geoJson(null, {
  //     style: function(feature) {
  //       return {
  //         stroke: false,
  //         fillColor: 'rgb(106,90,205)'
  //       }
  //     },
  //     onEachFeature: function (feature, layer) {
  //       if (feature.properties['nmtc2015']) {
  //         nmtc.addLayer(layer);
  //       }
  //       if (feature.properties['cdfi2015']) {
  //         cdfi.addLayer(layer);
  //       }
  //     }
  // });
  // // omnivore
  // var runLayer = omnivore.topojson('data/census_tracts2010_topo.json', null, censusTractsLayer).addTo(map);
  //
  // var cdfiFeatures = L.featureGroup(cdfi);
  // cdfiFeatures.setStyle({
  //   stroke: false,
  //   fillColor: 'rgb(13,40,75)',
  //   opacity: 0.5
  // });
  //
  // var nmtcFeatures = L.featureGroup(cdfi);
  // cdfiFeatures.setStyle({
  //   stroke: false,
  //   fillColor: 'rgb(0,155,177)',
  //   opacity: 0.5
  // });

  // desert: rgb(128,154,28)

}   //end drawMap()

function drawLegend(breaks, colorize) {

  var legendControl = L.control({
    position: 'topright'
  });

  legendControl.onAdd = function(map) {

    var legend = L.DomUtil.create('div', 'legend');
    return legend;

  };

  legendControl.addTo(map);

  var legend = document.querySelector('.legend');
  var legendHTML = "<h3><span>YYYY</span> Legend</h3><ul>";

  for (var i = 0; i < breaks.length - 1; i++) {

    var color = colorize(breaks[i], breaks);

    var classRange = '<li><span style="background:' + color + '"></span> ' +
        breaks[i].toLocaleString() + ' &mdash; ' +
        breaks[i + 1].toLocaleString() + '</li>'
    legendHTML += classRange;

  }

  legendHTML += '</ul><p>(Data from SOURCE)</p>';
  legend.innerHTML = legendHTML;

} // end drawLegend()
