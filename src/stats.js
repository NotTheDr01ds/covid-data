//import { mapName as mapNameStore, mapData as mapDataStore, censusData as censusDataStore, caseData as caseDataStore, mapLookup } from './mapDataStore.js';
import { mapLookup } from './mapDataStore.js';

import moment from 'moment';
import * as d3array from 'd3-array';
import * as d3fetch from 'd3-fetch';
import { scaleSequential, scaleLinear } from 'd3-scale';
import { interpolateRainbow, interpolateRdBu, interpolateReds,interpolateBlues } from 'd3-scale-chromatic';

//let mapName;
//const mapNameUnsubscribe = mapNameStore.subscribe(value => {
  //mapName = value;
//})

export const statLookup = {
  totalCases: {
    description: "Total Cases",
    format: (value) => { return value.toLocalString() },
    calc: (id, statData) => {
      return statData.caseDataLookup[id][statData.endDate].cases;
    }

  },
  totalDeaths: {
    description: "Total Deaths",
    format: (value) => { return value.toLocalString() },
    calc: (id, statData) => {
      return statData.caseDataLookup[id][statData.endDate].cases;
    }
  },
  totalCasesPerCapita: {
    description: "Cases per 100,000 residents",
    calc: (id, statData) => {
      let population = statData.censusData[id].population;
      let cases = statData.caseDataLookup[id][statData.endDate].cases;
      return cases / population;
    }
  },
  totalDeathsPerCapita: {
    description: "Deaths per 100,000 residents"
  },
  dailyCases: {
    description: "New Cases (Day)"
  },
  dailyDeaths: {
    description: "New Deaths (Day)"
  },
  dailyCasesPerCapita: {
    description: "Per Capita New Cases (Day)"
  },
  dailyDeathsPerCapita: {
    description: "Per Capita New Deaths (Day)"
  }
}
function getEntriesForDate(casesOrDeaths, caseData, mapData, date) {
  // First, get the list of cases in the caseData for the specified date
  let entriesForDate = Object.fromEntries(
    caseData
      .filter(d => { return +d.date == +date })
      .map(d => [d.id, d[casesOrDeaths]])
  )
  // Then fill in 0's for any geos not present in the caseData
  Object.keys(mapData).forEach((geoId) => {
    entriesForDate[geoId] = entriesForDate[geoId] || 0
  })

  return entriesForDate;
}

function getColorScale(min,avg,max) {
  return scaleLinear()
    .domain([min, avg, max])
    .range(['#FFF', '#800', '#F00'])
}

export function getStat(requestData) {
  console.log("getTotalCases");
  // The caller should check to make sure all values are non-null
  // before calling, but since these are reactive variables, it's
  // easily possible to pass in null values before they are ready.
  // So ... double-check.
  Object.keys(requestData).forEach(dataSet => {
    console.log("Not Ready Yet")
    if (!requestData[dataSet]) { return {} }
  })

  let { caseData, mapData, censusData, mapName } = requestData;
  
  // if endDate isn't in the requestData, use date of the most 
  // recent data available in the caseData
  let endDate;
  if (requestData.hasOwnProperty("endDate")) {
    endDate = requestData.endDate;
  } else {
    endDate = d3array.greatest( 
      caseData, 
      d => d.date
    ).date;
  }

  let statKey = requestData.hasOwnProperty("statKey") ? requestData.statKey : "totalCases";

/*   let startdate;
  if (requestdata.hasownproperty("startdate")) {
    startdate = requestdata.startdate;
  } else {
    startdate = d3array.least( 
      casedata, 
      d => d.date
    ).date;
  } */

  let caseDataLookup = caseData.reduce((caseCollector, { id, date, cases, deaths}) => {
    caseCollector[id] = caseCollector[id] || {};
    caseCollector[id][date] = { cases, deaths }
    return caseCollector;
  }, {})
  console.log(caseDataLookup)
  let statData = {
    caseDataLookup,
    mapData,
    censusData,
    endDate
  }

  let statDetail = Object.fromEntries(
    Object.keys(mapData)
      .map(id => {
        return [id, statLookup[statKey].calc(id,statData)]
       })
  )

  

  console.log(statDetail);
  return statDetail;
}