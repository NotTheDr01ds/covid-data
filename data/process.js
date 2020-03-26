const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

async function getCases() {
  let data = await readFile("./georgia_cases.json","utf8");

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
}

async function getPopulations() {
  let data = await readFile("./county_population.json","utf8");
  let countyPopulation = {};
  JSON.parse(data).filter((el) => {return el[2] == 13}).forEach((el) => {
    let countyName = el[0].replace(/ County, Georgia/, "");
    countyPopulation[countyName] = parseInt(el[1]);
  })

  return countyPopulation;
}

async function getLandAreas() {
  let data = await readFile("./county_land_area.json","utf8");
  let countyPopulation = {};
  data = JSON.parse(data);
  let countyLand = {};
  data.features.filter((el) => {return el.attributes.STATE == 13}).forEach((el) => { 
    countyLand[el.attributes.BASENAME] = el.attributes.AREALAND;
  });

  return countyLand;

}

	async function getData() {
		let [ cases, countyLandAreas, countyPopulations ] = await Promise.all([getCases(), getLandAreas(), getPopulations()]);
		let data = {cases, countyLandAreas, countyPopulations};
		let tableData = [];
		let totalCases = 0;
		let maxCases = 0;
		let maxPerSqMi = 0;
		let maxPerPop = 0;
		// I think I can simplify this to run over the case data (smaller/quicker)
		// Was previously building object data based on the full count
		Object.keys(data.countyPopulations)
			.filter(county => {return data.cases[county]})
			.forEach((county) => {
				cases = data.cases[county] ? data.cases[county] : 0;
				let population = data.countyPopulations[county];
				let area = data.countyLandAreas[county] / (5280**2);
				let casesPerSqMi = (cases/area);
				let casesPer100k = (cases / (population / 100000));
				(cases > maxCases) && (maxCases = cases);
				(casesPerSqMi > maxPerSqMi) && (maxPerSqMi = casesPerSqMi);
				(casesPer100k > maxPerPop) && (maxPerPop = casesPer100k);
				tableData.push(
					{ county, cases, population, area, casesPerSqMi, casesPer100k }
				)
			})
		tableData = tableData.sort((a,b) => {return b.cases-a.cases});
		return tableData;
	}

getData().then((data) => {console.log(JSON.stringify(data))});