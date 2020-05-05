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

  import { mapData as mapDataStore, 
           censusData as censusDataStore,
           caseData as caseDataStore,
           mapName as mapNameStore,
           statKey as statKeyStore,
           mapLookup } from '../mapDataStore.js';

  import { getStat, statLookup } from '../stats.js';

  $: mapData = $mapDataStore;
  $: censusData = $censusDataStore;
  $: caseData = $caseDataStore;
  $: mapName = $mapNameStore;
  $: statKey = $statKeyStore;

  let mapPathGenerator;
  //$: mapPathGenerator = mapName ? mapLookup[mapName].mapPathGenerator(mapData) : null;
  $: {
    if (mapName && mapData) {
      mapPathGenerator = (mapLookup[mapName].mapPathGenerator)(mapData);
    }
  }

  $: statDetails = (caseData && mapData && censusData && mapName && statKey) ? 
    getStat({
      caseData: caseData,
      mapData: mapData,
      censusData: censusData,
      mapName: mapName,
      statKey: statKey
    })
    : null
  

  let statHoverText = "";
  let statHoverId = null;
  let rankHoverText = "";

  function hover(geoId) {
    statHoverId = geoId;
    let geoName = mapData[geoId].name; 
    let value = statDetails.table[geoId];
    let format = statLookup[statKey].format;
    let formattedValue = format ? format(value) : value;
    statHoverText = `${geoName}: ${formattedValue}`;
    let rank = statDetails.rankTable[geoId];
    let outOf = Object.keys(statDetails.rankTable).length;
    rankHoverText = `Rank: ${rank} of ${outOf}`;
  }

  function hoverOut(geoId) {
    if (statHoverId == geoId) {
      statHoverId = null;
      statHoverText = "";
      rankHoverText = "";
    }
  }

</script>

<div class="MapComponent">
{#if mapData && statDetails}
  <figure class="map">
    <svg height="75vh" viewbox="0 0 {width} {height}">
      {#each Object.keys(mapData) as geoId}
        <path 
          class="geoFeature" d="{mapPathGenerator(mapData[geoId].geoJSON)}"
          fill="{statDetails.colorScale(statDetails.table[geoId])}" 
          on:mouseover={(event) => hover(geoId,mapData[geoId].name,statKey)}
          on:mouseout={(event) => hoverOut(geoId)}
        />
      {/each}
    </svg>
    <figcaption>{statLookup[statKey].description}<br />
      As of {moment(statDetails.endDate).format('dddd, MMMM Do, YYYY')}<br />
      {statHoverText}<br />
      {rankHoverText}
  </figcaption>
  </figure>
{/if}
</div>

<style>
  .geoFeature {
    stroke: #111;
    stroke-width: 0.15px;
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