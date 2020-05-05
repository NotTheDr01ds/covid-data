const d3Dsv = require('d3-dsv');
const d3Array = require('d3-array');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

let data = d3Dsv.csvParse(fs.readFileSync("./us-counties.csv","utf-8"));
let stateData = Object.fromEntries(d3Array.group(data, d => d.fips.slice(0,2)));
Object.keys(stateData).forEach(stateId => {
  let csv = d3Dsv.csvFormat(stateData[stateId]);
  fs.writeFileSync(`${stateId}.csv`,csv,{flag: 'w',encoding: 'utf-8'});
})