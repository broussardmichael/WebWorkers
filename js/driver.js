import Main from "./main-thread.js";

const runBtn = document.getElementById("run");
const contentWindow = document.getElementById("console");
const driver = new Main(contentWindow, "js/webworker.js");

function mapToJSON(value){
    return JSON.parse(value);
}

runBtn.addEventListener("click", function(){
    let numOrWorkersInput = document.getElementById("numOfWorkersInput");
    let dataInput = document.getElementById("dataToWorkOn");
    let listOfDataSets = dataInput.value.split("|").map(mapToJSON);
    try {
        driver.run({numOfWorkers: numOrWorkersInput.value, data: listOfDataSets});
    } catch (e) {
        driver.addContentEntry(`Error: ${e.message}`);
    }
});

window.addEventListener('error', function(event) {
    driver.addContentEntry(`Error: ${event.message}`);
});
