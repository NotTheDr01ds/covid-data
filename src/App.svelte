<script>
  import Heading from './components/Heading.svelte';
  import Attributions from './components/Attributions.svelte';
  import GeorgiaTable from './components/GeorgiaTable.svelte';
  import MoreDetail from './components/MoreDetail.svelte';
  import DonationRecommendation from './components/DonationRecommendation.svelte';
  import Map from "./components/Map.svelte";

//  import {getData} from './data.js';
 // let dataPromise = getData();
  let query = new URLSearchParams(window.location.search);
  let mapQuery = query.get("map");
  console.log(`mapQuery: ${mapQuery}`);


</script>

<svelte:head>
  <title>Georgia COVID-19</title>
  <meta property="og:title" content="Georgia County-by-County COVID Statistics" />
  <meta property="og:image" content="http://covid-data.dougcrozier.com/preview.jpg" />
</svelte:head>

<main>
{#if mapQuery}
  <Map />
{:else}
  <Heading />
  <GeorgiaTable />
  <MoreDetail />
  <Attributions />
  <DonationRecommendation />
{/if}
</main>

<style>
  main {
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
