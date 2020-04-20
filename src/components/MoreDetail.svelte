<script>

import { georgiaDataStore } from '../georgiaDataStore.js';
let dailyCases = null;
let unknownCases = null;
let today, yesterday, newCases, percentIncrease;
const unsubscribe = georgiaDataStore.subscribe(data => {
  if (data) {
    dailyCases =  data.dailyCases;
    unknownCases = data.Unknown;
    today = dailyCases.today;
    yesterday = dailyCases.yesterday;
    newCases = today - yesterday;
    percentIncrease = (newCases / yesterday) * 100;
  } 
})
console.log(unknownCases)


</script>

{#if dailyCases}
<div class="detail MoreDetailComponent">
<table class="detailTable">
  <tr>
    <td>Today's Total:</td>
    <td>{today.toLocaleString()}</td>
  </tr>
  <tr>
    <td>Yesterday's Total (Noon):</td>
    <td>{yesterday.toLocaleString()}</td>
  </tr>
  <tr>
    <td>New Cases:</td>
    <td>{newCases.toLocaleString()} </td>
  </tr>
  <tr>
    <td>Percent Increase:</td>
    <td>{percentIncrease.toFixed(2)}%</td>
  </tr>
  <tr>
    <td>County "Unknown":</td>
    <td>{unknownCases.toLocaleString()}</td>
  </tr>
</table>
</div>
{/if}

<style>
  div.detail {
    background-color: black;
    color: white;
  }

  table.detailTable {
    width: 100%;
  }
  table.detailTable > tr > td:first-child {
    font-weight: bold;
  }

  table.detailTable > tr > td:last-child {
    text-align: right;
  }
  /*
  See App.svelte for global styles for div.detail.
  */
</style>