export default class Main {
    constructor(content){
        this.contentWindow = content;
    }
    run(numberOfWorkers) {
        let workers = parseInt(numberOfWorkers);
        if(isNaN(workers) || workers > 4)
            throw "Number of workers must be a number and less than 4";

        this.addContentEntry("Number of Threads:" + workers);
    }
    addContentEntry(text) {
        let paragraph = document.createElement("p");
        let textNode = document.createTextNode(text);
        paragraph.appendChild(textNode);
        this.contentWindow.appendChild(paragraph);
    }
}