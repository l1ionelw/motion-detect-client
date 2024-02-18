API_URL = "http://98.42.152.32:2500"
var statbox = document.getElementById("status-box")

console.log("Script loaded")

/*

Notification.requestPermission((result) => {
    console.log(result);
});
*/


setInterval(() => {
    getStatus()
}, 1000);

function getStatus() {
    fetch(API_URL).then((resp) => resp.json()).then((json) => {
        changeBox(json)
    })
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
        newNotification("Motion Detected")
    }

    function newNotification(content) {
        console.log("sending notif")
        const notification = new Notification("Motion Detect", {body: content});
        new Notification("helo")
    }
}

window.addEventListener("keydown", (event) => {
    console.log("Key pressed " + event.key)
    if (event.key === "r") {
        fetch(`${API_URL}/renew`)
    }
    if (event.key === "n") {
        fetch(`${API_URL}/start`)
    }
    if (event.key === "m") {
        fetch(`${API_URL}/stop`)
    }

    // do something
});