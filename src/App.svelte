<script>
	let promise = getData();

	async function getCases() {
		let res = await fetch("./data/GeorgiaCases.json");
		if (res.ok) {
			let data = await res.text();
			let casesArray = JSON.parse(data);
			let cases = {};

			casesArray.forEach((county) => {
				cases[county.County] = parseInt(county.Cases);
			});

			// Fix typo in Dept of Health data
			if (!("DeKalb" in cases)) {
				cases["DeKalb"] = cases["Dekalb"];
			}

			return cases;

		} else {
			throw "Couldn't retrieve case counts."
		}
	}
	async function getPopulations() {
		let res = await fetch("./data/county_population.json");
		if (res.ok) {
			let data = await res.text();
			let countyPopulation = {};
			JSON.parse(data).filter((el) => {return el[2] == 13}).forEach((el) => {
				let countyName = el[0].replace(/ County, Georgia/, "");
 	 	  	countyPopulation[countyName] = parseInt(el[1]);
			})
			return countyPopulation;
		} else {
			throw "Couldn't retrieve county population data."
		}
	}

	async function getLandAreas() {
		let res = await fetch("./data/county_land_area.json");
		if (res.ok) {
			let data = await res.text();
			data = JSON.parse(data);
			let countyLand = {};
			data.features.filter((el) => {return el.attributes.STATE == 13}).forEach((el) => { 
   			countyLand[el.attributes.BASENAME] = el.attributes.AREALAND;
			});

			return countyLand;

		} else {
			throw "Couldn't retrieve county geography data."
		}
	}
	async function getData() {
		let [ cases, countyLandAreas, countyPopulations ] = await Promise.all([getCases(), getLandAreas(), getPopulations()]);
		let data = {cases, countyLandAreas, countyPopulations};
		console.log(data);
		let tableData = [];
		Object.keys(data.countyPopulations)
			.filter(county => {return data.cases[county]})
			.forEach((county) => {
				cases = data.cases[county] ? data.cases[county] : 0;
				tableData.push(
					{
						county: county,
						cases: cases,
						population: data.countyPopulations[county],
						area: data.countyLandAreas[county] / (5280*5280.0)
					}
				)
			})
		tableData = tableData.sort((a,b) => {return b.cases-a.cases});
		return tableData;
	}
</script>

<main>
{#await promise}
	<h1>Loading ...</h1>
{:then data}
  <table class="data">
	  <tr>
		<th class="colCounty colText">County</th>
		<th class="colCases colNumber">Cases</th>
		<th class="colArea colNumber">Area in Square Miles</th>
		<th class="colPerArea colNumber">Cases per Square Mile</th>
		<th class="colPop colNumber">Population</th>
		<th class="colPerPop colNumber">Cases per 100,000 Population</th>
		</tr>
		{#each data as {county,cases,population, area}}
			<tr>
				<td class="colCounty colText">{county}</td>
				<td class="colCases colNumber">{cases}</td>
				<td class="colArea colNumber">{area.toFixed(2).toLocaleString()}</td>
				<td class="colPerArea colNumber">{(cases/area).toFixed(2)}</td>
				<td class="colPop colNumber">{population.toLocaleString()}</td>
				<td class="colPerPop colNumber">{(cases / (population / 100000)).toFixed(4)}</td>

			</tr>
		{/each}
	</table>

{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	table.data {
		max-width: 70%;
		border-collapse: collapse;
	}

	table.data td {
		border: 1px solid black;
	}

	td {
		padding: 0 1em;
	}

	th {
		padding: 0 1em;
	}

	tr>th {
		color: blue;
		vertical-align: bottom;
	}

	.colNumber {
		text-align: right;
	}

	.colText {
		text-align: left;
	}

	.colCases {
		max-width: 7rem;
	}

	.colArea {
		max-width: 7rem;
	}

	.colPop {
		max-width: 7rem;
	}

	.colPerPop {
		max-width: 7rem;
	}

	.colPerArea {
		max-width: 7rem;
	}


	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	@media only screen and (max-device-width: 480px) {
		.colPop, .colArea {
			display: none;
		}
	}

</style>