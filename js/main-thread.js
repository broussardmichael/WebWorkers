export default class Main {
    constructor(content, workerSource){
        contentWindow = content;
        this.workerSource = workerSource;
    }
    run(runParameters) {
        const {numOfWorkers, data} = runParameters;
        let parsedNumOfWorkers = parseInt(numOfWorkers);
        if(isNaN(parsedNumOfWorkers) || parsedNumOfWorkers > 4)
            throw "Number of workers must be a number and less than 4";

        addContentEntry(`Main Thread: Creating ${parsedNumOfWorkers} workers`);
        let workerPool = new WorkerPool(parsedNumOfWorkers, data.length, this.workerSource);
        for(let i = 0; i < data.length; i++) {
            workerPool.addWork(data[i]).then(response => {
                addContentEntry(`${response.worker} finished with this dataset! ${response.data.toString()}`);
                if(workerPool.isWorkFinished()){
                    addContentEntry(`All work is complete, terminating web workers. Thanks guys!`);
                    workerPool.terminateWorkerPool();
                }
            }).catch(error => {
                addContentEntry(`Error: ${error}`);
            });
        }
        setTimeout(function(){
            addContentEntry(`Random Set Timeout 1 Callback`);
        }, 1000);
    }
    addContentEntry = addContentEntry
}

class WorkerPool {
    constructor(numWorkers, numberOfJobs, workerSource) {
        this.idleWorkers = [];
        this.activeWorkers = new Map();
        this.numberOfJobs = numberOfJobs;
        this.numberOfJobsCompleted = 0;

        for(let i = 0; i < numWorkers; i++) {
            let worker = new Worker(workerSource, {
                name : `Worker ${i}`
            });
            this.idleWorkers.push(worker);
            worker.onmessage = message => {
                this._workerDone(worker, null, message.data);
            }
            worker.onerror = error => {
                this._workerDone(worker, error, null);
            }
        }
    }
    _workerDone(worker, error, response){
        const {name, updatedData} = response;
        let [resolver, rejector] = this.activeWorkers.get(worker);
        this.activeWorkers.delete(worker);
        this.idleWorkers.push(worker);
        error === null ? resolver({worker: name, data: updatedData}) : rejector(error);
    }
    addWork(work) {
        return new Promise( (resolve, reject) => {
            let activeWorkers = this.activeWorkers;
            if(!Array.isArray(work)) {
                reject("Work is not an array");
            }
            if (this.idleWorkers.length === 0) {
                addContentEntry(`All workers are busy!`)
                this.waitForWorker(function (worker, interval) {
                    clearInterval(interval);
                    activeWorkers.set(worker, [resolve, reject]);
                    worker.postMessage(work);
                });
            } else {
                let worker = this.idleWorkers.pop();
                activeWorkers.set(worker, {resolver:resolve, rejector: reject});
                worker.postMessage(work);
            }
        });
    }
    waitForWorker(callback) {
        let idleWorkers = this.idleWorkers;
        let interval = setInterval(function () {
            if(idleWorkers.length > 0) {
                addContentEntry(`A Worker is available!`)
                let worker = idleWorkers.pop();
                callback(worker, interval);
            }
        }, 1000);
    }
    isWorkFinished(){
        return this.numberOfJobsCompleted === this.numberOfJobs
    }
    terminateWorkerPool(){
        for(let i = 0; i < this.idleWorkers.length; i++) {
            let worker = this.idleWorkers[i];
            worker.terminate();
        }
    }
}

let contentWindow;

function addContentEntry(text) {
    let paragraph = document.createElement("p");
    let textNode = document.createTextNode(text);
    paragraph.appendChild(textNode);
    contentWindow.appendChild(paragraph);
}