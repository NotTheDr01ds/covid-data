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

  function getColorScale(min,avg,max) {
    return scaleLinear()
      .domain([min, avg, max])
      .range(['#FFF', '#800', '#F00'])
  }

	async function getData(geo) {
    try {
      let [topoData, caseData, populationData] = await Promise.all(
        [
          d3fetch.json("/data/maps/all_us_states_topo_simplified.json"),
          d3fetch.csv("/data/us-states.csv", (el) => {
            return {
              fips: el.fips,
              date: new Date(el.date),
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
          dailyCases: {},
          dailyDeaths: {},
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
          mapData[fips].dailyCases[el.date] = el.cases;
          mapData[fips].dailyDeaths[el.date] = el.deaths;
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

      const stats = [
        ["totalCases","Total Cases"],
        ["totalDeaths","Total Deaths"],
        ["perCapitaCases","Cases per 100,000 residents"],
        ["perCapitaDeaths","Deaths per 100,000 residents"]
      ].reduce((stats, stat) => {
        console.log(stat);
        stats[stat[0]] = {
          description: stat[1]
        };
        return stats;
      }, {})
      console.log(stats);
      let statsLookup = new Object(null);
      Object.keys(stats).forEach(stat => {
        let avg = d3array.mean(Object.values(mapData), d => d[stat].value);
        let max = d3array.max(Object.values(mapData), d => d[stat].value);
        let colorScale = getColorScale(0,avg,max);
        statsLookup[stat] = {
          avg,
          max,
          colorScale
        }
      })

      Object.keys(mapData)
        .forEach((fips) => {
          Object.keys(stats).forEach(stat => {
            mapData[fips][stat].color = statsLookup[stat].colorScale(mapData[fips][stat].value);
          })
        })

      return {
        mapPathGenerator,
        mapData
      } 
    } catch (err) {
      console.log(err);
    }
  }

let dataPromise = getData();

</script>


{#await dataPromise}
<div>Loading</div>
{:then data}
<svg class="MapComponent" width="{width}" height="{height}">
  {#each Object.keys(data.mapData) as fips}
    <path class="county" d="{data.mapPathGenerator(data.mapData[fips].geoJson)}" fill="{data.mapData[fips].perCapitaDeaths.color}" />
  {/each}

</svg>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<style>
  .county {
    stroke: #ddd;
    stroke-width: 1px;
    stroke-linejoin: round;
  }
</style>