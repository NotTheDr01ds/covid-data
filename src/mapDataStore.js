import { writable, derived } from 'svelte/store';

import * as d3fetch from 'd3-fetch';
import { autoType } from 'd3-dsv';
import moment from 'moment';
import { feature } from 'topojson';
import { geoPath, geoIdentity, geoAlbersUsa } from 'd3-geo';

export const mapLookup = {
  "us-states": {
    mapFilePath: "/data/maps/all_us_states_topo_simplified.json",
    censusFilePath: "/data/state_population.json",
    caseDataFilePath: "/data/us-states.csv",
    geoDataAccessor: (topoData) => { return topoData.objects.state_geometry },
    idAccessor: (geo) => { return geo.properties.STATE },
    regionAccessor: (geo) => { return geo.properties.REGION },
    keysToRemoveAccessor: (mapData) => { return Object.keys(mapData).filter(geoId => {
      return mapData[geoId].region > 4;
    })},
    mapPathGenerator: geoPath().projection(geoAlbersUsa())
  },
  "us-counties": {

  },
  "state-counties": {

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

async function getMapData(mapName) {
  let topoData = await d3fetch.json(mapLookup[mapName].mapFilePath);
  //let geoData = await feature(topoData, maps[mapName].geoDataAccessor(topoData));
  let geoData = await feature(topoData, accessor(mapName,"geoData")(topoData));
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
  let censusDataArray = await d3fetch.json(mapLookup[mapName].censusFilePath,autoType);
  let population = {};
  censusDataArray.slice(1).forEach(el => {
    population[el[2]] = el[1];
  })
  let censusData = new Object(null);
  Object.keys(mapData).forEach(geoId => {
    censusData[geoId] = {
      population: population[geoId]
    }
  })
  return censusData;
}

async function getCaseData(mapName, mapData) {
  let caseData = (await d3fetch.csv(mapLookup[mapName].caseDataFilePath, (el) => {
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
export const statKey = writable("dailyCasesPerCapita");

export const mapData = derived(mapName, async ($mapName, set) => {
  set(await getMapData($mapName));
}, null);

export const censusData = derived([mapName, mapData], async ([$mapName, $mapData], set) => {
  if ($mapData) {
    set(await getCensusData($mapName, $mapData))
  }
}, null);

export const caseData = derived([mapName, mapData], async ([$mapName, $mapData], set) => {
  if ($mapData) {
    set(await getCaseData($mapName, $mapData))
  }
}, null);