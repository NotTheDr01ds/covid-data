<script>
	export let caseData;
	let lastSort = "cases";
	let sortAscending = false;

	function sortBy(col) {
		let data = caseData;
		if (col == lastSort) {
			sortAscending = !sortAscending;
		} else {
			sortAscending = false;
		}
		lastSort = col;
		if (typeof(data[0][col]) == "number") {
			if (sortAscending) {
				data = data.sort((cty1,cty2) => {return cty1[col] - cty2[col]})
			} else {
				data = data.sort((cty1,cty2) => {return cty2[col] - cty1[col]})
			}
		} else if (typeof(data[0][col]) == "string") {
			if (sortAscending) {
				data = data.sort((cty1,cty2) => {return ('' + cty2[col]).localeCompare(cty1[col])});
			} else {
				data = data.sort((cty1,cty2) => {return ('' + cty1[col]).localeCompare(cty2[col])});
			}
		}
		return data;
	}

	function sortClick(col,event) {
		caseData = sortBy(col);
	}

</script>

<table class="data">
	<tr>
	<th class="colCounty colText" on:click={(event) => sortClick('county')}>County</th>
	<th class="colCases colNumber" on:click={(event) => sortClick('cases')}>Cases</th>
	<th class="colArea colNumber" on:click={(event) => sortClick('area')}>Area in Square Miles</th>
	<th class="colPerArea colNumber" on:click={(event) => sortClick('casesPerSqMi')}>Cases per Square Mile</th>
	<th class="colPop colNumber" on:click={(event) => sortClick('population')}>Population</th>
	<th class="colPerPop colNumber" on:click={(event) => sortClick('casesPer100k')}>Cases per 100,000 Residents</th>
	<th class="colOdds colNumber" on:click={(event) => sortClick('casesPer100k')}>1 case per ??? Residents</th>
	</tr>
	{#each caseData as { county, cases, population, area, casesPerSqMi, casesPer100k, casesRank, casesPerSqMiRank, casesPer100kRank }}
		<tr>
			<td class="colCounty colText">{county}</td>
			<td class="colCases colNumber {casesRank}">{cases}</td>
			<td class="colArea colNumber">{area.toFixed(2).toLocaleString()}</td>
			<td class="colPerArea colNumber {casesPerSqMiRank}">{casesPerSqMi.toFixed(2)}</td>
			<td class="colPop colNumber">{population.toLocaleString()}</td>
			<td class="colPerPop colNumber {casesPer100kRank}">{casesPer100k.toFixed(2)}</td>
			<td class="colOdds colNumber {casesPer100kRank}">1 in {Math.round(population/cases).toLocaleString()}</td>

		</tr>
	{/each}
</table>


<style>
	table.data {
		border-collapse: collapse;
		grid-column-start: 2;
		grid-row-start: 3;
	}

	table.data td {
		border: 1px solid black;
	}

	td, th {
		padding: 0 1em;
	}

	th {
		background-color: black;
		color: white;
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

	.colCases, .colArea, .colPop, .colPerPop, .colOdds, .colPerArea {
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
		.colPop, .colArea, .colPerPop {
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