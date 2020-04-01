<script>
  import GeorgiaTable from './GeorgiaTable.svelte';
  import MoreDetail from './MoreDetail.svelte';

	let promise = getData();

	async function getData() {
    let res = await fetch("/data/georgia_counties_covid_data.json");
    console.log(res);
		if (res.ok) {
      let txt = await res.text();
      let data = JSON.parse(txt);
			return data;
		}
  }


</script>

{#await promise}
	<h1 class="loading">Loading ...</h1>
{:then data}
  <GeorgiaTable caseData={data.caseData}/>
	<MoreDetail unknownCases={data.Unknown} dailyCases={data.dailyCases}/>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<style>
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		grid-column-start: 2;
	}
</style>