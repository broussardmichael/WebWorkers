import Main from "./main-thread.js";

const runBtn = document.getElementById("run");
const content = document.getElementById("console");
const driver = new Main(content);

runBtn.addEventListener("click", function(){
    let input = document.getElementById("numOfWorkersInput");
    driver.run(input.value, content);
});

window.addEventListener('error', function(event) {
    driver.addContentEntry("An error occurred");
});
