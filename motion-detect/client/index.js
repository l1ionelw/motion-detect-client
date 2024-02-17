API_URL = "http://98.42.152.32:2500/"
var statbox = document.getElementById("status-box")

console.log("Script loaded")
setInterval(() => {
    getStatus()
}, 1000);

function getStatus() {
    fetch(API_URL).then((resp) => resp.json()).then((json) => { changeBox(json) })
}
function changeBox(json) {
    if (json.motion === null) {
        statbox.classList.remove("red")
        statbox.classList.remove("green")
        statbox.classList.add("blue")
    }
    if (json.motion === 0) {
        // no one detected
        statbox.classList.remove("red")
        statbox.classList.remove("blue")
        statbox.classList.add("green")

    }
    if (json.motion > 0) {
        // someone detected
        statbox.classList.remove("green")
        statbox.classList.remove("blue")
        statbox.classList.add("red")
    }
}