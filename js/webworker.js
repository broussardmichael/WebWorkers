onmessage = function(message) {
    const data = message.data;
    retrieveDataToWorkOnPromise(data).then(function(retrievedData) {
        let updatedData = operateOnData(retrievedData)
        postMessage({type: "complete", message: `${self.name} completed its work.`, data:updatedData});
    }).catch(function(e) {
        throw `Failure is retrieving data: ${e}`
    });
}

self.onerror = function(e) {
    console.log(`${self.name} threw an error: ${e}`);
    e.preventDefault();
};

self.onunhandledrejection = function(e) {
    console.log(`${self.name} threw an unhandled rejection:${e}`);
    e.preventDefault();
}

function retrieveDataToWorkOnPromise (data) {
    return new Promise(function(resolve, reject) {
        if(typeof data === 'string') {
            return fetch(data);
        } else if(Array.isArray(data)) {
            resolve(data);
        } else {
            reject();
        }
    });
}

function operateOnData(data) {
    let returnArr = [];
    for(let i = 0; i < data.length; i++) {
        let updateValue = data[i];
        for(let j = 0; j < 10000; j++){
            for(let k = 0; k < 10000; k++) {
                updateValue = updateValue + i + j - k;
            }
        }
        returnArr.push(updateValue);
    }
    return returnArr;
}