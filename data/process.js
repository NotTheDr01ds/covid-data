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

function generateRankingSegments(min, max, avg) {
	// Creates an array to rank a sample into 6 segments.
	// The first 3 segments are evenly divided from the minimum value to the mean.
	// The upper three segments are evenly divided from the mean to the maximum value.
	let meanToMaxSegmentSize = (max - avg) / 3;
	let minToMeanSegmentSize = (avg - min) / 3;
	let ranking = [];
	ranking.push(max - meanToMaxSegmentSize);
	ranking.push(max - (meanToMaxSegmentSize * 2));
	ranking.push(avg);
	ranking.push(min + (minToMeanSegmentSize * 2));
	ranking.push(min + minToMeanSegmentSize);
	
	return ranking;
}

function getRanking(segmentTable,value) {
	if (value > segmentTable[0]) {
		return 1;
	} else if (value > segmentTable[1]) {
		return 2;
	} else if (value > segmentTable[2]) {
		return 3;
	} else if (value > segmentTable[3]) {
		return 4;
	} else if (value > segmentTable[4]) {
		return 5;
	} else {
		return 6;
	}
}

async function getData() {
	let [ cases, countyLandAreas, countyPopulations ] = await Promise.all([getCases(), getLandAreas(), getPopulations()]);
	let data = {cases, countyLandAreas, countyPopulations};
	let tableData = [];
	let totalCases = 0;
	let totalPerSqMi = 0;
	let totalPerPop = 0;
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

		totalCases += cases;
		totalPerSqMi += casesPerSqMi;
		totalPerPop += casesPer100k;

		(cases > maxCases) && (maxCases = cases);
		(casesPerSqMi > maxPerSqMi) && (maxPerSqMi = casesPerSqMi);
		(casesPer100k > maxPerPop) && (maxPerPop = casesPer100k);

		tableData.push(
			{ county, cases, population, area, casesPerSqMi, casesPer100k }
		)
	})

	let avgCases = totalCases / tableData.length;
	let casesRanking = generateRankingSegments(0,maxCases,avgCases);
	let avgCasesPerSqMi = totalPerSqMi / tableData.length;
	let densityRanking = generateRankingSegments(0,maxPerSqMi,avgCasesPerSqMi);
	let avgCasesPerPop = totalPerPop / tableData.length;
	let perPopRanking = generateRankingSegments(0,maxPerPop,avgCasesPerPop);

	tableData = tableData.sort((a,b) => {return b.cases-a.cases});
	tableData.forEach((cty) => {
		cty.casesRank = `rank${getRanking(casesRanking,cty.cases)}`;
		cty.casesPer100kRank = `rank${getRanking(perPopRanking,cty.casesPer100k)}`
		cty.casesPerSqMiRank = `rank${getRanking(densityRanking,cty.casesPerSqMi)}`
	})
	
	return tableData;
}

getData().then((data) => {
	console.log(JSON.stringify(data))
});