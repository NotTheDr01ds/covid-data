import { writable, derived } from 'svelte/store';

import * as d3fetch from 'd3-fetch';
import { autoType } from 'd3-dsv';
import moment from 'moment';
import { feature } from 'topojson';
import { geoPath, geoIdentity, geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';

export const mapLookup = {
  "us-states": {
    mapFilePath: () => { return "/data/maps/all_us_states_topo_simplified.json" },
    censusFilePath: "/data/state_population.json",
    caseDataFilePath: () => { return "/data/us-states.csv" },
    geoDataAccessor: (topoData) => { return topoData.objects.state_geometry },
    idAccessor: (geo) => { return geo.properties.STATE },
    regionAccessor: (geo) => { return geo.properties.REGION },

    keysToRemoveAccessor: (mapData) => { return Object.keys(mapData).filter(geoId => {
      return mapData[geoId].region > 4;
    })},

    mapPathGenerator: () => { return geoPath().projection(geoAlbersUsa())},

    censusDataMapOverride: (element) => {
      let stateCode = element[2];
      let population = element[1];
      return [stateCode, population];
    },

    submapName: "state-counties"

  },
  // Not ready
  "us-counties": {
    mapFilePath: () => { return "/data/maps/all_us_counties_topo_simplified.json" },
    censusFilePath: "/data/county_population.json",
    caseDataFilePath: () => { return "/data/us-counties.csv" },
    geoDataAccessor: (topoData) => { return topoData.objects.all_us_counties_geo },
    idAccessor: (geo) => { return geo.properties.GEOID },
    mapPathGenerator: () => { return geoPath().projection(geoAlbersUsa())}

  },
  "state-counties": {
    mapFilePath: (stateId) => { return `/data/maps/${stateId}_topo_simplified.json`},
    censusFilePath: "/data/county_population.json",
    caseDataFilePath: (stateId) => { return `/data/${stateId}.csv` },
    geoDataAccessor: (topoData,stateId) => { return topoData.objects[stateId]},
    idAccessor: (geo) => { return geo.properties.GEOID },
    mapPathGenerator: (mapData) => { 
      return geoPath().projection(geoMercator()
      //return geoPath().projection(geoIdentity()
        //.reflectY(true)
        .fitSize([960,540], { 
        type: "FeatureCollection", 
        features: Object.keys(mapData).map(id => {
          return mapData[id].geoJSON
        })}
      )) 
    },
    //mapPathGenerator: geoPath().projection(geoAlbersUsa()),

    censusDataMapOverride: (element) => {
      let stateCode = element[2];
      let countyCode = element[3];
      let population = element[1];
      return [stateCode.concat(countyCode), population]
    }
  }
}

function accessor(mapName, propertyName) {
  // Replace with optional chaining operator when available ...
  // let accessorFunction = maps?.[mapName]?.[`${propertyName}Accessor`];

  if (mapLookup[mapName] && mapLookup[mapName][`${propertyName}Accessor`]) {
    return mapLookup[mapName][`${propertyName}Accessor`]
  } else {
    // If no accessor function is defined for this map or property, 
    // return a function which returns null
    return () => { return null }
  }
}

async function getMapData(mapName,submapId) {
  let topoData;
  try {
    topoData = await d3fetch.json(mapLookup[mapName].mapFilePath(submapId));
  } catch (err) {
    console.log(err);
  }
  //let geoData = await feature(topoData, maps[mapName].geoDataAccessor(topoData));
  let geoData = await feature(topoData, accessor(mapName,"geoData")(topoData,submapId));
  let md = new Object(null);
  geoData.features.forEach(geo => {
    let id = accessor(mapName,"id")(geo);
    md[id] = {
      geoJSON: geo,
      name: geo.properties.NAME,
      region: accessor(mapName,"region")(geo),
      abbr: null,
      landArea: geo.properties.AREALAND

    };
  })
  let keysToRemove = accessor(mapName,"keysToRemove")(md);
  if (keysToRemove) {
    keysToRemove.forEach((geoId) => delete md[geoId]);
  }
  return md;
}

async function getCensusData(mapName, mapData) {
  let censusDataParseOverride = mapLookup[mapName]["censusDataMapOverride"] || ((d) => {return d});
  let censusDataArray = (await d3fetch.json(mapLookup[mapName].censusFilePath))
    .slice(1)
    .map(censusDataParseOverride)
    .filter(el => { 
      return Object.keys(mapData).includes(el[0]);
    });
  let population = {};
  censusDataArray.forEach(el => {
    population[el[0]] = el[1];
  })
  let censusData = new Object(null);
  Object.keys(mapData).forEach(geoId => {
    censusData[geoId] = {
      population: population[geoId]
    }
  })
  return censusData;
}

async function getCaseData(mapName, mapData, submapId) {
  let caseData = (await d3fetch.csv(mapLookup[mapName].caseDataFilePath(submapId), (el) => {
    return {
      id: el.fips,
      date: moment(el.date),
      cases: parseInt(el.cases),
      deaths: parseInt(el.deaths)
    }
  })).filter(d => { return Object.keys(mapData).includes(d.id)})
  // ^^ Remove elements that aren't in mapData

  return caseData;
}

export const mapName = writable("us-states");
export const submapId = writable(null);
export const statKey = writable("dailyCasesPerCapita");

export const mapData = derived([mapName, submapId], async ([$mapName, $submapId], set) => {
  set(await getMapData($mapName,$submapId));
}, null);

export const censusData = derived([mapName, mapData], async ([$mapName, $mapData], set) => {
  if ($mapData) {
    set(await getCensusData($mapName, $mapData))
  }
}, null);

export const caseData = derived([mapName, mapData, submapId], async ([$mapName, $mapData, $submapId], set) => {
  if ($mapData) {
    set(await getCaseData($mapName, $mapData, $submapId))
  }
}, null);