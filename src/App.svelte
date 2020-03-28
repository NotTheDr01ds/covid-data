<script>
  import GeorgiaTable from './components/GeorgiaTable.svelte';
  import Heading from './components/Heading.svelte';
  import MoreDetail from './components/MoreDetail.svelte';
  import Attributions from './components/Attributions.svelte';
</script>
<svelte:head>
  <title>Georgia COVID-19</title>
  <meta property="og:title" content="Georgia County-by-County COVID Statistics" />
  <meta property="og:image" content="http://covid-data.dougcrozier.com/preview.jpg" />
</svelte:head>
<main>
  <Heading />
  <MoreDetail />
  <GeorgiaTable />
  <Attributions />
</main>

<style>
  main {
    display: grid;
    justify-items: center;
  }

	@media only screen and (max-device-width: 480px) {
  }
  :global(div.detail) {
    background: #EEE;
    max-width: 460px;
    border: 1px solid black;
    padding: 0.25rem;
  }

  :global(div.detail p) {
    margin-bottom: 0.5rem;
    line-height: 1.1rem;
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
