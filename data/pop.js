const fs = require('fs');

let data = JSON.parse(fs.readFileSync('/dev/stdin'));

let columnNames = data[0];
let output = data.slice(1,).map(element => {
  let result = {};
  for (let i = 0; i < columnNames.length; i++) {
    result[columnNames[i]] = element[i]; 
  }
  return result;
  
});

console.log(JSON.stringify(output))