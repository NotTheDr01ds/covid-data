<script>
  import Heading from './components/Heading.svelte';
  import Attributions from './components/Attributions.svelte';
  import GeorgiaTable from './components/GeorgiaTable.svelte';
  import MoreDetail from './components/MoreDetail.svelte';
  import DonationRecommendation from './components/DonationRecommendation.svelte';
  import Map from "./components/Map.svelte";
  import { statLookup } from "./stats.js";
  import { statKey, mapName, submapId } from "./mapDataStore.js";

//  import {getData} from './data.js';
 // let dataPromise = getData();
  let query = new URLSearchParams(window.location.search);
  let mapQuery = query.get("map");
  let submapQuery = query.get("state");
  let georgiaTableQuery = query.get("georgia-covid-old");

  let statSelected = "weeklyCasesPerCapita";
  $: statKey.set(statSelected);
  
  if (mapQuery) {
    mapName.set(mapQuery)
  }

  if (submapQuery) {
    submapId.set(submapQuery);
  }

</script>

<svelte:head>
  <title>COVID-19 Data Mapping</title>
</svelte:head>

{#if !georgiaTableQuery}
<main class="map">
  <select name="" id="" bind:value={statSelected}>
    {#each Object.keys(statLookup) as stat}
      <option value={stat}>{statLookup[stat].description}</option>
    {/each}} 
  </select>
  <Map />
</main>
{:else}
<main class="georgia-table">
  <Heading />
  <GeorgiaTable />
  <MoreDetail />
  <Attributions />
  <DonationRecommendation />
</main>
{/if}

<style>
  main.map {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;

  }

  main.georgia-table {
    display: grid; 
    grid-template-columns: 1fr 350px max-content 1fr;
    grid-template-rows: auto max-content auto;
    justify-items: center;
  }


	h1.loading {
    grid-column-start: 3;
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		grid-column-start: 2;
	}

  :global(div.detail) {
    width: 100%;
    background: #FFF;
    border: 1px solid black;
    padding: 1rem;
    margin-right: 0.25rem;
    margin-left: 0.25rem;
    margin-bottom: 0.25em;
  }

  :global(div.detail p) {
    margin-bottom: 0.5rem;
    line-height: 1.2rem;
  }
  :global(div.detail p:last-child) {
    margin-bottom: 0;
  }
  @media only screen and (min-device-width: 481px) {
    :global(.HeadingComponent) {
      grid-column-start: 3;
      grid-row-start: 1;
    }
    :global(.GeorgiaTableComponent) {
      grid-column-start: 3;
      grid-row-start: 2;
      grid-row-end: 25;
    }
    :global(.MoreDetailComponent) {
      grid-column-start: 2;
      grid-row-start: 2;
      place-self: start end;
    }
    :global(.AttributionsComponent) {
      grid-column-start: 2;
      grid-row-start: 3;
      place-self: start end;
    }
    :global(.DonationRecommendationComponent) {
      grid-column-start: 2;
      grid-row-start: 4;
      place-self: start center;
    }

  }

  @media only screen and (max-device-width: 480px) {
    main {
      display: grid; 
      grid-template-columns: 1fr;
      justify-items: center;
    }

    :global(.HeadingComponent) {
      grid-column-start: 1;
      grid-row-start: 1;
    }
    :global(.GeorgiaTableComponent) {
      grid-column-start: 1;
      grid-row-start: 3;
    }
    :global(.MoreDetailComponent) {
      grid-column-start: 1;
      grid-row-start: 2;
      place-self: start end;
    }
    :global(.AttributionsComponent) {
      grid-column-start: 1;
      grid-row-start: 4;
      place-self: start end;
    }
    :global(.DonationRecommendationComponent) {
      grid-column-start: 1;
      grid-row-start: 5;
      place-self: start center;
    }
  }
</style>
