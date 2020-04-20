// Pretty much a one-time script to pull down the geography files for each county
const fs = require('fs');
const axios = require('axios')

let state_info = JSON.parse(fs.readFileSync('state_geometry.json'));
state_info.features.forEach(feature => {
  if (feature.properties.REGION < 9) {
    let stateNumber = feature.properties.STATE;
    axios.get(`https://tigerweb.geo.census.gov/arcgis/rest/services/Generalized_ACS2018/State_County/MapServer/11/query?where=STATE%3D${stateNumber}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentsOnly=false&f=geojson`)
    .then((res) => {
      console.log(stateNumber)
      //console.log(res);
      console.log(res.statusText);

      if (res.statusText == 'OK') {
        let data = res.data;
        //console.log(JSON.stringify(data))
        fs.writeFile(`state_geos/${stateNumber}.json`,JSON.stringify(data),(
          (err) => {
            if (err) return console.log(err);
          }
        ));

      }
    })
  }
})