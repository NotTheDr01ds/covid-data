	async function getData() {
    let res = await fetch("/data/georgia_counties_covid_data.json");
		if (res.ok) {
      let txt = await res.text();
      let data = JSON.parse(txt);
			return data;
		}
  }

  module.exports = {
    getData
  }
