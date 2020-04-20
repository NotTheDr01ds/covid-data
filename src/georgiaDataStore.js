import { writable } from 'svelte/store';

async function getData() {
  let res = await fetch("/data/georgia_counties_covid_data.json");
  if (res.ok) {
    let txt = await res.text();
    let data = JSON.parse(txt);
    return data;
  }
}

export const georgiaDataStore = writable(null);

getData().then((data) => {
  georgiaDataStore.set(data);
})