<script>
  export let width = 960;
  export let height = 540;
  import { geoPath, geoIdentity, geoAlbersUsa } from 'd3-geo';
  import { scaleSequential, scaleLinear } from 'd3-scale';
  import { interpolateRainbow, interpolateRdBu, interpolateReds,interpolateBlues } from 'd3-scale-chromatic';
  import * as d3array from 'd3-array';
  import * as d3fetch from 'd3-fetch';
  import { autoType } from 'd3-dsv';
  import { feature } from 'topojson';
  import moment from 'moment';

  import { mapData, censusData, caseData, mapName, statKey } from '../mapDataStore.js';

  import { getStat } from '../stats.js';

  let md = null;
  let statDetails = null;

  $: md = $mapData;
  $: statDetails = ($caseData && $mapData && $censusData && $mapName && $statKey) ? 
    getStat({
      caseData: $caseData,
      mapData: $mapData,
      censusData: $censusData,
      mapName: $mapName,
      statKey: $statKey
    })
    : null
  

  let statHoverText = "";
  let statHoverId = null;

  function hover(geoId, geoName, statKey, value) {
    statHoverId = geoId;
    statHoverText = `${geoName}: ${value}`;
  }

  function hoverOut(geoId) {
    if (statHoverId == geoId) {
      statHoverId = null;
      statHoverText = "";
    }
  }

  function getColorScale(min,avg,max) {
    return scaleLinear()
      .domain([min, avg, max])
      .range(['#FFF', '#800', '#F00'])
  }

  function getStats(caseData, mapData, endDate, startDate) {
    let stats = new Object(null);
    let mostRecentDateAvailable = d3array.greatest(
      caseData,
      d => d.date
    ).date
    let earliestDateAvailable = d3array.least(
      caseData,
      d => d.date
    ).date

    // Not sure if I'm going to use startDate in this function yet, but here for now
    startDate = startDate ? startDate : earliestDateAvailable;
    endDate = endDate ? endDate : mostRecentDateAvailable;

    //let dayData = caseData.filter(dayEntry => {
      //return +dayEntry.date == +endDate;
    //});

    Object.keys(mapData).forEach(id => {
      if (!stats.hasOwnProperty(id)) {
        stats[id] = {};
      }
      let totalCases = mapData[id].dailyCasesHistory[endDate];
      let totalDeaths = mapData[id].dailyDeathsHistory[endDate];
      let previousDay = endDate.clone().subtract(1,'day')
      let previousDayCases = mapData[id].dailyCasesHistory[previousDay];
      let previousDayDeaths = mapData[id].dailyDeathsHistory[previousDay];

      //let newDailyCases = totalCases - 
      stats[id]["totalCases"] = totalCases;
      stats[id]["totalDeaths"] = totalDeaths;
      stats[id]["totalCasesPerCapita"] = totalCases / mapData[id].population;
      stats[id]["totalDeathsPerCapita"] = totalCases / mapData[id].population;

      let dailyCases = totalCases - previousDayCases;
      let dailyDeaths = totalDeaths - previousDayDeaths;
      stats[id]["dailyCases"] = dailyCases;
      stats[id]["dailyDeaths"] = dailyDeaths;
      stats[id]["dailyCasesPerCapita"] = dailyCases / mapData[id].population;
      stats[id]["dailyDeathsPerCapita"] = dailyDeaths / mapData[id].population;
      //stats[id]["newDailyCases"] = totalCases - 

    })

    return stats;
  }

	async function getData(geo) {
    try {
      let [topoData, caseData, populationData] = await Promise.all(
        [
          d3fetch.json("/data/maps/all_us_states_topo_simplified.json"),
          d3fetch.csv("/data/us-states.csv", (el) => {
            return {
              fips: el.fips,
              date: moment(el.date),
              cases: parseInt(el.cases),
              deaths: parseInt(el.deaths)
            }
          }),
          d3fetch.json("/data/state_population.json",autoType)
        ]
      )
      //let res = await fetch("/data/maps/all_us_counties_topo_simplified.json");
      // Convert topoJSON to geoJSON
      let geoData = feature(topoData, topoData.objects.state_geometry)

      let mostRecentDateAvailable = d3array.greatest(
        caseData,
        d => d.date
      ).date

      let caseCountsToday = caseData.filter((dayEntry) => {
        return +dayEntry.date == +mostRecentDateAvailable
      })

      //const projection = geoIdentity().reflectY(true).fitSize([640,480],geoData);
      const mapProjection = geoAlbersUsa();
      let mapPathGenerator = geoPath().projection(mapProjection);

      let mapData = new Object(null);
      geoData.features.forEach(geo => {
        let fips = geo.properties.STATE;
        mapData[fips] = {
          name: geo.properties.BASENAME,
          abbr: null,
          region: geo.properties.REGION,
          population: null,
          landArea: null,

          geoJson: geo,
          dailyCasesHistory: {},
          dailyDeathsHistory: {},
          totalCases: {
            value: null,
            color: null
          },
          totalDeaths: {
            value: null,
            color: null
          },
          perCapitaCases: {
            value: null,
            color: null
          },
          perCapitaDeaths: {
            value: null,
            color: null
          },
          perSquareMileCases: {
            value: null,
            color: null
          },
          perSquareMileDeaths: {
            value: null,
            color: null
          }
        }

      })

      populationData
        .slice(1)
        .forEach((element => {
          let fips = element[2];
          mapData[fips].population = parseInt(element[1]);
        }))

      caseData
        .forEach((el) => {
          let fips = el.fips;
          mapData[fips].dailyCasesHistory[el.date] = el.cases;
          mapData[fips].dailyDeathsHistory[el.date] = el.deaths;
          if (+el.date == +mostRecentDateAvailable) {
            mapData[fips].totalCases.value = el.cases;
            mapData[fips].totalDeaths.value = el.deaths;
            mapData[fips].perCapitaCases.value = el.cases / mapData[fips].population;
            mapData[fips].perCapitaDeaths.value = el.deaths / mapData[fips].population;
            //mapData[fips].perSquareMileCases.value = null;
            //mapData[fips].perSquareMileDeaths.value = null;
          }
        })

      Object.keys(mapData).forEach(fips => {
        // Remove US Territories
        if (mapData[fips].region > 4) {
          delete mapData[fips];
        }
        // Remove New York
        if (fips == "36") {
          //delete mapData[fips];
        }
      })

      let statDetails = getStats(caseData,mapData);

      let statsMeta = {
        totalCases: {
          description: "Total Cases",
          format: (value) => {
            return value.toLocalString();
          }
        },
        totalCases: {
          description: "Total Cases"
        },
        totalDeaths: {
          description: "Total Deaths"
        },
        totalCasesPerCapita: {
          description: "Cases per 100,000 residents"
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
      Object.keys(statsMeta).forEach((statKey) => {
        let avg = d3array.mean(Object.values(statDetails), d => d[statKey]);
        let max = d3array.max(Object.values(statDetails), d => d[statKey]);
        let colorScale = getColorScale(0,avg,max);
        statsMeta[statKey].avg = avg;
        statsMeta[statKey].max = max;
        statsMeta[statKey].colorScale = colorScale;
      });

      return {
        mapPathGenerator,
        mapData,
        statDetails,
        statsMeta,
        //statKey: "dailyCasesPerCapita" // Key of the stat to map
        statKey: "totalCases" // Key of the stat to map
      } 
    } catch (err) {
      console.log(err);
    }
  }

let dataPromise = getData();

</script>

<div class="MapComponent">
{#await dataPromise}
  <h2>Loading</h2>
{:then {mapPathGenerator, mapData, statDetails, statsMeta, statKey}}
{#if md}
  <figure class="map">
    <svg width="{width}" height="{height}">
      {#each Object.keys(md) as geoId}
        <path 
          class="geoFeature" d="{mapPathGenerator(md[geoId].geoJSON)}"
          fill="{statsMeta[statKey].colorScale(statDetails[geoId][statKey])}" 
          on:mouseover={(event) => hover(geoId,mapData[geoId].name,statKey,statDetails[geoId][statKey])}
          on:mouseout={(event) => hoverOut(geoId)}
        />
      {/each}
    </svg>
    <figcaption>{statsMeta[statKey].description}<br />
    {statHoverText}</figcaption>
  </figure>
{/if}
{:catch error}
  <p style="color: red">{error.message}</p>

{/await}
</div>

<style>
  .geoFeature {
    stroke: #888;
    stroke-width: 0.25px;
    stroke-linejoin: round;
  }
  figure.map {
    display: grid;
    grid-template-areas:
      "map map map"
      ". caption .";
    grid-template-rows: "100px 1fr 100px";
    align-items: center;
  }

  figure>svg {
    grid-area: map;
  }
  figcaption {
    grid-area: caption;
    align-self: center;
    text-align: center;
    
  }
</style>