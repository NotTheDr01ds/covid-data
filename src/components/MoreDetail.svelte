<script>

//export let unknownCases;
export let dailyCases;
export let unknownCases;
console.log(unknownCases)

let today = dailyCases.today;
let yesterday = dailyCases.yesterday;
let newCases = today - yesterday;
let percentIncrease = (newCases / yesterday) * 100;

</script>

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