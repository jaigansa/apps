/* Import title */
var newtitle = document.getElementById("appname");
var title = "Labour Estimate";
newtitle.innerHTML = title;
newtitle.style.cssText = " ";

// Variables get
var workhrs = document.getElementById("workHrs");
var workamt = document.getElementById("workamount");
var persons = document.getElementById("noofperson");
var display = document.getElementById("output");

// manual values
let profitpercent = 0.25;

function calculate() {
    display.innerHTML = "";
    profit = workhrs.value * workamt.value * persons.value * profitpercent; // profit add 25prercent
    results = workhrs.value * workamt.value * persons.value + profit;
    display.innerHTML = results + "/-";

}
function reset() {
    display.innerHTML = "";
    workhrs.value = "";
    workamt.value = "";
    persons.value = "";
}


// tools import from json file

let handtools,
    powertools,
    heavytools = [],
    alltools = {};

let toolsdb = function () {
    fetch("res/tools.json").then((response) => {
        return response.json();
    }).then((data) => { // console.log(data);
        handtools = data.handtools;
        powertools = data.powertools;
        heavytools = data.heavytools;
        alltools = data;
        newTool();
        typetools();
    }).catch((err) => { // Do something for an error here
    });

    /* this end fetch */
};
