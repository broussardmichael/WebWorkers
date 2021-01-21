import WorkerPool from "./worker-pool.js";

const runBtn = document.getElementById("run");
const contentWindow = document.getElementById("console");
let workerPool;

runBtn.addEventListener("click", function(){
    contentWindow.innerHTML = "";
    let numOrWorkersInput = document.getElementById("numOfWorkersInput");
    let dataInput = document.getElementById("dataToWorkOn");
    if(!dataInput.value) {
        throw `Message is empty`;
    }
    try {
        if(!workerPool) {
            workerPool = new WorkerPool(addContentEntry);
        }
        workerPool.init(numOrWorkersInput.value, "js/webworker.js")
            .run(dataInput.value);
    } catch (e) {
        addContentEntry(`Error: ${e.message}`);
    }
});

window.addEventListener('error', function(event) {
    addContentEntry(`Error: ${event.message}`);
});

function mapToJSON(value){
    return JSON.parse(value);
}

function addContentEntry(text) {
    let paragraph = document.createElement("p");
    let textNode = document.createTextNode(text);
    paragraph.appendChild(textNode);
    contentWindow.appendChild(paragraph);
}
