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

  $: mapPathGenerator = mapName ? mapLookup[mapName].mapPathGenerator : null;

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

</script>

<div class="MapComponent">
{#if mapData && statDetails}
  <figure class="map">
    <svg width="{width}" height="{height}">
      {#each Object.keys(mapData) as geoId}
        <path 
          class="geoFeature" d="{mapPathGenerator(mapData[geoId].geoJSON)}"
          fill="{statDetails.colorScale(statDetails.table[geoId])}" 
          on:mouseover={(event) => hover(geoId,mapData[geoId].name,statKey,statDetails[geoId])}
          on:mouseout={(event) => hoverOut(geoId)}
        />
      {/each}
    </svg>
    <figcaption>{statLookup[statKey].description}<br />
    {statHoverText}</figcaption>
  </figure>
{/if}
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