export default class WorkerPool {
    constructor(logFn) {
        this.initialized = false;
        this.idleWorkers = [];
        this.activeWorkers = new Map();
        this.numberOfJobs = 0;
        this.numberOfJobsCompleted = 0;
        this.logFn = typeof logFn === 'function' ? logFn : text => {console.log(text)};
    }
    init(numberOfWorkers, workerSourceFile){
        if(this.initialized)
            this._reset();
        else
            this.initialized = true;

        for(let i = 0; i < numberOfWorkers; i++) {
            let worker = new Worker(workerSourceFile, {
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
        this.logFn(`Worker Pool Initialized: Workers: ${this.idleWorkers.length} WorkerSource: ${workerSourceFile}`);
        return this;
    }
    _reset(){
        this.idleWorkers = [];
        this.activeWorkers.clear();
        this.numberOfJobs = 0;
        this.numberOfJobsCompleted = 0;
    }
    _workerDone(worker, error, response){
        let {resolver, rejector} = this.activeWorkers.get(worker);
        this.activeWorkers.delete(worker);
        this.idleWorkers.push(worker);
        error === null ? resolver(response) : rejector(error);
    }
    run(data){
        this.logFn(`Doing Stuff!`);
        for(let i = 0; i < data.length; i++) {
            this.numberOfJobs += 1;
            this.addWork(data[i]).then(response => {
                this.numberOfJobsCompleted++;
                this.logFn(`${response.message}. The returned data set is: ${response.data}`);
                if(this.isWorkFinished()){
                    this.logFn(`All work is complete, terminating web workers. Thanks guys!`);
                    this.terminateWorkerPool();
                }
            }).catch(error => {
                this.logFn(`Error: ${error}`);
            });
        }
    }
    addWork(work) {
        return new Promise( (resolve, reject) => {
            let activeWorkers = this.activeWorkers;
            if (this.idleWorkers.length === 0) {
                this.logFn(`All workers are busy!`)
                this.waitForWorker(function (worker, interval) {
                    clearInterval(interval);
                    activeWorkers.set(worker, {resolver:resolve, rejector: reject});
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
        let self = this;
        let idleWorkers = this.idleWorkers;
        let interval = setInterval(function () {
            if(idleWorkers.length > 0) {
                self.logFn(`A Worker is available!`)
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