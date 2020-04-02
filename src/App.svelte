<script>
  import Heading from './components/Heading.svelte';
  import Attributions from './components/Attributions.svelte';
  import GeorgiaTable from './components/GeorgiaTable.svelte';
  import MoreDetail from './components/MoreDetail.svelte';

  import {getData} from './data.js';
  let dataPromise = getData();

</script>

<svelte:head>
  <title>Georgia COVID-19</title>
  <meta property="og:title" content="Georgia County-by-County COVID Statistics" />
  <meta property="og:image" content="http://covid-data.dougcrozier.com/preview.jpg" />
</svelte:head>

<main>
  <Heading />

  {#await dataPromise}
    <h1 class="loading">Loading ...</h1>
  {:then data}
    <GeorgiaTable caseData={data.caseData}/>
    <MoreDetail unknownCases={data.Unknown} dailyCases={data.dailyCases}/>
  {/await}

  <Attributions />
</main>

<style>
  main {
    display: grid; 
    grid-template-columns: 1fr 350px max-content 1fr;
    grid-template-rows: auto max-content auto;
    justify-items: center;
  }

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

  @media only screen and (max-device-width: 480px) {
    :global(div.detail) {
      max-width: 90%;
    }
  }
</style>
