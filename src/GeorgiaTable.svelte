<script>
	let promise = getData();

	async function getData() {
		let res = await fetch("./data/georgia_counties_covid_data.json");
		if (res.ok) {
			let data = await res.text();
			return JSON.parse(data);
		}
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
		{#each data as { county, cases, population, area, casesPerSqMi, casesPer100k, casesRank, casesPerSqMiRank, casesPer100kRank }}
			<tr>
				<td class="colCounty colText">{county}</td>
				<td class="colCases colNumber {casesRank}">{cases}</td>
				<td class="colArea colNumber">{area.toFixed(2).toLocaleString()}</td>
				<td class="colPerArea colNumber {casesPerSqMiRank}">{casesPerSqMi.toFixed(2)}</td>
				<td class="colPop colNumber">{population.toLocaleString()}</td>
				<td class="colPerPop colNumber {casesPer100kRank}">{casesPer100k.toFixed(4)}</td>

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
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	table.data {
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

	table.data tr>th {
		vertical-align: bottom;
	}

	table.data tr:nth-child(even) {
		background: #DDD;
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

	.rank1 {
		background-color: #f8696b;
	}
	.rank2 {
		background-color: #ffa874;
	}
	.rank3 {
		background-color: #ffd17a;
	}
	.rank4 {
		background-color: #ffe67d;
	}
	.rank5 {
		background-color: #afd47b;
	}
	.rank6 {
		background-color: #72c379;
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

		table.data {
			width: 97%;
		}
		td {
			padding: 0 0.5em;
		}

		th {
			padding: 0 0.5em;
		}

	}

</style>