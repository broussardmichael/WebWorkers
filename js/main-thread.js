export default class Main {
    constructor(content){
        this.contentWindow = content;
    }
    run(numberOfWorkers) {
        let contentWindow = this.contentWindow;
        let workers = parseInt(numberOfWorkers);
        if(isNaN(workers) || workers > 4)
            throw "Number of workers must be a number and less than 4";

        addContentEntry(contentWindow,`Main Thread: Creating ${workers} workers`);
        setTimeout(function(){
            addContentEntry(contentWindow,`Set Timeout 1 Callback`);
        }, 1000);
    }
    addContentEntry = addContentEntry
}

class WorkerPool {
    constructor(numWorkers, workerSource) {
        this.idleWorkers = [];
        this.workQueue = [];

        
    }
}

function addContentEntry(contentWindow, text) {
    let paragraph = document.createElement("p");
    let textNode = document.createTextNode(text);
    paragraph.appendChild(textNode);
    contentWindow.appendChild(paragraph);
}

function addWorker(){

}