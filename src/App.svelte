<script>
  import Data from './components/Data.svelte';
  import Heading from './components/Heading.svelte';
  import Attributions from './components/Attributions.svelte';

</script>
<svelte:head>
  <title>Georgia COVID-19</title>
  <meta property="og:title" content="Georgia County-by-County COVID Statistics" />
  <meta property="og:image" content="http://covid-data.dougcrozier.com/preview.jpg" />
</svelte:head>
<main>
  <Heading />
  <Data />
  <Attributions />
</main>

<style>
  main {
    display: grid; 
    grid-template-columns: auto auto auto;
    justify-items: center;
  }

  :global(div.detail) {
    background: #EEE;
    max-width: 460px;
    border: 1px solid black;
    padding: 0.25rem;
    margin-right: 0.25rem;
    margin-left: 0.25rem;
    margin-bottom: 0.25em;
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
