<script>
  import GeorgiaTable from './GeorgiaTable.svelte';
</script>
<svelte:head>
  <title>Georgia COVID-19</title>
</svelte:head>
<main>
  <h1>Georgia County-by-County COVID-19 Statistics</h1>
  <div class="detail">
    <p>As of March 26th, 2020 7:00 pm EDT</p>
    <p>More details below the main table.</p>
  </div>
  <GeorgiaTable />
  <div class="detail">
    <p>Sources</p>
    <ul>
      <li>Georgia Department of Public Health Daily COVID-19 Update</li>
      <li>US Census 2018 American Community Survey 5-Year Data</li>
      <li>Compiled by Doug Crozier</li>
    </ul>
    <p>I'll attempt to get new data upload soon after it is available from the Georgia Department of Public Health.  Current updates are noon and 7pm daily.</p>
    <p>Also hoping to add some new features such as comparisons to the previous day.</p>
  </div>
</main>

<style>
  div.detail {
    max-width: 460px;
    border: 1px solid black;
    padding: 1em;
  }

  main {
    display: grid;
    justify-items: center;
  }

	@media only screen and (max-device-width: 480px) {
    div.detail {
      max-width: 90%;
    }
  }
</style>
