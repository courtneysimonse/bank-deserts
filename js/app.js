mapboxgl.accessToken = 'pk.eyJ1IjoiY291cnRuZXlzaW1vbnNlIiwiYSI6ImNqZGozNng0NjFqZWIyd28xdDJ2MXduNTcifQ.PoSFtqfsq1di1IDXzlN4PA';
  const map = new mapboxgl.Map({
  container: 'mapid', // container ID
  // style: null,
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  projection: 'albers',
  // maxTileCacheSize: null,
  center: [-97, 39], // starting position
  minZoom: 6,
  zoom: 6 // starting zoom
});

const spinner = document.getElementById('spin');
spinner.classList = 'invisible';

map.on('load', () => {
  //
  // map.addSource('states', {
  //   'type': 'geojson',
  //   'data': 'data/states.geojson'
  // });
  //
  // map.addLayer({
  //   'id': 'states',
  //   'type': 'line',
  //   'source': 'states',
  //   'paint': {
  //     'line-color': '#838383',
  //     'line-width': 2
  //   }
  // });

  map.addSource("ct2010", {
    type: "vector",
    tiles: ["https://gis.data.census.gov/arcgis/rest/services/Hosted/VT_2010_140_00_PY_D1/VectorTileServer/tile/{z}/{y}/{x}.pbf"],
    minzoom: 6,
    promoteId: "GEOID" // promote field to be used as a foreign key
  })

  // map.addLayer({
  //   id: "ct-fill",
  //   type: "fill",
  //   source: "ct2010",
  //   "source-layer": "CensusTract",
  //   paint: {
  //     "fill-opacity": 0.8,
  //     "fill-color": "grey"
  //   }
  // });

  Papa.parse("data/cdfi2015.csv", {
  	download: true,
    header: true,
    complete: function(results) {
      // console.log(results.data);
      results.data.forEach((row) => {
        map.setFeatureState(
          {
            source: "ct2010",
            sourceLayer: "CensusTract",
            id: row.ct2010,
          },
          {
            cdfi2015: row.ia2015,
          }
        );
      });
    }
  });


  // Add a data source containing GeoJSON data.
  // map.addSource('ct2010', {
  //   'type': 'geojson',
  //   'data': 'data/ct_2010_filtered80.geojson' //"id":"cl1qvff4216tk20rs0af1x858"
  // });

  // Add a new layer to visualize the polygon.
  map.addLayer({
    'id': 'cdfi',
    'type': 'fill',
    'source': 'ct2010', // reference the data source
    "source-layer": "CensusTract",
    'layout': { },
    'paint': {
      'fill-color': 'rgb(13,40,75)',
      'fill-opacity': [
        "case",
        ["==", ["feature-state", "cdfi2015"], "YES"],
        0.5,
        0
      ]
    }
  });

  Papa.parse("data/nmtc2015.csv", {
  	download: true,
    header: true,
    complete: function(results) {
      // console.log(results.data);
      results.data.forEach((row) => {
        map.setFeatureState(
          {
            source: "ct2010",
            sourceLayer: "CensusTract",
            id: row.GEOID2010,
          },
          {
            nmtc2015: row["NMTC"],
          }
        );
      });
    }
  });

  map.addLayer({
    'id': 'nmtc',
    'type': 'fill',
    'source': 'ct2010',
    "source-layer": "CensusTract",
    'layout': {},
    'paint': {
      'fill-color': 'rgb(0,155,177)',
      'fill-opacity': [
        "case",
        ["==", ["feature-state", "nmtc2015"], "Yes"],
        0.5,
        0
      ]
    }
  });

  Papa.parse("data/deserts2020.csv", {
  	download: true,
    header: true,
    complete: function(results) {
      // console.log(results.data);
      results.data.forEach((row) => {
        map.setFeatureState(
          {
            source: "ct2010",
            sourceLayer: "CensusTract",
            id: row.geoid,
          },
          {
            deserts2020: "Yes",
          }
        );
      });
    }
  });
  map.addLayer({
    'id': 'deserts',
    'type': 'fill',
    'source': 'ct2010',
    "source-layer": "CensusTract",
    'layout': {},
    'paint': {
      'fill-color': 'rgb(128,154,28)',
      'fill-opacity': [
        "case",
        ["==", ["feature-state", "deserts2020"], "Yes"],
        0.5,
        0
      ]
    }
  });


  map.addSource('cd2020', {
    'type': 'geojson',
    'data': 'data/congressional_districts2020.geojson'
  });

  map.addLayer({
    'id': 'cd2020white',
    'type': 'line',
    'source': 'cd2020',
    'paint': {
      'line-color': '#fff',
      'line-width': 2.5
    }
  });

  map.addLayer({
    'id': 'cd2020gray',
    'type': 'line',
    'source': 'cd2020',
    'paint': {
      'line-color': '#838383',
      'line-width': 1.5
    }
  });

  map.addControl(new legendControl());

  const checkCDFI = document.getElementById('check-CDFI');
  checkCDFI.addEventListener('change', function(event) {

  	if (checkCDFI.checked == false) {
      map.setLayoutProperty('cdfi','visibility','none');
  	} else {
  		map.setLayoutProperty('cdfi','visibility','visible');
  	}
  });

  const checkNMTC = document.getElementById('check-NMTC');
  checkNMTC.addEventListener('change', function(event) {

  	if (checkNMTC.checked == false) {
  		map.setLayoutProperty('nmtc','visibility','none');
  	} else {
  		map.setLayoutProperty('nmtc','visibility','visible');
  	}
  });

  const checkDeserts = document.getElementById('check-BankDeserts');
  checkDeserts.addEventListener('change', function(event) {

  	if (checkDeserts.checked == false) {
  		map.setLayoutProperty('deserts','visibility','none');
  	} else {
  		map.setLayoutProperty('deserts','visibility','visible');
  	}
  });
});

map.on('render', () => {
  spinner.classList = '';
});

map.on('idle', () => {
  spinner.classList = 'invisible';
});

var categories = {
  'CDFI': 'rgb(13,40,75)',
  'NMTC': 'rgb(0,155,177)',
  'Bank Deserts': 'rgb(128,154,28)'
};

class legendControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl legend';
    let content = '<h4>Legend</h4>';
    content += '<div>';
    for (var item in categories) {
      if (categories.hasOwnProperty(item)) {
        content += '<label><div>';
        content += '<input type="checkbox" class="control-layers-selector" id="check-' + item.replace(/\s/g,'') + '" checked="">';
        content += '<span><span class="legendColor" style="background:' + categories[item] + '"></span>' + item + '</span>';
        content += '</div></label>';
      }
    }
    content += '</div>';

    this._container.innerHTML = content;
    return this._container;
  }
  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
