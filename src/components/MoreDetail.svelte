<script>

//export let unknownCases;
export let dailyCases;

let today = dailyCases.today;
let yesterday = dailyCases.yesterday;
let newCases = today - yesterday;
let percentIncrease = (newCases / yesterday) * 100;

</script>

<div class="detail MoreDetailComponent">
  <p><strong>Today's Total:</strong> {today.toLocaleString()}</p>
  <p><strong>Yesterday's Total (Noon):</strong> {yesterday.toLocaleString()}</p>
  <p><strong>New Cases: </strong>{newCases.toLocaleString()}</p>
  <p><strong>Percent Increase:</strong> {percentIncrease.toFixed(2)}%</p>
</div>

<style>
  div.detail {
    text-align: center;
    background-color: black;
    color: white;
  }
  /*
  See App.svelte for global styles for div.detail.
  */
</style>