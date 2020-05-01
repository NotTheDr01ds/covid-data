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
    format: (value) => { return value.toLocaleString() },
    calc: (id, statData) => {
      return statData.caseDataLookup[id][statData.endDate].cases;
    }

  },
  totalDeaths: {
    description: "Total Deaths",
    format: (value) => { return value.toLocaleString() },
    calc: (id, statData) => {
      return statData.caseDataLookup[id][statData.endDate].deaths;
    }
  },
  totalCasesPerCapita: {
    description: "Total Cases per 100,000 Residents",
    calc: (id, statData) => {
      let population = statData.censusData[id].population;
      let cases = statData.caseDataLookup[id][statData.endDate].cases;
      return (cases / population) * 100000;
    },
    format: (value) => { return `${value.toFixed(2)}`}
  },
  totalDeathsPerCapita: {
    description: "Total Deaths per 100,000 Residents",
    calc: (id, statData) => {
      let population = statData.censusData[id].population;
      let deaths = statData.caseDataLookup[id][statData.endDate].deaths;
      return (deaths / population) * 100000;
    },
    format: (value) => { return `${value.toFixed(2)}`}
  },
  dailyCases: {
    description: "New Cases (Day)",
    calc: (id, statData) => {
      let dayCases = statData.caseDataLookup[id][statData.endDate].cases;
      let previousDay = statData.endDate.clone().subtract(1, "day");
      let previousDayCases = statData.caseDataLookup[id][previousDay].cases;
      return (dayCases - previousDayCases);
    },
    format: (value) => { return value.toLocaleString() }
  },
  dailyDeaths: {
    description: "New Deaths (Day)",
    calc: (id, statData) => {
      let dayDeaths = statData.caseDataLookup[id][statData.endDate].deaths;
      let previousDay = statData.endDate.clone().subtract(1, "day");
      let previousDayDeaths = statData.caseDataLookup[id][previousDay].deaths;
      return (dayDeaths - previousDayDeaths);
    },
    format: (value) => { return value.toLocaleString() }
  },
  dailyCasesPerCapita: {
    description: "New Cases per 1M Residents (1 Day)",
    calc: (id, statData) => {
      let dayCases = statData.caseDataLookup[id][statData.endDate].cases;
      let previousDay = statData.endDate.clone().subtract(1, "day");
      let previousDayCases = statData.caseDataLookup[id][previousDay].cases;
      let population = statData.censusData[id].population;
      let newCases = dayCases - previousDayCases;
      return (newCases / population) * 1000000;
    },
    format: (value) => { return `${value.toFixed(2).toLocaleString()}`}

  },
  dailyDeathsPerCapita: {
    description: "Deaths per 1M Residents (1 Day)",
    calc: (id, statData) => {
      let dayDeaths = statData.caseDataLookup[id][statData.endDate].deaths;
      let previousDay = statData.endDate.clone().subtract(1, "day");
      let previousDayDeaths = statData.caseDataLookup[id][previousDay].deaths;
      let population = statData.censusData[id].population;
      let newDeaths = dayDeaths - previousDayDeaths;
      return (newDeaths / population) * 1000000;
    },
    format: (value) => { return `${value.toFixed(2).toLocaleString()}`}
  },
  weeklyCases: {
    description: "New Cases (7 day)",
    calc: (id, statData) => {
      let dayCases = statData.caseDataLookup[id][statData.endDate].cases;
      let sevenDaysPrior = statData.endDate.clone().subtract(1, "week");
      let previousWeekCases = statData.caseDataLookup[id][sevenDaysPrior].cases;
      let newCases = dayCases - previousWeekCases;
      return newCases
    },
    format: (value) => { return `${value.toLocaleString()}`}

  },
  weeklyCasesPerCapita: {
    description: "New Cases per 1M Residents (7 day)",
    calc: (id, statData) => {
      let dayCases = statData.caseDataLookup[id][statData.endDate].cases;
      let sevenDaysPrior = statData.endDate.clone().subtract(1, "day");
      let previousWeekCases = statData.caseDataLookup[id][sevenDaysPrior].cases;
      let population = statData.censusData[id].population;
      let newCases = dayCases - previousWeekCases;
      return (newCases / population) * 1000000;
    },
    format: (value) => { return `${value.toFixed(2).toLocaleString()}`}

  }
}

function getColorScale(min,avg,max) {
  return scaleLinear()
    .domain([min, avg, max])
    .range(['#FFF', '#800', '#F00'])
}

export function getStat(requestData) {
  // The caller should check to make sure all values are non-null
  // before calling, but since these are reactive variables, it's
  // easily possible to pass in null values before they are ready.
  // So ... double-check.
  Object.keys(requestData).forEach(dataSet => {
    console.log("Not Ready Yet")
    if (!requestData[dataSet]) { return null }
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

  let rankTable = Object.entries(statDetail)
    .sort((x,y) => { return d3array.descending(x[1],y[1])})
    // Create a lookup object where the key is the id and the
    // value is the index (its sorted position)
    .reduce((rankTable, entry, index) => {
      rankTable[entry[0]] = index + 1;
      return rankTable;
    }, {});

  let avg = d3array.mean(Object.values(statDetail));
  let max = d3array.max(Object.values(statDetail));
  let colorScale = getColorScale(0,avg,max);

  let statDetails = {
    table: statDetail,
    rankTable,
    endDate,
    avg,
    max,
    colorScale
  }

  return statDetails;
}